# `tnote` - Personal desktop notebook/wiki.

## Requirements

* CherryPy: http://cherrypy.org/
* misaka: http://misaka.61924.nl/

## Running

1. Make a new directory somewhere to store your notes.
    * `mkdir my_notebook`
2. Run tnote.py!
    * `cd my_notebook && /path/to/tnote.py`
3. Open http://localhost:8080 in your web browser.
4. Enjoy!

## Notes

`tnote` will create a `git` repository in your notebook directory, and
automatically commit whenever you make a change.  Right now, these changes
aren't pushed anywhere yet, but they will be soon!

## To-Do:

* Implement attachments.
* Implement favoriting notes.
