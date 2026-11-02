"""Check the review files in tools/review against the built locales/vi.json.

1. Keys written by several review files: the later file by name wins (build-pack loads in name order),
   *unified.json loads last, and overrides.json always wins.
2. Short English strings that have more than one translation in the build.
"""
import json
from collections import defaultdict
from pathlib import Path

root = Path(__file__).resolve().parent.parent


def flatten(obj, prefix="", out=None):
    out = {} if out is None else out
    for key, value in obj.items():
        name = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flatten(value, name, out)
        else:
            out[name] = value
    return out


en = flatten(json.loads((root / "sources/en-1.4.245.json").read_text()))
vi = flatten(json.loads((root / "locales/vi.json").read_text()))
overrides = json.loads((root / "tools/overrides.json").read_text())

owners = defaultdict(list)
# Same order as build-pack.mjs: by file name, with *unified.json last
for file in sorted((root / "tools/review").glob("*.json"), key=lambda f: (f.name.endswith("unified.json"), f.name)):
    for key, value in json.loads(file.read_text()).items():
        owners[key].append((file.name, value))
shared = {k: v for k, v in owners.items() if len(v) > 1}
print(f"Keys written by several review files: {len(shared)} (later file wins)")
for key, values in list(shared.items())[:10]:
    print(f"  {key}")
    for name, value in values:
        print(f"    {name}: {value}")
shadowed = [k for k in owners if k in overrides]
print(f"Review keys shadowed by overrides.json: {len(shadowed)}")

variants = defaultdict(lambda: defaultdict(list))
for key, text in vi.items():
    source = en.get(key)
    if isinstance(source, str) and len(source.strip()) <= 40:
        variants[source.strip()][text.strip()].append(key)
mixed = {s: v for s, v in variants.items() if len(v) > 1}
print(f"Short English strings with several translations: {len(mixed)}")
for source, texts in sorted(mixed.items(), key=lambda x: -sum(len(k) for k in x[1].values()))[:40]:
    print(f"  {source!r}: " + " | ".join(f"{t} ({len(k)})" for t, k in texts.items()))
