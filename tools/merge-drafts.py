import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent / "sources"
paths = [root / name for name in ("vi-draft-first.json", "vi-draft-middle.json", "vi-draft-last.json")]

def merge(target, source):
    for key, value in source.items():
        if isinstance(value, dict):
            merge(target.setdefault(key, {}), value)
        else:
            target[key] = value

combined = {}
for file in paths:
    if file.exists():
        merge(combined, json.loads(file.read_text()))
output = root / "vi-draft.json"
output.write_text(json.dumps(combined, ensure_ascii=False, indent=2) + "\n")
print(f"Merged {sum(file.exists() for file in paths)} draft files into {output}")
