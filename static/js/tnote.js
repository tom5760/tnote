function getItem(path) {
    console.log('Requesting:', path);
    $.getJSON(path, function(data) {
        console.log('Got note:', data);
        var note = $('.note:last').clone(true, true);

        fillNote(note, data);

        note.find('.render article a').click(wikiLink);
        note.find('.editbutton').click(function() {
            note.find('.render').hide();
            note.find('.edit').show();
        });

        note.find('.cancelbutton').click(function() {
            note.find('.edit').hide();
            note.find('.render').show();
            fillNote(note, data);
        });

        note.find('.donebutton').click(function() {
            note.find('.edit').hide();
            note.find('.render').show();
            note.find('.edit form').submit();
        });

        note.find('.closebutton').click(function() {
            note.remove();
        });

        note.find('.closeothersbutton').click(function() {
            $('.note').not(':last').not(note).remove();
        });

        note.find('.edit form').attr('action', '/note/' + data.title);
        note.find('.edit form').submit(function() {
            console.log('Submitting...');
            var form = jQuery(this);
            $.post(form.attr('action'), form.serialize(), function(data) {
                console.log('Done!');
                fillNote(note, data);
            });
            return false;
        });

        note.show();
        note.find('.edit').hide();
        $('#notebook').prepend(note)
    });
}

function fillNote(note, data) {
    note.find('.render header > p').empty().append(data.title);
    note.find('.edit header input').val(data.title);

    note.find('.render article').empty().append(data.html);
    note.find('.edit article textarea').val(data.raw);

    if (data.attachments.length > 0) {
        note.find('.render footer ul').empty();
        $.each(data.attachments, function(i) {
            note.find('.render footer ul').append(
                '<li><a href=\'#\'>' + data.attachments[i].name
                + '</a></li>');
        });
    } else {
        note.find('.render footer').hide();
    }

}

function wikiLink() {
    var external_re = /^http:\/\//i;
    var internal_re = /^\//;
    var href = jQuery(this).attr('href');
    console.log(href);
    if (external_re.test(href)) {
        // External link
        console.log('External link');
        event.target.target = '_blank';
    } else if (internal_re.test(href)) {
        // Internal link
        console.log('Internal link');
        event.preventDefault();
        getItem(href);
    } else {
        // leave it alone...
    }
}

$(document).ready(function() {
    // Hide the starting template note.
    $('.note').hide();

    // Initialize the tabs widget in the sidebar.
    $('#menu').tabs();

    $('#new-note-button').button({
        icons: {primary: 'ui-icon-document'},
        text: false,
    });
    $('#new-journal-button').button({
        icons: {primary: 'ui-icon-calendar'},
        text: false,
    });
    $('#options-button').button({
        icons: {primary: 'ui-icon-wrench'},
        text: false,
    });

    $('#new-note-dialog').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Create Note": function() {
                $(this).dialog("close");
            },
            "Cancel": function() {
                $(this).dialog("close");
            },
        },
        close: function() {
            $(this).find('input').val('');
        },
    });

    $('#new-note-button').click(function() {
        $('#new-note-dialog').dialog("open");
    });

    $('#menu div ul a').click(wikiLink);

    getItem('/note/start');
});
