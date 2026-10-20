"""Unify translations: a short English string (40 characters or fewer) keeps one Vietnamese form.

Uses PREFERRED when set, otherwise the most common form (the shorter one on a tie).
Writes tools/review/part-9-unified.json, which loads after every other review file.
A key whose choice equals the English source (such as the name Linear) is intentional:
build-pack drops that key so Orca shows the original name.
Run after build-pack.mjs, then rebuild.
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

root = Path(__file__).resolve().parent.parent
out_path = root / "tools/review/part-9-unified.json"

# Preferred translations for strings where the most common one is wrong
PREFERRED = {
    "Linear": "Linear",
    "linear": "Linear",
    "Cancel": "Hủy",
    "Loading…": "Đang tải…",
    "Checking…": "Đang kiểm tra…",
    "Connecting…": "Đang kết nối…",
    "Connecting": "Đang kết nối",
    "Connection failed": "Kết nối thất bại",
    "Updated": "Đã cập nhật",
    "Pinned": "Đã ghim",
    "Completed": "Đã hoàn tất",
    "Unassigned": "Chưa giao",
    "Active": "Đang hoạt động",
    "Unavailable": "Không khả dụng",
    "Got it": "Đã hiểu",
    "close": "đóng",
    "Copy command": "Sao chép lệnh",
    "No comments yet.": "Chưa có bình luận.",
    "Indexed history": "Lịch sử đã index",
    "AI Provider Accounts": "Tài khoản AI",
    "Give agents Orca skills": "Cấp skill Orca cho Agent",
}

# Phrases replaced in every string because they read badly or overflow their cell
PHRASE_FIXES = {
    "Tài khoản nhà cung cấp AI": "Tài khoản AI",
    "các đặc vụ": "Agent",
    "đặc vụ": "Agent",
    "Tổ chức âm nhạc": "Điều phối",
    "File chạy": "Tệp chạy",
    "terminal mồ côi": "terminal không còn dùng",
    "thần chết": "daemon",
    "công nhân": "worker",
    "Tuyến tính": "Linear",
}


def flatten(obj, prefix="", out=None):
    out = {} if out is None else out
    for key, value in obj.items():
        name = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            flatten(value, name, out)
        else:
            out[name] = value
    return out


en = flatten(json.loads((root / "sources/en-1.4.230.json").read_text()))
vi = flatten(json.loads((root / "locales/vi.json").read_text()))
overrides = json.loads((root / "tools/overrides.json").read_text())

groups = defaultdict(dict)
for key, text in vi.items():
    source = en.get(key)
    if isinstance(source, str) and source == source.strip() and len(source) <= 40:
        groups[source][key] = text

result = {}
for source, entries in groups.items():
    counts = Counter(entries.values())
    if len(counts) < 2 and source not in PREFERRED:
        continue
    best = PREFERRED.get(source) or sorted(counts, key=lambda t: (-counts[t], len(t)))[0]
    for key, text in entries.items():
        if text != best and key not in overrides:
            result[key] = best

for key, text in vi.items():
    if key in overrides:
        continue
    current = result.get(key, text)
    fixed = current
    for old, new in PHRASE_FIXES.items():
        fixed = fixed.replace(old, new)
    if "…" in en.get(key, "") and "..." in fixed:
        fixed = fixed.replace("...", "…")
    if fixed != current:
        result[key] = fixed

out_path.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n")
print(f"Unified {len(result)} keys in {sum(1 for e in groups.values() if len(set(e.values())) > 1)} groups")
