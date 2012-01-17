function getItem(path) {
    console.log('Requesting:', path);
    $.getJSON(path, function(data) {
        console.log('Got note:', data);
        var note = $('.note:last').clone(true, true);

        note.find('.render header > p').append(data.title);
        note.find('.edit header input').val(data.title);

        note.find('.render article').append(data.content);
        note.find('.edit article textarea').val(data.content);

        if (data.attachments.length > 0) {
            $.each(data.attachments, function(i) {
                note.find('.render footer ul').append(
                    '<li><a href=\'#\'>' + data.attachments[i].name
                    + '</a></li>');
            });
        } else {
            note.find('.render footer').hide();
        }

        note.find('.render article a').click(wikiLink);

        note.find('.editbutton').click(function() {
            note.find('.render').hide();
            note.find('.edit').show();
        });

        note.find('.donebutton').click(function() {
            note.find('.edit').hide();
            note.find('.render').show();
        });

        note.find('.closebutton').click(function() {
            note.remove();
        });

        note.find('.closeothersbutton').click(function() {
            $('.note').not(':last').not(note).remove();
        });

        note.show();
        note.find('.edit').hide();
        $('#notebook').prepend(note)
    });
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
    // Initialize the accordion widget in the sidebar.
    $('#accordion').accordion({header: 'h3', fillSpace: true});

    // Hide the starting template note.
    $('.note').hide();

    $('#accordion ul a').click(wikiLink);

    getItem('/note/start');
});
