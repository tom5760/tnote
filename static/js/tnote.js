(function($) {
    $.widget('tnote.block', {
        // default options
        options: {
            name: '',
        },

        _prefix: '',
        _class: '',

        _create: function() {
            console.log('create');
            if (this.options.name != null) {
                this.load();
            }
        },

        _setOption: function(key, value) {
            console.log('setOption', key, value);
            $.Widget.prototype._setOption.call(this, key, value)
            if (key === 'name' && value != null) {
                this.load();
            }
        },

        _destroy: function() {
            console.log('destroy');
        },

        _initUI: function(html) {
            var element = $(html);
            this.element.empty();
            element.children().appendTo(this.element);

            this.element.addClass('tnote').addClass('tnote-' + this._class);
            var that = this;
            this.element.find('.tnote-button-close').button()
                .click(function(event) {
                    event.preventDefault();
                    that.element.remove();
                });
            this.element.find('.tnote-button-close-others').button()
                .click(function(event) {
                    event.preventDefault();
                    that.removeOthers();
                });
        },

        load: function() {
            console.log('Loading:', this.options.name);
            $.ajax({
                context: this,
                async: false,
                dataType: 'html',
                url: this._prefix + this.options.name,
                success: function(html) {
                    console.log('Success');
                    this._initUI(html);
                },
                error: function(request) {
                    console.log('Error:', request);
                },
            });
            return this;
        },

        removeOthers: function() {
            $('.tnote').not(this.element).remove();
            return this;
        },
    });

    $.widget('tnote.tag', $.tnote.block, {
        _prefix: '/tag/',
        _class: 'tag',
    });

    $.widget('tnote.note', $.tnote.block, {
        _prefix: '/note/',
        _class: 'note',

        _initUI: function(html) {
            $.tnote.block.prototype._initUI.call(this, html);
            this.showDisplay();

            // Refresh the tags tab on the sidebar
            $('#menu').tabs('load', 1);

            // Refresh any tag pages open
            console.log("A");
            $('#notebook > .tnote-tag').each(function (i) {
                console.log("B", this);
                $(this).tag('load', 1);
            });

            var that = this;
            this.element.find('.tnote-button-edit').button()
                .click(function(event) {
                    event.preventDefault();
                    that.showEdit();
                });
            this.element.find('.tnote-button-done').button()
                .click(function(event) {
                    event.preventDefault();
                    that.save();
                });
            this.element.find('.tnote-button-cancel').button()
                .click(function(event) {
                    event.preventDefault();
                    var title = that.element.find('.tnote-display header h1');
                    // If this is an empty note, close it instead
                    if (title.length == 0) {
                        that.element.remove();
                    } else {
                        that.load();
                        that.showDisplay();
                    }
                });
        },

        save: function() {
            var form = this.element.find('.tnote-edit form');
            var title = form.find('header input').val();
            var body = form.find('article textarea').val();
            var tags = form.find('.tnote-tags input').val();

            console.log('Save:', this.options.name, title);
            if (title.length == 0) {
                console.log('Invalid title!');
                return;
            }
            $.ajax({
                context: this,
                async: false,
                dataType: 'html',
                type: 'POST',
                url: this._prefix + this.options.name,
                data: form.serialize(),
                success: function(html) {
                    console.log('Success');
                    this._initUI(html);
                    this.showDisplay();
                },
                error: function(request) {
                    console.log('Error:', request);
                },
            });
            return this;
        },

        showDisplay: function() {
            this.element.find('.tnote-edit').hide();
            this.element.find('.tnote-display').show();
            return this;
        },

        showEdit: function() {
            this.element.find('.tnote-display').hide();
            this.element.find('.tnote-edit').show();
            return this;
        },
    });
}(jQuery));

$(document).ready(function() {
    function loadTag(name) {
        return $('<div/>').prependTo($('#notebook')).tag({name: name});
    }

    function loadNote(name) {
        return $('<div/>').prependTo($('#notebook')).note({name: name});
    }

    function newNote() {
        return $('<div/>').prependTo($('#notebook')).note();
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
            if (note_re.test(href)) {
                var name = note_re.exec(href)[1];
                if ($('#note-' + name).length == 0) {
                    loadNote(name);
                }
                location.href = '#note-' + name;
            } else if (tag_re.test(href)) {
                var name = tag_re.exec(href)[1];
                if ($('#tag-' + name).length == 0) {
                    loadTag(name);
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
        newNote().note('option', 'name',
            date.getFullYear() + '-' + month + '-' + date.getDate())
            .note('showEdit');
    });

    $('#options-button').button({
        icons: {primary: 'ui-icon-wrench'},
        text: false,
    });

    // Set up our link click handler
    $('body').on('click', 'a', wikiLink);

    loadNote('Start');
});
