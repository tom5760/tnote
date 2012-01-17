function getItem(path) {
    console.log('Requesting:', path);
    $.getJSON(path, function(data) {
        console.log('Got note:', data);
        var note = $('.note:last').clone(true, true);
        note.find('header > p').append(data.title);
        note.find('article').append(data.content);

        if (data.attachments.length > 0) {
            $.each(data.attachments, function(i) {
                note.find('footer ul').append(
                    '<li><a href=\'#\'>' + data.attachments[i].name
                    + '</a></li>');
            });
        } else {
            note.find('footer').hide();
        }
        note.show();
        $('#notebook').prepend(note)
        note.find('article a').click(wikiLink);
        note.find('.close').click(function() {
            note.remove();
        });
        note.find('.closeothers').click(function() {
            $('.note').not(':last').not(note).remove();
        });
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
