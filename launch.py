#!/usr/bin/env python3
"""Serve this folder locally and open Qabbala in the default browser."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser

root = Path(__file__).resolve().parent
handler = partial(SimpleHTTPRequestHandler, directory=str(root))
server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
url = f"http://127.0.0.1:{server.server_address[1]}/index.html"
print("Serving Qabbala Explorer from:", root, flush=True)
print("Opening", url, flush=True)
print("Keep this window open while using the app. Press Control-C to stop.", flush=True)
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")
finally:
    server.server_close()
