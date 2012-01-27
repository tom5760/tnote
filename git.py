'''
    git.py - Wrapper around git command line.

    Author: Tom Wambold <tom5760@gmail.com>
'''

import os.path
import subprocess

class Repository(object):
    def __init__(self, repo_dir, bare=False):
        self.repo_dir = repo_dir
        self.bare = bare

        if bare:
            dot_git_dir = self.repo_dir
        else:
            dot_git_dir = os.path.join(self.repo_dir, '.git')

        if not os.path.exists(dot_git_dir):
            print('Repository does not exist, creating...')
            self.init(bare)

    def init(self, bare=False):
        'git init'
        cmd = ['git', 'init']
        if bare:
            cmd.append('--bare')
        cmd.append(self.repo_dir)
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def add(self, *args):
        'git add'
        cmd = ['git', 'add']
        cmd.extend(args)
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def rm(self, *args, recursive=False):
        'git rm'
        cmd = ['git', 'rm']
        if recursive:
            cmd.append('-r')
        cmd.extend(args)
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def mv(self, source, destination):
        'git mv'
        cmd = ['git', 'mv', source, destination]
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def commit(self, message, add=False):
        'git commit'
        cmd = ['git', 'commit', '-m', message]
        if add:
            cmd.append('-a')
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def push(self, remote=None, branch=None):
        'git push'
        if remote is None:
            remote = 'origin'

        if branch is None:
            branch = 'master'

        cmd = ['git', 'push', remote, branch]
        print('Running:', ' '.join(cmd))
        subprocess.check_call(cmd)

    def dirty(self):
        'Returns true if there is stuff to commit.'
        cmd = ['git', 'status', '--porcelain', '-z']
        print('Running:', ' '.join(cmd))
        output = subprocess.check_output(cmd)
        return len(output) > 0
