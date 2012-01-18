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
    def __init__(self, directory):
        super().__init__()
        self.directory = directory
        self.source_dir = os.path.join(directory, 'notes')
        self.static_dir = os.path.join(directory, 'static')

    @cherrypy.expose
    def index(self):
        return self.static('index.html')

    @cherrypy.expose
    def static(self, *path):
        path = os.path.join(self.static_dir, *path)
        return cherrypy.lib.static.serve_file(path)

    @cherrypy.expose
    def note(self, name, title=None, body=None):
        if cherrypy.request.method == 'GET':
            title = name
            body = self.load_note(name)
        elif cherrypy.request.method == 'POST':
            if name == title:
                self.save_note(name, body)
            else:
                self.rename_note(name, title, body)
        else:
            raise cherrypy.HTTPError(500, 'Unknown method')

        cherrypy.response.headers['Content-Type'] = 'application/json'
        return bytes(json.dumps({
            'title': title,
            'raw': body,
            'html': misaka.html(body),
            'attachments': [
                {'name': 'foo.pdf'},
            ],
        }), 'utf-8')

    def load_note(self, note):
        path = os.path.join(self.source_dir, note) + '.md'
        print('Loading file "{}"'.format(path))
        with open(path) as f:
            return f.read(None)

    def save_note(self, note, body):
        path = os.path.join(self.source_dir, note) + '.md'
        print('Saving file "{}"'.format(path))
        with open(path, 'w') as f:
            f.write(body)

    def rename_note(self, oldname, newname, body):
        oldpath = os.path.join(self.source_dir, oldname) + '.md'
        newpath = os.path.join(self.source_dir, newname) + '.md'
        os.rename(oldpath, newpath)
        self.save_note(newname, body)

def main(argv):
    if len(argv) > 2:
        print('Usage: {} [ NOTEBOOK_DIR ]'.format(argv[0]))
        return 1
    elif len(argv) == 2:
        notebook_dir = os.path.abspath(argv[1])
    else:
        notebook_dir = os.getcwd()

    print('Starting server...')
    cherrypy.quickstart(TNote(notebook_dir))

if __name__ == '__main__':
    sys.exit(main(sys.argv))
