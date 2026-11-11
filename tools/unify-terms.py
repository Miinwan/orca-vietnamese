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
    "Later": "Để sau",
    "Setup": "Thiết lập",
    "Checklist": "Danh sách kiểm tra",
    "Body text": "Văn bản thường",
    "Inline code": "Mã cùng dòng",
    "Bullet list": "Danh sách dấu đầu dòng",
    "Numbered list": "Danh sách đánh số",
    "Compact": "Gọn",
    "Assignee": "Người được giao",
    "Checking": "Đang kiểm tra",
    "Checks failed": "Kiểm tra thất bại",
    "Checks failing": "Kiểm tra thất bại",
    "Checks passing": "Kiểm tra đạt",
    "Checks pending": "Kiểm tra đang chờ",
    "Clear Pane Title": "Xóa tiêu đề khung",
    "Clear all filters": "Xóa mọi bộ lọc",
    "Columns": "Cột",
    "Copy Details": "Sao chép chi tiết",
    "Duplicate": "Nhân bản",
    "Editor": "Trình soạn thảo",
    "Failed to copy link": "Không sao chép được liên kết",
    "Failed to disable auto-merge": "Không tắt được tự merge",
    "File Explorer": "Trình quản lý tệp",
    "Fork head unsupported": "Chưa hỗ trợ head của fork",
    "Generate commit message with AI": "Tạo thông điệp commit bằng AI",
    "Ignored": "Đã bỏ qua",
    "Inactive": "Không hoạt động",
    "Installing…": "Đang cài…",
    "Just now": "Vừa xong",
    "Kill session": "Buộc dừng phiên",
    "Linked": "Đã liên kết",
    "Loading distributions": "Đang tải bản phân phối",
    "Loading views…": "Đang tải chế độ xem…",
    "Milestones": "Cột mốc",
    "Note": "Ghi chú",
    "Paste is too large.": "Nội dung dán quá lớn.",
    "Plan": "Kế hoạch",
    "Processing…": "Đang xử lý…",
    "Reset zoom": "Đặt lại thu phóng",
    "Restart now": "Khởi động lại ngay",
    "Resuming…": "Đang tiếp tục…",
    "Retrying Orca Relay…": "Đang thử lại Orca Relay…",
    "Revoke {{value0}}": "Thu hồi {{value0}}",
    "Sharing…": "Đang chia sẻ…",
    "Shortcuts in Terminal": "Phím tắt trong terminal",
    "Showing": "Đang hiện",
    "Signing in": "Đang đăng nhập",
    "Skill setup": "Thiết lập kỹ năng",
    "Skipped": "Đã bỏ qua",
    "Source Control": "Quản lý mã nguồn",
    "Started": "Đã bắt đầu",
    "Starting": "Đang bắt đầu",
    "Starting…": "Đang bắt đầu…",
    "Text diff is unavailable for this file.": "Không xem được diff văn bản của tệp này.",
    "Updating…": "Đang cập nhật…",
    "Verifying...": "Đang xác minh...",
    "Zoom": "Thu phóng",
    "cache": "bộ nhớ đệm",
    "symlink": "liên kết tượng trưng",
    "wrapper": "lớp bọc",
    "stopped": "đã dừng",
    "subscription": "gói đăng ký",
    "computer use": "điều khiển máy tính",
    "e.g. ollama run llama3.1 {prompt}": "ví dụ: ollama run llama3.1 {prompt}",
    "Paired": "Đã ghép nối",
    "Pairing code ready": "Đã có mã ghép nối",
    "Copy pairing code": "Sao chép mã ghép nối",
    "Failed to copy pairing code": "Không sao chép được mã ghép nối",
    "Re-pair…": "Ghép nối lại…",
    "Use global": "Dùng cài đặt chung",
    "waiting": "chờ phản hồi",
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


en = flatten(json.loads((root / "sources/en-1.4.256.json").read_text()))
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

# Keep entries from the previous run that are still in the build, so repeated runs stay stable
# (the build already applied this file, so those groups look unified).
previous = json.loads(out_path.read_text()) if out_path.exists() else {}
for key, text in previous.items():
    if key not in result and key not in overrides and vi.get(key) == text:
        result[key] = text

out_path.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n")
print(f"Unified {len(result)} keys in {sum(1 for e in groups.values() if len(set(e.values())) > 1)} groups")
