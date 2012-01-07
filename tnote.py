#!/usr/bin/env python3
'''
    tnote - Simple personal wiki system.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import http.server
import json
import os
import os.path
import posixpath
import sys
import urllib

import misaka

class NoteRequest(http.server.SimpleHTTPRequestHandler):
    def __init__(self, notebook, *args):
        self.notebook = notebook
        super().__init__(*args)

    def do_GET(self):
        if self.path.startswith('/note'):
            self.send_note()
        else:
            super().do_GET()

    def translate_path(self, path):
        if path.startswith('/static'):
            path = path[7:]

        # From http://hg.python.org/cpython/file/3.2/Lib/http/server.py
        path = path.split('?', 1)[0]
        path = path.split('#', 1)[0]
        path = posixpath.normpath(urllib.parse.unquote(path))
        words = path.split('/')
        words = filter(None, words)
        path = self.notebook.static_dir
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    def send_note(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(bytes(json.dumps({
            'name': 'start',
            'title': 'Start',
            'content': '<p>Hello world!</p>',
        }), 'utf-8'))

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

    address = ('localhost', 8080)

    httpd = http.server.HTTPServer(address,
            lambda *args: NoteRequest(notebook, *args))

    print('Starting server on "{}:{}"'.format(*address))
    httpd.serve_forever()

if __name__ == '__main__':
    sys.exit(main(sys.argv))
