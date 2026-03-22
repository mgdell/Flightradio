from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any

HOST = "127.0.0.1"
PORT = 8000
APP_DIR = Path(__file__).resolve().parent


class StaticAppHandler(SimpleHTTPRequestHandler):
  def __init__(self, *args: Any, **kwargs: Any) -> None:
    super().__init__(*args, directory=str(APP_DIR), **kwargs)


if __name__ == "__main__":
  server = ThreadingHTTPServer((HOST, PORT), StaticAppHandler)
  print(f"Serving SignalScout on http://{HOST}:{PORT}")
  server.serve_forever()
