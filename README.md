# In Danh Sách Số Đẹp VinaPhone

Công cụ điền số thuê bao + cam kết vào tấm poster **Số Đẹp VinaPhone** (30 dòng, chia 3 khối × 10 dòng), xuất ra ảnh/PDF để in.

## Tính năng mới
- Đăng nhập / **đăng ký** tài khoản (lưu trong Google Sheet).
- Giới hạn số lượng số trong danh sách (mặc định 3) và số lần check/ngày (đặt "không giới hạn" = ∞).
- Mỗi user có **danh sách số riêng**, lưu/tải từ Google Sheet.
- Hiển thị tên user ở góc trên bên phải sau khi đăng nhập.
- Hai tab: **Quản lý số** (thêm/sửa/xóa list số, kiểm tra trạng thái tự động qua VNPT API) và **Nhập số để tạo bảng** (tạo poster).
- User demo: `ngotanthong` / `ngotanthong`.
- Bỏ quản lý user theo ngày hết hạn.

## Cách dùng nhanh nhất — `index.html`
1. Mở `index.html` bằng Chrome.
2. Đăng nhập: `ngotanthong` / `ngotanthong`.
3. Tab **Quản lý số**: thêm số, lưu tự động.
4. Tab **Nhập số để tạo bảng**: dán list hoặc bấm "Lấy từ danh sách đã quản lý" → poster tự điền.
5. Bấm **🖨 In / Lưu PDF** hoặc **⬇ Tải PNG**.

### Chế độ demo (offline)
Mặc định `API_URL = ""` trong `index.html`: dữ liệu lưu trong trình duyệt (localStorage), không cần mạng/Sheet. Phù hợp để thử.

### Kết nối Google Sheet (lưu thật)
1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/16X92ss43OtOJTK9IqhjnzEnesgvWuawdha63_ogNzvw
2. Extensions → Apps Script, dán nội dung file `gas_backend.gs`, lưu.
3. Chạy hàm `setup()` một lần (tạo sheet "Users", "Numbers" + user demo).
4. Deploy → New deployment → Web app → Execute as: Me, Who has access: **Anyone** (không phải "Anyone with Google account") → Deploy.
5. Nếu đã deploy trước đó, vào Deploy → Manage deployments → ✏️ → Version: New version → Deploy để cập nhật code mới.
6. Copy URL (dạng `https://script.google.com/macros/s/.../exec`).
6. Mở `index.html`, sửa `const API_URL = "";` thành `const API_URL = "URL_VUA_COPY";`, lưu.
7. Tải lại trang và đăng nhập.

### Cấu trúc Google Sheet
- Sheet `Users`: cột A = username, B = password, C = tên hiển thị.
- Sheet `Numbers`: cột A = username, B = số thuê bao, C = cam kết gốc, D = cam kết mới, E = trạng thái.

## Các file trong repo
| File | Công dụng |
|---|---|
| `index.html` | ⭐ Công cụ chính |
| `gas_backend.gs` | Backend Google Apps Script (tùy chọn, để lưu vào Sheet) |
| `build_tool.py` | Tạo lại `bckground.jpg` từ `bckground.png` |
| `bckground.png` / `bckground.jpg` | Ảnh nền poster |

## Đổi ảnh nền
Thay file `bckground.png` rồi chạy `python3 build_tool.py`.