> **Tóm tắt.** Trojan giấu lưu lượng proxy bên trong một kết nối TLS thật đến một trang web thật do bạn kiểm soát. Ai kết nối mà không có mật khẩu sẽ chỉ nhận được trang web. Nó hoạt động tốt, nhưng bạn cần tên miền và chứng chỉ riêng, và những thứ đó có thể bị tìm ra và chặn.

## Trojan là gì?

Trojan là một giao thức proxy từ [dự án trojan-gfw](https://github.com/trojan-gfw/trojan), phát hành lần đầu vào tháng 10 năm 2017. Ý tưởng của nó nằm ngay trong tên: thay vì tự nghĩ ra một lớp ngụy trang, nó ẩn mình trong loại lưu lượng mã hóa phổ biến nhất trên internet, HTTPS.

## Nó hoạt động như thế nào?

[Mô tả giao thức](https://trojan-gfw.github.io/trojan/protocol) rất ngắn. Máy chủ Trojan lắng nghe như một máy chủ HTTPS bình thường, với chứng chỉ thật cho một tên miền thật. Máy khách thực hiện một bước bắt tay TLS thật. Sau đó, bên trong kết nối đã mã hóa, nó gửi:

- giá trị băm SHA-224 của mật khẩu dùng chung, mã hóa dạng hex, dài 56 ký tự,
- một dấu xuống dòng,
- một yêu cầu nhỏ cho biết lưu lượng cần đi đâu, theo định dạng gần giống SOCKS5,
- một dấu xuống dòng nữa, theo sau là phần dữ liệu đầu tiên.

Nếu giá trị băm và yêu cầu hợp lệ, máy chủ mở một đường hầm đến đích. Nếu có gì sai, máy chủ coi kết nối là "giao thức khác" và chuyển nó sang một máy chủ web dự phòng, nên người truy cập thấy một trang web bình thường.

## Trojan khó chặn đến mức nào?

Nhìn từ bên ngoài, một kết nối Trojan là một phiên TLS đến tên miền của bạn, với chứng chỉ của bạn. Các gói thăm dò chủ động nhận lại một trang web thật. Điều đó khiến Trojan khó bị nhận diện riêng ra hơn nhiều so với các giao thức trông ngẫu nhiên, chẳng hạn [Shadowsocks](/vpn-protocols/shadowsocks).

Điểm yếu của nó là chính tên miền. Mỗi máy chủ cần một tên miền và một chứng chỉ, và cơ quan kiểm duyệt khi biết những tên miền nào thuộc về proxy có thể chặn chúng theo tên hoặc theo IP. Các nhà nghiên cứu cũng đã cho thấy TLS được truyền bên trong TLS để lại các mẫu về thời gian và kích thước có thể [nhận dạng dấu vân tay](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), điều này ảnh hưởng đến Trojan và các thiết kế tương tự.

[VLESS-Reality](/vpn-protocols/vless-reality) loại bỏ vấn đề tên miền bằng cách mượn bước bắt tay TLS của một trang web phổ biến có sẵn thay vì dùng của bạn.

## Khi nào nên dùng Trojan?

- **Khi bạn kiểm soát một tên miền** và muốn một thiết lập đơn giản, được hiểu rõ, trông như HTTPS.
- **Trên các mạng bị lọc ở mức vừa phải**, nơi tên miền của bạn ít có khả năng bị nhắm tới.
- Bài so sánh [VLESS, VMess và Trojan](/blog/vless-vs-vmess-vs-trojan) của chúng tôi hữu ích nếu bạn đang chọn giữa chúng.

## Doppler có dùng Trojan không?

Không. Doppler dùng VLESS-Reality, không cần tên miền riêng. Xem [vì sao chọn VLESS](/vpn-protocols/why-vless).
