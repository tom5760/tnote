function getItem(path) {
    console.log('Requesting:', path);
    $.getJSON(path, function(data) {
        console.log('Got note:', data);
        var note = $('.note:last').clone(true, true);
        note.find('header').append(data.title);
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
        fixLinks();
    });
}

function fixLinks() {
    $('a').click(function(event) {
        var href_re = /^http:\/\//i;
        var href = jQuery(this).attr('href');
        console.log(href);
        if (href_re.test(href)) {
            // External link
            console.log('External link');
            event.target.target = '_blank';
        } else {
            // Internal link
            console.log('Internal link');
            event.preventDefault();
            getItem(href);
        }
    });
}

$(document).ready(function() {
    // Initialize the accordion widget in the sidebar.
    $('#accordion').accordion({header: 'h3', fillSpace: true});

    // Hide the starting template note.
    $('.note').hide();

    getItem('/note/start');
});
