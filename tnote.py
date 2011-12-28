#!/usr/bin/env python3
'''
    tnote - Simple personal wiki system.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import sys

import misaka

from gi.repository import Gtk, WebKit

UI_MAIN_WINDOW = 'main_window.xml'

ID_MAIN_WINDOW = 'main_window'
ID_NOTE_BOX = 'note_box'

def navigation(view, frame, request, navigation_action, policy_decision):
    #print(view, frame, request, navigation_action, policy_decision)
    policy_decision.ignore()
    print(request.get_uri())

def main(argv):
    builder = Gtk.Builder()
    builder.add_from_file(UI_MAIN_WINDOW)

    main_window = builder.get_object(ID_MAIN_WINDOW)
    main_window.connect('destroy', Gtk.main_quit)

    note_box = builder.get_object(ID_NOTE_BOX)

    web_settings = WebKit.WebSettings(enable_default_context_menu=False)

    web_view = WebKit.WebView(settings=web_settings)
    note_box.add(web_view)

    web_view.load_string(misaka.html('This is [an example](http://example.com/ "Title") inline link.'), 'text/html', 'UTF-8', '/')
    web_view.set_maintains_back_forward_list(False)
    web_view.connect('navigation-policy-decision-requested', navigation)

    main_window.show_all()
    Gtk.main()

if __name__ == '__main__':
    sys.exit(main(sys.argv))
