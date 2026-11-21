// Dữ liệu 10 câu hỏi trắc nghiệm "Tư tưởng Hồ Chí Minh về xây dựng con người"
// Chỉ số đáp án đúng (correctIndex) bắt đầu từ 0.

window.QUIZ_QUESTIONS = [
  {
    question:
      'Theo Hồ Chí Minh, con người là một chỉnh thể "thống nhất và đa dạng". Sự "thống nhất" ở đây được hiểu là gì?',
    options: [
      'Thống nhất về giai cấp, tầng lớp xã hội và địa vị kinh tế.',
      'Thống nhất về tâm lực, thể lực và các hoạt động; thống nhất của hai mặt đối lập (thiện và ác, hay và dở, tốt và xấu...).',
      'Thống nhất về khát vọng, tính cách và phẩm chất cá nhân.',
      'Thống nhất về hoàn cảnh xuất thân và môi trường sống.'
    ],
    correctIndex: 1
  },
  {
    question:
      'Trong tiến trình thực hiện mục tiêu giải phóng của cách mạng Việt Nam theo tư tưởng Hồ Chí Minh, giai đoạn nào mở đường cho các giai đoạn tiếp theo?',
    options: [
      'Giải phóng xã hội.',
      'Giải phóng con người.',
      'Giải phóng giai cấp.',
      'Giải phóng dân tộc.'
    ],
    correctIndex: 3
  },
  {
    question:
      'Ngay sau khi nước Việt Nam Dân chủ Cộng hòa ra đời (tháng 9/1945), việc Chủ tịch Hồ Chí Minh đặt nhiệm vụ chống nạn đói và chống nạn mù chữ lên hàng đầu thể hiện rõ nhất nội dung nào sau đây?',
    options: [
      'Sự chuyển hóa giữa mục tiêu và động lực: chăm lo cho con người (mục tiêu) sẽ tạo ra sức mạnh to lớn của con người (động lực) để bảo vệ đất nước.',
      'Con người trong giai đoạn này chỉ được xem là công cụ để thực hiện nhiệm vụ quân sự.',
      'Kinh tế và văn hóa là hai yếu tố hoàn toàn tách rời trong chiến lược quốc gia.',
      'Giải phóng giai cấp luôn phải tiến hành trước giải phóng dân tộc hàng chục năm.'
    ],
    correctIndex: 0
  },
  {
    question:
      'Câu nói nào sau đây của Chủ tịch Hồ Chí Minh thể hiện tầm quan trọng chiến lược, lâu dài của việc xây dựng con người?',
    options: [
      'Không có dân thì không có việc gì có thể hoàn thành.',
      'Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người.',
      'Một tấm gương sống có giá trị hơn một trăm bài diễn văn tuyên truyền.',
      'Hễ là người Việt Nam thì phải đứng lên đánh thực dân Pháp.'
    ],
    correctIndex: 1
  },
  {
    question:
      'Trong tư tưởng Hồ Chí Minh về xây dựng con người, phẩm chất "hồng" được hiểu là gì?',
    options: [
      'Năng lực chuyên môn, tay nghề và trình độ khoa học kỹ thuật cao.',
      'Nền tảng, gốc rễ với đạo đức cách mạng, bản lĩnh chính trị và lòng yêu nước.',
      'Thể lực khỏe mạnh và phong cách sống hiện đại, năng động.',
      'Khả năng ngoại ngữ và hội nhập quốc tế nhanh chóng.'
    ],
    correctIndex: 1
  },
  {
    question:
      'Phương pháp giáo dục và rèn luyện con người nào được Hồ Chí Minh đặc biệt coi trọng, khẳng định "một tấm gương sống có giá trị hơn một trăm bài diễn văn tuyên truyền"?',
    options: [
      'Phương pháp cưỡng chế hành chính và kỷ luật nghiêm ngặt từ trên xuống dưới.',
      'Phương pháp nêu gương (đặc biệt là người đứng đầu).',
      'Phương pháp học tập lý luận trừu tượng qua sách vở.',
      'Phương pháp phó mặc cho tự nhiên và cơ chế thị trường tự điều chỉnh.'
    ],
    correctIndex: 1
  },
  {
    question:
      'Văn kiện Đại hội XIII của Đảng đã có sự phát triển đột phá nào khi xác định mục tiêu phát triển con người Việt Nam trong thời kỳ mới?',
    options: [
      'Chuyển dịch trọng tâm từ "con người nghĩa vụ" sang "con người phát triển toàn diện và hạnh phúc".',
      'Chỉ tập trung xây dựng con người chuyên phục vụ phát triển kinh tế thị trường thuần túy.',
      'Bỏ qua các giá trị truyền thống để chỉ tập trung vào công nghệ số.',
      'Xem con người hoàn toàn là yếu tố phụ thuộc vào tốc độ tăng trưởng GDP hàng năm.'
    ],
    correctIndex: 0
  },
  {
    question:
      'Hệ giá trị con người Việt Nam thời kỳ mới được Đảng ta cụ thể hóa gồm bao nhiêu đặc trưng cốt lõi?',
    options: [
      '5 đặc trưng.',
      '6 đặc trưng.',
      '8 đặc trưng.',
      '10 đặc trưng.'
    ],
    correctIndex: 2
  },
  {
    question:
      'Đâu là một trong những hạn chế, thách thức lớn đối với con người Việt Nam hiện nay dưới tác động mặt trái của cơ chế thị trường và hội nhập?',
    options: [
      'Người dân quá tập trung vào lao động chân tay mà hoàn toàn quên đi học vấn.',
      'Sự suy thoái về tư tưởng chính trị, đạo đức, lối sống của một bộ phận cán bộ, đảng viên và hiện tượng lệch chuẩn văn hóa ở một bộ phận giới trẻ.',
      'Nước ta không còn lực lượng lao động trẻ trong các ngành công nghệ cao.',
      'Người dân thiếu hoàn toàn tinh thần tương thân tương ái trong hoạn nạn.'
    ],
    correctIndex: 1
  },
  {
    question:
      'Năm 2024, để cụ thể hóa tư tưởng Hồ Chí Minh về việc rèn luyện đạo đức cách mạng và nêu gương của cán bộ, đảng viên trong giai đoạn mới, Bộ Chính trị đã ban hành văn bản nào sau đây?',
    options: [
      'Quy định số 144-QĐ/TW.',
      'Nghị quyết số 29-NQ/TW.',
      'Chỉ thị số 05-CT/TW.',
      'Nghị quyết số 33-NQ/TW.'
    ],
    correctIndex: 0
  }
];
