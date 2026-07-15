import json, sys, pathlib

sys.stdin.read()

KB = pathlib.Path("C:/AWARA/kb/wiki")

try:
    idx = (KB / "index.md").read_text(encoding="utf-8", errors="replace")
except Exception as e:
    idx = f"(ошибка чтения index.md: {e})"

try:
    log_lines = (KB / "log.md").read_text(encoding="utf-8", errors="replace").splitlines()
    log = "\n".join(log_lines[-20:])
except Exception as e:
    log = f"(ошибка чтения log.md: {e})"

ctx = (
    "=== AWARA KB: kb/wiki/index.md ===\n"
    + idx
    + "\n\n=== kb/wiki/log.md (последние 20 строк) ===\n"
    + log
)

print(json.dumps({
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": ctx
    }
}))
