function Note() {
    // By convention, the last note div is hidden and cloned for new notes.
    this.note = $(this.template);

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

    this.clearError();
}

Note.prototype = {
    prefix: '/note/',

    template: "<div class='note'>"
            + "<div class='note-display'>"
                + "<header class='ui-widget-header'>"
                    + "<span>"
                        + "<button class='edit-button'>Edit</button>"
                        + "<button class='close-others-button'>Close Others</button>"
                        + "<button class='close-button'>Close</button>"
                    + "</span>"
                    + "<h1></h1>"
                + "</header>"
                + "<article></article>"
                + "<footer>"
                    + "<span class='attachments'>Attachments: <ul></ul></span>"
                    + "<span class='tags'>Tags: <ul></ul></span>"
                + "</footer>"
            + "</div>"
            + "<div class='note-edit'>"
                + "<form action='#' method='POST'>"
                    + "<header class='ui-widget-header'>"
                        + "<span>"
                            + "<button class='done-button'>Done</button>"
                            + "<button class='cancel-button'>Cancel</button>"
                            + "<button class='close-others-button'>Close Others</button>"
                            + "<button class='close-button'>Close</button>"
                        + "</span>"
                        + "<p>Title: <input type='text' name='title' required/></p>"
                    + "</header>"
                    + "<div class='ui-state-error'><ul></ul></div>"
                    + "<article><textarea name='body'></textarea></article>"
                    + "<footer>"
                        + "<span class='attachments'>Attachments: <ul></ul></span>"
                        + "<span class='tags'>Tags: <input type='text' name='tags'/></span>"
                    + "</footer>"
                + "</form>"
            + "</div>"
        + "</div>",

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
        var span = this.note.find('.note-display footer .attachments');
        var list = span.find('ul').empty();
        if (attachments.length > 0) {
            span.show();
            $.each(attachments, function(i) {
                list.append('<li><a href="#">' + attachments[i].name
                            + '</a></li>');
            });
        } else {
            span.hide();
        }
    },

    _tags: null,
    get tags() {
        return this._tags;
    },
    set tags(tags) {
        this._tags = tags;
        var span = this.note.find('.note-display footer .tags');
        var list = span.find('ul').empty();
        var input = this.note.find('.note-edit footer .tags input')
                    .val(tags.join(', '));

        // Refresh the tags tab on the sidebar
        $('#menu').tabs('load', 1);

        if (tags.length > 0) {
            span.show();
            $.each(tags, function(i) {
                list.append('<li><a href="#">' + tags[i] + '</a></li>');
            });
        } else {
            span.hide();
        }
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
};

function TagNote() {
    Note.call(this);
}
TagNote.prototype = Object.create(new Note(), {
    prefix: { value: '/tag/', writeable: true },

    template: { writable: true, value: "<div class='note'>"
            + "<div class='note-display'>"
                + "<header class='ui-widget-header'>"
                    + "<span>"
                        + "<button class='close-others-button'>Close Others</button>"
                        + "<button class='close-button'>Close</button>"
                    + "</span>"
                    + "<h1></h1>"
                + "</header>"
                + "<article></article>"
            + "</div>"
        + "</div>" },

    title: {
        set: function(title) {
            console.log(title);
            this._title = title;
            this.note.attr('id', 'tag-' + title);
            this.note.find('.note-display header > h1').empty().append('Tag: ' + title);
        },
    },
});

function wikiLink(event) {
    var external_re = /^http:\/\//i;
    var internal_re = /^\//;
    var note_re = /^\/note\/(.*)/;
    var tag_re = /^\/tag\/(.*)/;
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
        } else if (tag_re.test(href)) {
            var name = tag_re.exec(href)[1];
            new TagNote().open().showDisplay().load(name);
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
    $('#menu').tabs({
        ajaxOptions: {
            error: function(xhr, status, index, anchor) {
                $(anchor.hash).html('Error.');
            },
        },
    });

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

    $('body').on('click', 'a', wikiLink);

    new Note().open().showDisplay().load('Start');
});
