# In Danh Sách Số Đẹp VinaPhone

Công cụ điền số thuê bao + cam kết vào tấm poster **Số Đẹp VinaPhone** (30 dòng, chia 3 khối × 10 dòng), xuất ra ảnh/PDF để in.

## Cách dùng nhanh nhất — `so-dep.html`

1. **Nhấp đôi** vào `so-dep.html` → mở bằng Chrome (chạy offline, không cần mạng).
2. Nhập **mật khẩu** `ngotanthong` → vào công cụ.
3. **Dán danh sách** vào ô bên trái → poster tự điền ngay.
4. Bấm **🖨 In / Lưu PDF** → chọn *Đích: Lưu dưới dạng PDF* → Lưu.

### Định dạng dữ liệu (giữ nguyên chữ gõ)

Dán trực tiếp từ Excel / Google Sheets, mỗi dòng 1 số, 2 cột cách nhau bằng **Tab**:

```
0846 74 7979	800k
0853 82 8889	400k
```

Nội dung được **giữ y nguyên** (dấu cách trong số, chữ `k`, `0`, `1500k`...). Có thể thêm cột STT ở đầu cũng được:

```
1	0846 74 7979	800k
2	0853 82 8889	400k
```

Chỉ dán 1 cột số thuê bao cũng OK — cột CK sẽ để trống.

### Tiện ích trong `so-dep.html`

- Nhớ danh sách vừa nhập (link "↩ Khôi phục danh sách vừa nhập" khi tải lại trang).
- Chỉnh màu số thuê bao / màu CK / cỡ chữ trực tiếp.
- Tải file `.csv`/`.txt`/`.tsv` để điền.
- **⬇ Tải PNG** xuất ảnh 2× (2896×2172) để gửi Zalo/Facebook.
- Khi in, phần bảng điều khiển tự ẩn — chỉ in tấm poster.

## Đổi ảnh nền

Thay file `bckground.png` bằng ảnh mới **cùng tên**, rồi chạy:

```bash
python3 build_tool.py
```

→ `so-dep.html` tự nhúng ảnh mới (một file duy nhất, mang đi đâu cũng được).

## Đổi mật khẩu

Mở `build_tool.py`, sửa dòng:

```python
PASSWORD = "ngotanthong"      # <-- doi mat khau o day
```

rồi chạy lại `python3 build_tool.py`.

## Các file trong repo

| File | Công dụng |
|---|---|
| `so-dep.html` | ⭐ Công cụ chính — mở là chạy (đã chứa sẵn ảnh nền) |
| `build_tool.py` | Tạo lại `so-dep.html` (đổi ảnh nền / mật khẩu) |
| `fill_poster.py` | Bản Python dự phòng, chạy hàng loạt |
| `poster_filled.png` / `@2x` / `.pdf` | Poster mẫu theo định dạng mới |
| `bckground.png` | Ảnh nền poster gốc |

## Lưu ý

Mật khẩu chỉ là **cổng chặn nhẹ** (file HTML chạy offline một mình) — đủ để người khác mở file không vào được ngay, nhưng không phải bảo mật thật. Nếu cần chặn thật (đặt lên mạng, nhiều người dùng) thì phải có server xác thực.
