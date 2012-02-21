(function($) {
    $.widget('tnote.block', {
        // default options
        options: {
        },

        _prefix: '',

        _create: function() {
            var that = this;

            console.log('Create', this.element);

            this.element.addClass('tnote ' + this._class);
            this._initDisplay();
        },

        _setOption: function(key, value) {
            console.log('setOption', key, value);
            switch (key) {
            }
            $.Widget.prototype._setOption.call(this, key, value)
        },

        _destroy: function() {
            console.log('destroy');
        },

        _initDisplay: function() {
            this._display = $('<div class="tnote-display">')
                .appendTo(this.element);
            this._initHeader(this._display);
            this._initBody(this._display);
            this._initFooter(this._display);
        },

        _initHeader: function(display) {
            var header = $('<header class="ui-widget-header">')
                .appendTo(display);
            this._initDisplayToolbar(header);
            this._displayTitle = $('<h1>').appendTo(header);
        },

        _initBody: function(display) {
            this._displayBody = $('<article>').appendTo(display);
        },

        _initFooter: function(display) {
            this._displayFooter = $('<footer>').appendTo(display);
        },

        _initDisplayToolbar: function(header) {
            this._displayToolbar = $('<span>').appendTo(header);
            var that = this;
            $('<button>Close Others</button>')
                .appendTo(this._displayToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.removeOthers();
                });
            $('<button>Close</button>')
                .appendTo(this._displayToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.element.remove();
                });
        },

        _setData: function(data) {
            this.setTitle(data.title);
            this.setBody(data.body);
        },

        _loadError: function(name, request) {
            console.log('Error:', request);
        },

        load: function(name) {
            console.log('Load:', name);
            $.ajax({
                context: this,
                url: this._prefix + name,
                dataType: 'json',
                success: function(data) {
                    console.log('Success:', data);
                    this._setData(data);
                },
                error: function(request) {
                    this._loadError(name, request);
                },
            });
            return this;
        },

        removeOthers: function() {
            $('.note').not(this.element).remove();
            return this;
        },

        getTitle: function() {
            return this._title;
        },
        setTitle: function(title) {
            this._title = title;
            $(this.element).attr('id', this._class + '-' + title);
            this._displayTitle.empty().append(title);
            return this;
        },

        getBody: function() {
            return this._body;
        },
        setBody: function(body) {
            this._body = body;
            this._displayBody.empty().append(body);
            return this;
        },
    });

    $.widget('tnote.tag', $.tnote.block, {
        _prefix: '/tag/',
        _class: 'tag',

        setTitle: function(title) {
            $.tnote.block.prototype.setTitle.call(this, title);
            this._displayTitle.empty().append('Tag: ' + title);
            return this;
        }
    });

    $.widget('tnote.note', $.tnote.block, {
        _prefix: '/note/',
        _class: 'note',

        _create: function() {
            $.tnote.block.prototype._create.call(this);
            this._initEdit();
            this._edit.hide();
        },

        _initFooter: function(display) {
            $.tnote.block.prototype._initFooter.call(this, display);
            this._initDisplayAttachments(this._displayFooter);
            this._initDisplayTags(this._displayFooter);
        },

        _initDisplayToolbar: function(header) {
            $.tnote.block.prototype._initDisplayToolbar.call(this, header);
            var that = this;
            $('<button>Edit</button>')
                .prependTo(this._displayToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.showEdit();
                });
        },

        _initDisplayAttachments: function(footer) {
            this._displayAttachments = $('<ul>')
                .wrap('<span class="tnote-attachments">Attachments:</span>');
            this._displayAttachments.parent().appendTo(footer);
        },

        _initDisplayTags: function(footer) {
            this._displayTags = $('<ul>')
                .wrap('<span class="tnote-tags">Tags:</span>');
            this._displayTags.parent().appendTo(footer);
        },

        _initEdit: function() {
            this._edit = $('<div class="tnote-edit">')
                .appendTo(this.element);
            this._editForm = $('<form action="#" method="POST">')
                .appendTo(this._edit);
            this._initEditHeader(this._editForm);
            this._initEditBody(this._editForm);
            this._initEditFooter(this._editForm);
        },

        _initEditHeader: function(edit) {
            var header = $('<header class="ui-widget-header">').appendTo(edit);
            this._initEditToolbar(header);
            this._editTitle = $('<input type="text" name="title" required/>')
                .wrap('<p>Title: </p>');
            this._editTitle.parent().appendTo(header);
        },

        _initEditBody: function(edit) {
            this._editBody = $('<textarea name="body"></textarea>')
                .wrap('<article/>');
            this._editBody.parent().appendTo(edit);
        },

        _initEditFooter: function(edit) {
            this._editFooter = $('<footer>').appendTo(edit);
            this._initEditAttachments(this._editFooter);
            this._initEditTags(this._editFooter);
        },

        _initEditToolbar: function(header) {
            this._editToolbar = $('<span>').appendTo(header);
            var that = this;
            $('<button>Done</button>')
                .appendTo(this._editToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.save();
                });
            $('<button>Cancel</button>')
                .appendTo(this._editToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    /* If there is no body (because this is a brand new note),
                     * and we cancel, close the note. */
                    if (that.getBody() == null) {
                        that.close();
                    } else {
                        that.resetForm();
                        that.showDisplay();
                    }
                });
            $('<button>Close Others</button>')
                .appendTo(this._editToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.removeOthers();
                });
            $('<button>Close</button>')
                .appendTo(this._editToolbar)
                .button()
                .click(function(event) {
                    event.preventDefault();
                    that.remove();
                });
        },

        _initEditAttachments: function(footer) {
            this._editAttachments = $('<ul>')
                .wrap('<span class="tnote-attachments">Attachments:</span>');
            this._editAttachments.parent().appendTo(footer);
        },

        _initEditTags: function(footer) {
            this._editTags = $('<input type="text" name="tags"/>')
                .wrap('<span class="tnote-tags">Tags:</span>');
            this._editTags.parent().appendTo(footer);
        },

        _setData: function(data) {
            $.tnote.block.prototype._setData.call(this, data);
            this.setRaw(data.raw);
            this.setAttachments(data.attachments);
            this.setTags(data.tags);
        },

        _loadError: function(name, request) {
            if (request.status == 404) {
                this.setTitle(name);
                this.showEdit();
            } else {
                $.tnote.block.prototype._loadError.call(this, request);
            }
        },

        save: function() {
            console.log('Save');
            if (this._editTitle.val().length == 0) {
                console.log('Invalid title!');
                return;
            }
            var title = this.getTitle();
            if (typeof title == 'undefined') {
                title = this._editTitle.val();
            }

            $.ajax({
                context: this,
                type: 'POST',
                url: this._prefix + title,
                data: this._editForm.serialize(),
                success: function(data) {
                    console.log('Success:', data);
                    this._setData(data);
                    this.showDisplay();
                },
                error: function(request) {
                    console.log('Error:', request);
                },
            });
            return this;
        },

        showDisplay: function() {
            this._edit.hide();
            this._display.show();
            return this;
        },

        showEdit: function() {
            this._display.hide();
            this._edit.show();
            return this;
        },

        resetForm: function() {
            this.setTitle(this.getTitle());
            this.setRaw(this.getRaw());
            this.setAttachments(this.getAttachments());
            this.setTags(this.getTags());
            return this;
        },

        setTitle: function(title) {
            $.tnote.block.prototype.setTitle.call(this, title);
            this._editTitle.val(title);
            return this;
        },

        getRaw: function() {
            return this._raw;
        },
        setRaw: function(raw) {
            this._raw = raw;
            this._editBody.val(raw);
            return this;
        },

        getAttachments: function() {
            return this._attachments;
        },
        setAttachments: function(attachments) {
            this._attachments = attachments;
            this._displayAttachments.empty();
            if (attachments.length == 0) {
                this._displayAttachments.parent().hide();
            } else {
                this._displayAttachments.parent().show();
                var that = this;
                $.each(attachments, function(i) {
                    that._displayAttachments.append('<li><a href="#">' + this.name + '</a></li>');
                });
            }
            return this;
        },

        getTags: function() {
            return this._tags;
        },
        setTags: function(tags) {
            this._tags = tags;

            // Refresh the tags tab on the sidebar
            $('#menu').tabs('load', 1);

            // Refresh any tag pages open
            $('#notebook > .tag').each(function (i) {
                $(this).tag('load', $(this).tag('getTitle'));
            });

            this._displayTags.empty();
            if (tags.length == 0) {
                this._displayTags.parent().hide();
            } else {
                this._displayTags.parent().show();
                var that = this;
                $.each(tags, function(i) {
                    that._displayTags.append('<li><a href="/tag/' + this + '">' + this + '</a></li>');
                });
                this._editTags.val(tags.join(', '));
            }
            return this;
        },
    });
}(jQuery));

/*
    open: function() {
        this.showDisplay();
        $('#notebook').prepend(this.note);
        return this;
    },

    close: function() {
        this.note.remove();
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

*/

$(document).ready(function() {
    function newTag() {
        return $('<div/>').tag().prependTo($('#notebook'));
    }

    function newNote() {
        return $('<div/>').note().prependTo($('#notebook'));
    }

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
            //event.target.href = 'http://google.com';
            if (note_re.test(href)) {
                var name = note_re.exec(href)[1];
                if ($('#note-' + name).length == 0) {
                    newNote().note('load', name);
                }
                location.href = '#note-' + name;
            } else if (tag_re.test(href)) {
                var name = tag_re.exec(href)[1];
                if ($('#tag-' + name).length == 0) {
                    newTag().tag('load', name);
                }
                location.href = '#tag-' + name;
            } else {
                console.log('Unknown internal link href:', href);
            }
        } else {
            // leave it alone...
        }
    }

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
        newNote().note('showEdit');
    });

    $('#new-journal-button').button({
        icons: {primary: 'ui-icon-calendar'},
        text: false,
    }).click(function(event) {
        var date = new Date();
        var month = date.getMonth() + 1;
        if (month < 10) {
            month = "0" + month;
        }
        newNote().note('setTitle',
            date.getFullYear() + '-' + month + '-' + date.getDate())
            .note('showEdit');
    });

    $('#options-button').button({
        icons: {primary: 'ui-icon-wrench'},
        text: false,
    });

    // Set up our link click handler
    $('body').on('click', 'a', wikiLink);

    newNote().note('load', 'Start');
});
