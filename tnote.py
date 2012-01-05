#!/usr/bin/env python3
'''
    tnote - Simple personal wiki system.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import sys
import os
import os.path

import misaka

from gi.repository import Gtk, WebKit

class TNote(object):
    UI_MAIN_WINDOW = 'main_window.xml'
    ID_MAIN_WINDOW = 'main_window'
    ID_NOTE_BOX = 'note_box'

    def __init__(self, notebook):
        self.notebook = notebook
        self.builder = Gtk.Builder()
        self.builder.add_from_file(TNote.UI_MAIN_WINDOW)


    def init_ui(self):
        main_window = self.builder.get_object(TNote.ID_MAIN_WINDOW)
        main_window.connect('destroy', Gtk.main_quit)
        self.load_note('start')
        main_window.show_all()

    def load_note(self, note):
        note_box = self.builder.get_object(TNote.ID_NOTE_BOX)

        frame = Gtk.Frame(label=note.capitalize())
        note_box.add(frame)

        web_settings = WebKit.WebSettings(enable_default_context_menu=False)

        web_view = WebKit.WebView(settings=web_settings)
        frame.add(web_view)

        web_view.load_string(self.notebook.load_note(note), 'text/html',
                             'UTF-8', '/')

        web_view.set_maintains_back_forward_list(False)
        web_view.connect('navigation-policy-decision-requested',
                         self.navigation)

    def navigation(self, view, frame, request, navigation_action, policy_decision):
        #print(view, frame, request, navigation_action, policy_decision)
        policy_decision.ignore()
        print(request.get_uri())

class Notebook(object):
    def __init__(self, directory):
        self.directory = directory
        self.source_dir = os.path.join(directory, 'src')

    def load_note(self, note):
        path = os.path.join(self.source_dir, note) + '.md'
        print('Loading file "{}"'.format(path))
        with open(path) as f:
            page = misaka.html(f.read(None))
        return page

def main(argv):
    if len(argv) > 2:
        print('Usage: {} [ NOTEBOOK_DIR ]'.format(argv[0]))
        return 1
    elif len(argv) == 2:
        notebook_dir = os.path.abspath(argv[1])
    else:
        notebook_dir = os.getcwd()

    notebook = Notebook(notebook_dir)
    tnote = TNote(notebook)
    tnote.init_ui()
    Gtk.main()

if __name__ == '__main__':
    sys.exit(main(sys.argv))
