# Orca interface glossary

Applies to Orca 1.4.245. Keep proper names, commands, paths, variable names, shortcuts and placeholders such as `{{name}}` unchanged. Capitalize the first letter of a label, not the whole sentence.

| English | Vietnamese |
| --- | --- |
| Settings | Cài đặt |
| Appearance | Giao diện |
| Language | Ngôn ngữ |
| Usage | Mức sử dụng |
| Agent / agents | Agent |
| Project / projects | Dự án |
| Workspace / workspaces | workspace (at sentence start: Workspace) |
| Repository / repo | Kho mã |
| Session | Phiên |
| Chat | Cuộc trò chuyện |
| Task | Tác vụ |
| Automation | Tự động hóa |
| Plugin | Tiện ích |
| Install / uninstall | Cài đặt / gỡ cài đặt |
| Enable / disable | Bật / tắt |
| Add / remove | Thêm / xóa |
| Create / delete | Tạo / xóa |
| Open / close | Mở / đóng |
| Show / hide | Hiện / ẩn |
| Save / cancel | Lưu / hủy |
| Continue / back | Tiếp tục / quay lại |
| Retry / refresh | Thử lại / làm mới |
| Search | Tìm kiếm |
| Copy / paste | Sao chép / dán |
| Edit / view | Sửa / xem |
| Update | Cập nhật |
| Error | Lỗi |
| Warning | Cảnh báo |
| Connected / disconnected | Đã kết nối / mất kết nối |
| Running / idle | Đang chạy / đang chờ |
| Done | Hoàn tất |
| Permission | Quyền truy cập |
| Account | Tài khoản |
| Provider | Nhà cung cấp |
| File / folder | Tệp / thư mục |
| Download / upload | Tải xuống / tải lên |
| Left sidebar / right sidebar | Thanh bên trái / thanh bên phải |
| Dashboard | Bảng tổng quan |
| Context menu | Menu chuột phải |
| Resume | Tiếp tục |
| Run now | Chạy ngay |
| Token / tokens | Token |
| Upstream | Upstream |
| Grace period | Thời gian gia hạn |
| Assignee | Người được giao |
| Checkout (Git) | checkout |
| Pull Request | Pull Request / PR |
| Merge Request | Merge Request |
| Issue | issue |
| Pipeline | pipeline |
| Subagent | Agent phụ |
| Skill / skills | Kỹ năng |
| Host (máy chạy Orca hoặc SSH) | máy (máy chủ khi là server) |
| Source Control | Quản lý mã nguồn |
| Push / pull / sync | Đẩy / kéo / đồng bộ (thông báo lỗi: Push thất bại, Pull bị chặn) |
| Publish branch | Đẩy branch |
| Ahead / behind | Đi trước / đi sau |
| Chat UI / native chat | Giao diện chat / chat tích hợp |
| Coordinator | Agent điều phối |
| Distro (WSL) | Bản phân phối |
| Recipe | Cấu hình |
| Effort | Mức effort (mức suy luận) |
| Extension (trình duyệt) | Tiện ích mở rộng |
| Mirror (Node.js) | Máy chủ thay thế |
| Space (Orca Space) | Dung lượng |
| Idle / waiting | Đang chờ / chờ phản hồi |
| Later | Để sau |

Keep these spellings in English: Orca, Claude, Codex, Gemini, Antigravity, Git, worktree, branch, commit, terminal, SSH, MCP. Also keep `CLI`, `API`, `URL`, `JSON`, `CSV`, `GitHub`, `GitLab`, `Jira`, `Linear`, model names and literal commands.

Context matters: “agent” is a product role, never “đại lý”; “worktree” is a Git concept, never “cây làm việc”; “Antigravity” is a name, never “chống trọng lực”.

## Style and length

- Write the way Vietnamese software people talk every day, not word for word. Prefer short active sentences and drop filler words (“một”, “các”, “của bạn”, “được”, “nó”, “việc”, “nữa”) when the meaning stays clear.
- Short labels (buttons, tabs, column headers, menu items, badges) stay close to the source length, at most about 1.4 times the English character count. If that is not possible, keep a familiar English term (workspace, worktree, token, prompt, log, diff).
- Keep states and actions apart: “Running” is “Đang chạy”, “Run” is “Chạy”, “Runs” (noun) is “Lượt chạy”, “Scanned” is “Đã quét”.
- Counts go before the noun: “50 tệp”, “3/32 phiên”, “{{count}} terminal đang chạy”. Not “Các tệp 50” or “3 của 32”.
- “Search X” in a search box is “Tìm X…”, not “Các X tìm kiếm”.
- Do not write “Bạn có chắc chắn muốn…”; use “Đóng tab đã ghim?”, “Xóa nhóm này?”.
- Keep programming terms in English when a translation would sound strange: hook, cell, notebook, worker, runtime, daemon, prompt, diff, log, script, pipeline. For example “Run hooks” is “Chạy hook”, “Run cell” is “Chạy cell”, “4 workers” is “4 worker”.
- Capitalize the first letter of a label and keep the source punctuation (a period stays a period, “…” stays “…”).

## Wording rules

- Do not address the reader as anh or em in the interface. Avoid “bạn” where possible and prefer neutral sentences (“Đăng nhập để tiếp tục”, not “Anh cần đăng nhập”).
- Vietnamese uses the `_other` plural form for every count, so `_other` strings must read naturally when the count is 1 (“{{count}} Agent bị chặn”, not “Cả {{count}} Agent…”). `_one` strings match `_other` so the catalog stays complete.
- Keep Git verbs in English: fork, rebase, merge, cherry-pick, stage, checkout, fetch, fast-forward, force push. Terms checked by the build (`keepTerms` in `tools/build-pack.mjs`) must survive in the translation.
- Strings kept in English belong in `tools/keep-english.json` with a reason group. A review file must not repeat the source text.
- Settings search keywords: translate when a natural Vietnamese word exists (“điều hướng”, “trình quản lý mật khẩu”); keep names and terms in English (github, wsl, pty).
- Kept English terms are capitalized at the start of a sentence (Terminal, Branch, Worktree, Workspace, Checkout, Commit, Issue). `build-pack.mjs` does this automatically. A label made of such a term alone stays in English and goes in `tools/keep-english.json`.
