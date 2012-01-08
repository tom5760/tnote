#!/usr/bin/env python3
'''
    tnote - Simple personal wiki system.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import json
import os
import os.path
import sys

import cherrypy
import misaka

class TNote(object):
    def __init__(self, notebook):
        super().__init__()
        self.notebook = notebook

    @cherrypy.expose
    def index(self):
        return self.static('index.html')

    @cherrypy.expose
    def static(self, *path):
        path = os.path.join(self.notebook.static_dir, *path)
        return cherrypy.lib.static.serve_file(path)

    @cherrypy.expose
    def note(self, name):
        cherrypy.response.headers['Content-Type'] = 'application/json'
        return bytes(json.dumps({
            'title': name,
            'content': self.notebook.load_note(name),
            'attachments': [
                {'name': 'foo.pdf'},
            ],
        }), 'utf-8')

class Notebook(object):
    def __init__(self, directory):
        self.directory = directory
        self.source_dir = os.path.join(directory, 'src')
        self.static_dir = os.path.join(directory, 'static')

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
    print('Starting server...')
    cherrypy.quickstart(TNote(notebook))

if __name__ == '__main__':
    sys.exit(main(sys.argv))
