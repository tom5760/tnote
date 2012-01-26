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
    });

    this.note.find('.cancel-button').button().click(function(event) {
        event.preventDefault();
        // Reset the form items
        that.title = that.title
        that.raw = that.raw
        /* If we don't have any HTML (this is a new note), close it when
         * cancelled. */
        if (that.html == null) {
            that.close();
        } else {
            that.showDisplay();
        }
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

    this.clearError();
}

Note.prototype = {
    prefix: '/note/',

    _title: null,
    get title() {
        return this._title;
    },
    set title(title) {
        this._title = title;
        this.note.attr('id', 'note-' + title);
        this.note.find('.note-edit form').attr('action', this.prefix + title);
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

    _raw: "This page does not exist.",
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

    load: function(name) {
        $.ajax({
            context: this,
            url: this.prefix + name,
            dataType: 'json',
            context: this,
            success: function(data) {
                $.extend(this, data);
            },
            error: function(request) {
                if (request.status == 404) {
                    this.title = name;
                    this.showEdit();
                } else {
                    console.log('Unknown loading error:', request.status);
                }
            },
        });
        return this;
    },

    save: function() {
        var form = this.note.find('.note-edit form');
        var title = this.note.find('.note-edit header input').val();

        this.clearError();

        if (title.length == 0) {
            console.log('Invalid title!');
            this.addError('Invalid title');
            return;
        }

        var action = form.attr('action');
        if (action == '#') {
            action = this.prefix
                     + this.note.find('.note-edit header input').val();
        }

        $.ajax({
            context: this,
            type: 'POST',
            url: action,
            data: form.serialize(),
            success: function(data) {
                $.extend(this, data);
                this.clearError();
                this.showDisplay();
            },
            error: function(request) {
                this.addError('Save failed!  Error:' + request.status);
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

    addError: function(message) {
        this.note.find('.note-edit .ui-state-error ul')
            .append('<li>' + message + '</li>');
        this.note.find('.note-edit .ui-state-error').slideDown();
    },

    clearError: function() {
        this.note.find('.note-edit .ui-state-error ul').empty();
        this.note.find('.note-edit .ui-state-error').hide();
    },
}

function wikiLink(event) {
    var external_re = /^http:\/\//i;
    var internal_re = /^\//;
    var note_re = /^\/note\/(.*)/;
    var href = $(this).attr('href');
    if (external_re.test(href)) {
        // External link
        event.target.target = '_blank';
    } else if (internal_re.test(href)) {
        // Internal link
        event.preventDefault();
        if (note_re.test(href)) {
            var name = note_re.exec(href)[1];
            new Note().open().showDisplay().load(name);
        } else {
            console.log('Unknown internal link href:', href);
        }
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
    }).click(function(event) {
        var note = new Note();
        var date = new Date();
        var month = date.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        note.title = date.getFullYear() + '-' + month + '-'
                     + date.getDate();
        note.open().showEdit();
    });

    $('#options-button').button({
        icons: {primary: 'ui-icon-wrench'},
        text: false,
    });

    $('#menu div ul a').click(wikiLink);

    new Note().open().showDisplay().load('Start');
});
