# AI LÀ NGƯỜI HIỂU BÁC? — Trò chơi trắc nghiệm Tư tưởng Hồ Chí Minh

Website trò chơi trắc nghiệm chủ đề **"Tư tưởng Hồ Chí Minh về xây dựng con người"**, viết bằng **HTML + CSS + JavaScript thuần** (không cần cài đặt thư viện, không cần build, không gọi API ngoài).

Phù hợp để trình chiếu trực tiếp trên máy chiếu (tỉ lệ 16:9) hoặc chia sẻ đường link cho người khác chơi trên máy tính và điện thoại qua **GitHub Pages**.

---

## Cấu trúc dự án

```text
.
├── index.html          # Cấu trúc giao diện trò chơi (màn bìa, màn câu hỏi, màn kết quả)
├── style.css           # Giao diện tông Đỏ – Vàng – Kem, crossfade nền, responsive
├── questions.js        # Dữ liệu 10 câu hỏi trắc nghiệm
├── script.js           # Logic trò chơi, mảng cấu hình nền & âm thanh, phím tắt, pháo giấy
├── assets/             # Chứa ảnh nền (bg1.jpg...bg7.jpg), ảnh Bác Hồ (hinh-bac.jpg)
│   └── sounds/         # Chứa âm thanh đúng/sai (correct.mp3, wrong.mp3...)
└── README.md           # Hướng dẫn sử dụng và đưa lên GitHub Pages
```

---

## Tùy chỉnh ảnh nền & âm thanh (không bắt buộc)

Trang web vẫn chạy mượt và **không báo lỗi** ngay cả khi bạn chưa thêm ảnh hay file âm thanh nào (tự dùng nền đỏ – vàng – kem mặc định và âm thanh tạo bằng Web Audio API).

> **Lưu ý quan trọng khi đưa lên GitHub Pages:** GitHub Pages chạy trên máy chủ Linux nên **phân biệt chữ hoa và chữ thường** trong tên file và tên thư mục. Tên file bạn chép vào `assets/` phải **khớp chính xác từng ký tự** (kể cả hoa/thường và phần mở rộng) với mảng cấu hình trong `script.js`.
> Ví dụ: `assets/bg1.jpg` sẽ **không khớp** với `assets/BG1.JPG` hoặc `assets/bg1.JPG`.

### 1. Thêm / bớt ảnh nền ngẫu nhiên mỗi câu

- Chép các file ảnh vào thư mục `assets/` (mặc định đặt tên `bg1.jpg` đến `bg7.jpg`).
- Mở đầu tệp `script.js` và chỉnh sửa mảng `BACKGROUNDS`:

```js
const BACKGROUNDS = [
  'assets/bg1.jpg',
  'assets/bg2.jpg',
  'assets/bg3.jpg',
  'assets/bg4.jpg',
  'assets/bg5.jpg',
  'assets/bg6.jpg',
  'assets/bg7.jpg'
];
```

- Bạn có thể thêm bao nhiêu ảnh tùy thích (hoặc xóa bớt tên file không dùng).
- Tất cả ảnh hợp lệ được tải trước (preload) khi mở trang, chuyển mượt kiểu crossfade `0.6s`, hiển thị theo cơ chế **túi xáo trộn** nên **không bao giờ có 2 câu liên tiếp bị trùng ảnh**. Màn bìa và màn kết quả cũng đổi ảnh ngẫu nhiên.
- Ảnh nào thiếu hoặc lỗi sẽ tự động bị bỏ qua; nếu không có ảnh nào tải được, trang dùng nền đỏ – vàng – kem mặc định.
- **Ảnh minh họa Bác Hồ đầu trang:** Nếu chép thêm `assets/hinh-bac.jpg`, ảnh sẽ tự hiện trong khung tròn viền vàng ở đầu trang; nếu không có thì tự ẩn gọn.

### 2. Thêm / đổi âm thanh đúng – sai (hỗ trợ phát ngẫu nhiên nhiều file)

- Chép file âm thanh `.mp3` vào thư mục `assets/sounds/` (mặc định là `assets/sounds/correct.mp3` và `assets/sounds/wrong.mp3`).
- Nếu muốn mỗi lần chọn đúng hoặc sai phát ngẫu nhiên nhiều hiệu ứng khác nhau, mở đầu tệp `script.js` và thêm tên file vào hai mảng:

```js
const CORRECT_SOUNDS = [
  'assets/sounds/correct.mp3'
  // Ví dụ thêm: 'assets/sounds/correct2.mp3', 'assets/sounds/vo-tay.mp3'
];

const WRONG_SOUNDS = [
  'assets/sounds/wrong.mp3'
  // Ví dụ thêm: 'assets/sounds/wrong2.mp3'
];
```

- File thiếu hoặc lỗi phát sẽ tự động chuyển sang âm thanh tạo bằng Web Audio API mà không làm gián đoạn trò chơi.
- Nút biểu tượng loa ở góc trên bên phải sẽ bật/tắt đồng thời cả âm thanh `.mp3` lẫn âm thanh Web Audio dự phòng.

---

## Điều khiển & phím tắt khi trình chiếu

- **Chọn đáp án:** Bấm chuột vào thẻ đáp án hoặc nhấn phím `A`, `B`, `C`, `D` hoặc `1`, `2`, `3`, `4`.
- **Chuyển câu tiếp theo / Bắt đầu / Chơi lại:** Nhấn `Enter` hoặc phím cách (`Space`).
- **Bật / tắt âm thanh:** Bấm biểu tượng chiếc loa ở góc trên bên phải màn hình.

---

## Hướng dẫn đưa website lên GitHub Pages (từng bước)

### Bước 1: Tạo kho lưu trữ (Repository) trên GitHub

1. Đăng nhập vào [GitHub](https://github.com/).
2. Bấm dấu **`+`** ở góc trên bên phải → chọn **New repository**.
3. Đặt tên cho repo (ví dụ: `trac-nghiem-tu-tuong-hcm`).
4. Chọn chế độ **Public** (công khai để mọi người vào chơi được).
5. Bấm **Create repository**.

### Bước 2: Đẩy (Push) mã nguồn lên GitHub

Mở **PowerShell** hoặc **Terminal** tại thư mục chứa dự án này và chạy lần lượt các lệnh sau (thay `<ten-tai-khoan>` và `<ten-repo>` bằng thông tin của bạn):

```bash
git init
git add .
git commit -m "Tạo trò chơi trắc nghiệm Tư tưởng Hồ Chí Minh"
git branch -M main
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git push -u origin main
```

> **Lưu ý:** Nếu bạn chưa cài Git trên máy, có thể bấm nút **uploading an existing file** ngay trên trang repo mới tạo trên GitHub rồi kéo thả toàn bộ các file (`index.html`, `style.css`, `script.js`, `questions.js`, `README.md`, và thư mục `assets/` chứa ảnh/âm thanh) vào rồi bấm **Commit changes**.

### Bước 3: Bật GitHub Pages

1. Trên trang repository GitHub của bạn, chọn tab **Settings** (Cài đặt) ở thanh menu phía trên.
2. Ở cột menu bên trái, chọn mục **Pages**.
3. Tại phần **Build and deployment** → mục **Source**, giữ nguyên **Deploy from a branch**.
4. Tại mục **Branch**:
   - Chọn nhánh **`main`**.
   - Chọn thư mục **`/ (root)`**.
   - Bấm nút **Save** (Lưu).

### Bước 4: Lấy link và chia sẻ

1. Đợi khoảng **1–2 phút** rồi tải lại trang **Settings → Pages**.
2. Đường link website của bạn sẽ xuất hiện ở đầu trang, có dạng:

```text
https://<ten-tai-khoan>.github.io/<ten-repo>/
```

Bạn có thể mở link này trực tiếp trên máy chiếu hoặc gửi cho mọi người cùng tham gia trò chơi!
