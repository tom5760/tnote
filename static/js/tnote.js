$(document).ready(function() {
    $('#accordion').accordion({header: 'h3', fillSpace: true});

    getNote = function(name) {
        $.getJSON('/note/' + name, function(data) {
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
        });
    }

    $('a.local').click(function(event) {
        event.preventDefault();
        link = jQuery(this);
        note = link.attr('href').split('/')[2];
        getNote(note);
    });

    $('.note').hide();
    getNote('start');
});
