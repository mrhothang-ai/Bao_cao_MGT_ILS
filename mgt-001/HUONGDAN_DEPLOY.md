# MGT-001 — Hướng dẫn đưa lên GitHub Pages

## Nội dung gói này
```
mgt-001/
├── index.html            ← trang báo cáo (đã gắn sẵn URL Google Sheet)
├── reports-entry.json    ← 1 dòng để thêm vào reports.json chung
├── HUONGDAN_DEPLOY.md     ← file này
└── HUONGDAN_HR_NHAPLIEU.md← hướng dẫn cho HR nhập số hằng ngày
```

## Bước 1 — Nạp lại dữ liệu cả năm vào Sheet
Trong `IL-SUNGTECH-MGT-DATA`, tab **NL_NGAY**: chọn hết dữ liệu cũ (bản 105 dòng) → xoá → **File ▸ Import ▸ Upload `NL_NGAY_seed_fullyear.csv` ▸ Replace current sheet**. (552 dòng, W1→W38.)

## Bước 2 — Đưa thư mục lên GitHub
1. Vào repo **mrhothang-ai.github.io**.
2. Tạo thư mục **`mgt-001`**, upload **`index.html`** vào đó (chỉ cần đúng file này là chạy).
3. Commit. Sau ~1 phút, mở: **https://mrhothang-ai.github.io/mgt-001/**

## Bước 3 — Đăng ký vào trang danh mục (reports.json)
- Mở `reports.json` ở gốc repo, **thêm object trong `reports-entry.json`** vào mảng danh sách (nhớ dấu phẩy ngăn cách). Hoặc dùng `admin.html` nếu tiện.

## Bước 4 — Kiểm tra chạy thật
- Mở link báo cáo → xem **banner**:
  - 🟢 **xanh "Dữ liệu trực tiếp"** = đọc số từ Sheet OK → xong.
  - 🟡 **vàng** = trình duyệt chặn đọc (CORS). Báo lại, sẽ thêm chế độ JSONP vào Code.gs (sửa nhẹ).
- Mở tab **Nhập liệu** → "Điền số W38 mẫu" → chọn ngày → **Gửi** → mở tab NL_NGAY xem có thêm dòng không.

## Ghi chú
- File `index.html` đã **gắn sẵn URL Apps Script** và **nhúng dữ liệu cả năm** (mở là có số ngay, kể cả khi mạng chậm).
- Khi cần cập nhật giao diện sau này: chỉ thay file `index.html` mới vào thư mục `mgt-001`.
