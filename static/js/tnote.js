function Note() {
    // By convention, the last note div is hidden and cloned for new notes.
    this.note = $('.note:last').clone(true, true);

    var that = this;
    this.note.find('.edit-button').button().click(function(event) {
        event.preventDefault();
        that.showEdit();
    });
    this.note.find('.done-button').button().click(function(event) {
        event.preventDefault();
        that.note.find('.note-edit form').submit();
        that.showDisplay();
    });
    this.note.find('.cancel-button').button().click(function(event) {
        event.preventDefault();
        // Reset the form items
        that.title = that.title
        that.raw = that.raw
        that.showDisplay();
    });
    this.note.find('.close-others-button').button().click(function(event) {
        event.preventDefault();
        $('.note').not(':last').not(that.note).remove();
    });
    this.note.find('.close-button').button().click(function(event) {
        event.preventDefault();
        that.close();
    });

    this.note.find('.note-edit form').submit(function(event) {
        event.preventDefault();
        that.save();
    });

    this.note.find('.note-display article').on('click', 'a', wikiLink);
}

Note.prototype = {
    _title: null,
    get title() {
        return this._title;
    },
    set title(title) {
        this._title = title;
        this.note.find('.note-edit form').attr('action', '/note/' + title);
        this.note.find('.note-display header > h1').empty().append(title);
        this.note.find('.note-edit header input').val(title);
    },

    _html: null,
    get html() {
        return this._html;
    },
    set html(html) {
        this._html = html;
        this.note.find('.note-display article').empty().append(html);
    },

    _raw: null,
    get raw() {
        return this._raw;
    },
    set raw(raw) {
        this._raw = raw;
        this.note.find('.note-edit article textarea').val(raw);
    },

    _attachments: null,
    get attachments() {
        return this._attachments;
    },
    set attachments(attachments) {
        this._attachments = attachments;
        this.note.find('.note-display footer ul').empty();

        var that = this;
        $.each(attachments, function(i) {
            that.note.find('.note-display footer ul').append(
                '<li><a href="#">' + attachments[i].name + '</a></li>');
        });
    },

    note: null,

    load: function(path) {
        $.ajax({
            url: path,
            dataType: 'json',
            context: this,
            success: function(data) {
                $.extend(this, data);
            },
        });
        return this;
    },

    save: function() {
        var form = this.note.find('.note-edit form');

        console.log('Submitting...');
        $.ajax({
            context: this,
            type: 'POST',
            url: form.attr('action'),
            data: form.serialize(),
            success: function(data) {
                console.log('Done!');
                $.extend(this, data);
            },
        });
        return this;
    },

    open: function() {
        this.showDisplay();
        $('#notebook').prepend(this.note);
        return this;
    },

    close: function() {
        this.note.remove();
        return this;
    },

    showEdit: function() {
        this.note.show();
        this.note.find('.note-display').hide();
        this.note.find('.note-edit').show();
        return this;
    },

    showDisplay: function() {
        this.note.show();
        this.note.find('.note-edit').hide();
        this.note.find('.note-display').show();
        return this;
    },
}

function wikiLink(event) {
    var external_re = /^http:\/\//i;
    var internal_re = /^\//;
    var href = $(this).attr('href');
    if (external_re.test(href)) {
        // External link
        event.target.target = '_blank';
    } else if (internal_re.test(href)) {
        // Internal link
        event.preventDefault();
        new Note().load(href).open().showDisplay();
    } else {
        // leave it alone...
    }
}

$(document).ready(function() {
    // Hide the starting template note.
    $('.note').hide();

    // Initialize the tabs widget in the sidebar.
    $('#menu').tabs();

    // Initialize the toolbar buttons
    $('#new-note-button').button({
        icons: {primary: 'ui-icon-document'},
        text: false,
    }).click(function(event) {
        new Note().open().showEdit();
    });

    $('#new-journal-button').button({
        icons: {primary: 'ui-icon-calendar'},
        text: false,
    });
    $('#options-button').button({
        icons: {primary: 'ui-icon-wrench'},
        text: false,
    });

    $('#menu div ul a').click(wikiLink);

    //getItem('/note/start');
    new Note().load('/note/start').open().showDisplay();
});
