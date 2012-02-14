#!/usr/bin/env python3
'''
    tnote - Simple personal wiki system.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import json
import os
import os.path
import shutil
import sys

import cherrypy
import misaka

import git

class TNote(object):
    markdown_extensions = (misaka.EXT_AUTOLINK
                          | misaka.EXT_FENCED_CODE
                          | misaka.EXT_TABLES)

    def __init__(self, directory):
        super().__init__()
        self.directory = directory
        self.script_dir = os.path.split(__file__)[0]
        self.note_dir = os.path.join(directory, 'notes')
        self.static_dir = os.path.join(self.script_dir, 'static')
        self.tag_file = os.path.join(directory, 'tags.json')

        self.repository = git.Repository(self.directory)

        if not os.path.isdir(self.note_dir):
            print('Note directory doesn\'t exist, creating...')
            os.mkdir(self.note_dir)
            shutil.copy(os.path.join(self.script_dir, 'notes', 'Start.md'),
                        self.note_dir)
            self.repository.add(self.note_dir)
            self.repository.commit('Initial commit.')

        self.load_tags()

    @cherrypy.expose
    def index(self):
        return self.static('index.html')

    @cherrypy.expose
    def static(self, *path):
        path = os.path.join(self.static_dir, *path)
        return cherrypy.lib.static.serve_file(path)

    @cherrypy.expose
    def note(self, name, title=None, body=None, tags=None):
        if cherrypy.request.method == 'GET':
            title = name
            try:
                body = self.load_note(name)
            except IOError:
                raise cherrypy.HTTPError(404, 'Unknown note {}'.format(name))
        elif cherrypy.request.method == 'POST':
            if name != title:
                self.rename_note(name, title)
            self.save_note(title, body, tags)
        else:
            raise cherrypy.HTTPError(500, 'Unknown method')

        cherrypy.response.headers['Content-Type'] = 'application/json'
        return bytes(json.dumps({
            'title': title,
            'raw': body,
            'html': misaka.html(body, self.markdown_extensions),
            'attachments': [],
            'tags': self.get_tags(title),
        }), 'utf-8')

    @cherrypy.expose
    def tag(self, tag_name=None):
        if tag_name == None:
            html = ['<ul>']
            for t in sorted(self.get_tags()):
                print('Tag:', t)
                html.append('<li><a href="/tag/{0}">{0}</a></li>'.format(t))
            html.append('</ul>')
            return bytes(''.join(html), 'utf-8')
        else:
            html = ['<ul>']
            for n in sorted(self.get_notes(tag_name)):
                print('Note:', n)
                html.append('<li><a href="/note/{0}">{0}</a></li>'.format(n))
            html.append('</ul>')
            return bytes(json.dumps({
                'title': tag_name,
                'html': ''.join(html)
            }), 'utf-8')

    def load_note(self, note):
        path = os.path.join(self.note_dir, note) + '.md'
        print('Loading file "{}"'.format(path))
        with open(path) as f:
            return f.read(None)

    def save_note(self, note, body, tags):
        path = os.path.join(self.note_dir, note) + '.md'
        print('Saving file "{}"'.format(path))
        with open(path, 'w') as f:
            f.write(body)
        if self.repository.dirty():
            self.repository.add(path)
            self.repository.commit('Edited note "{}"'.format(note))

        tags = list(map(lambda x: x.strip(), tags.split(',')))
        if len(tags) == 1 and tags[0] == '':
            tags = []
        self.set_tags(note, tags)

    def rename_note(self, oldname, newname, body):
        oldpath = os.path.join(self.note_dir, oldname) + '.md'
        newpath = os.path.join(self.note_dir, newname) + '.md'
        self.repository.mv(oldpath, newpath)
        self.repository.commit('Renamed note "{}" to "{}"'
                .format(oldname, newname))
        self.rename_note_tags(oldname, newname)

    def load_tags(self):
        try:
            with open(self.tag_file) as f:
                self.tags = json.load(f)
        except IOError:
            self.tags = {}

    def save_tags(self):
        with open(self.tag_file, 'w') as f:
            json.dump(self.tags, f)
        if self.repository.dirty():
            self.repository.add(self.tag_file)
            self.repository.commit('Updated tags')

    def get_notes(self, tag_name):
        rv = []
        for note, tags in self.tags.items():
            if tag_name in tags:
                rv.append(note)
        return rv

    def get_tags(self, note=None):
        if note is not None:
            try:
                return self.tags[note]
            except KeyError:
                return []

        tags = set()
        for t in self.tags.values():
            tags.update(t)
        return list(tags)

    def set_tags(self, note, tags=None):
        if tags is None:
            tags = []
        self.tags[note] = tags
        self.save_tags()

    def rename_note_tags(self, oldname, newname):
        tags = self.tags.pop(oldname, [])
        self.tags[newname] = tags
        self.save_tags()

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
