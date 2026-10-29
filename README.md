# Báo giá điện mặt trời — app Android

Đóng gói `src/index.html` thành APK bằng Capacitor. Không cần cài Android Studio: GitHub Actions tự build.

## Build APK
1. Tạo repo **private** trên GitHub, đẩy toàn bộ thư mục này lên nhánh `main`.
2. Vào tab **Actions** → workflow **Build Android APK** (tự chạy sau mỗi lần push, hoặc bấm *Run workflow*).
3. Chạy xong (khoảng 5–8 phút), mở lần chạy đó → mục **Artifacts** → tải `bao-gia-dien-mat-troi-apk` → giải nén ra `app-debug.apk`.
4. Chép APK sang điện thoại, mở file, cho phép "cài từ nguồn không xác định" để cài.

## Sửa nội dung
Chỉ sửa `src/index.html` rồi push lại. Các file khác giữ nguyên.

## Ghi chú
- Thư viện PDF (html2canvas, jsPDF) và font được gom vào app nên chạy được khi không có mạng.
- Nút **Xuất PDF** tạo file rồi mở bảng chia sẻ của Android (lưu vào Drive/Files, gửi Zalo, email...).
- Dữ liệu nhập lưu trong bộ nhớ của app (localStorage). Gỡ app hoặc xóa dữ liệu app sẽ mất dữ liệu.
- Muốn đổi icon: sửa `gen-icons.py` rồi chạy `python3 gen-icons.py`.
