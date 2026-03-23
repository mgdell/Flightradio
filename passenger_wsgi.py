import sys
import traceback
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
if str(APP_DIR) not in sys.path:
  sys.path.insert(0, str(APP_DIR))

LOG_FILE = APP_DIR / "startup_error.log"

try:
  from server import application  # noqa: F401
except Exception:
  LOG_FILE.write_text(traceback.format_exc(), encoding="utf-8")

  def application(environ, start_response):
    body = (
      "Flight Radio failed to start. "
      "Check startup_error.log in the application root."
    ).encode("utf-8")
    start_response(
      "500 Internal Server Error",
      [
        ("Content-Type", "text/plain; charset=utf-8"),
        ("Content-Length", str(len(body))),
      ],
    )
    return [body]
