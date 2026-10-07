> **Tóm tắt.** WireGuard là giao thức VPN phổ biến nhanh nhất và đơn giản nhất, và trên mạng không bị lọc thì đây là lựa chọn rất tốt. Tuy nhiên, nó chưa bao giờ được thiết kế để che giấu việc đó là VPN, và ở Nga, Iran và Trung Quốc, đây là một trong những giao thức bị chặn đầu tiên.

## WireGuard là gì?

WireGuard là giao thức VPN do Jason A. Donenfeld viết và phát hành lần đầu năm 2015. Mục tiêu của nó là thay thế các giao thức lớn, nhiều tùy chọn trước đó bằng một thứ đủ nhỏ để có thể kiểm toán mã nguồn. Tháng 3 năm 2020, WireGuard [được tích hợp vào nhân Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), và hiện đã có ứng dụng chính thức cho Windows, macOS, iOS, Android và Linux.

Thay vì để hai bên thương lượng bộ mã hóa, WireGuard cố định một bộ nguyên thủy mật mã hiện đại. [Trang giao thức](https://www.wireguard.com/protocol/) liệt kê chúng: ChaCha20 với Poly1305 để mã hóa, Curve25519 để trao đổi khóa và BLAKE2s để băm. Không có gì để cấu hình sai và không có tùy chọn cũ, yếu hơn để quay lại.

## Nó hoạt động như thế nào?

Mỗi thiết bị có một cặp khóa, giống như SSH. Máy khách và máy chủ biết trước khóa công khai của nhau, và bước bắt tay dựa trên khung giao thức Noise (trang giao thức nêu rõ cấu trúc chính xác là `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Mọi gói tin đều được gửi qua UDP](https://www.wireguard.com/protocol/), và một phiên mới được thiết lập chỉ trong một vòng đi–về.

Thiết kế đó khiến WireGuard cho cảm giác nhanh. Có rất ít thứ cần thương lượng, mã chạy bên trong nhân hệ điều hành trên Linux, và việc chuyển đổi giữa Wi-Fi và dữ liệu di động diễn ra âm thầm vì giao thức không giữ một kết nối dài hạn.

## Tại sao WireGuard bị chặn?

Chính sự đơn giản giúp WireGuard dễ kiểm toán cũng khiến nó dễ bị nhận ra. [Bản whitepaper](https://www.wireguard.com/papers/wireguard.pdf) của nó quy định các thông điệp bắt tay đến từng byte, nên gói tin đầu tiên từ máy khách luôn dài 148 byte và gói phản hồi luôn dài 92 byte, mỗi gói đều bắt đầu bằng một trường loại thông điệp cố định. Hệ thống kiểm tra gói tin sâu (DPI) chỉ cần một quy tắc ngắn để phát hiện mẫu này trên UDP.

Các cơ quan kiểm duyệt đã làm đúng như vậy. Tháng 8 năm 2023, người dùng ở Nga [báo cáo](https://github.com/net4people/bbs/issues/274) rằng các nhà mạng di động lớn cắt phiên WireGuard ngay sau bước bắt tay. Mã hóa vẫn bảo vệ nội dung, nhưng bản thân kết nối thì mất.

Đây là một đánh đổi trong thiết kế, không phải lỗi. Các tác giả của WireGuard chọn một giao thức tối giản, cố định, và việc ngụy trang không nằm trong mục tiêu. Các dự án như [AmneziaWG](/vpn-protocols/amneziawg) thay đổi hình dạng gói tin để khôi phục phần nào khả năng che giấu.

## Khi nào nên dùng WireGuard?

- **Mạng không bị lọc.** Ở nhà, ở cơ quan, hoặc khi đi đến một quốc gia không chặn VPN, WireGuard khó có đối thủ về tốc độ và mức tiêu hao pin.
- **Tự dựng máy chủ.** Nếu bạn tự chạy máy chủ, WireGuard là một trong những giao thức dễ thiết lập đúng nhất.
- **Không nằm dưới bộ lọc DPI.** Nếu mạng của bạn chặn VPN, một giao thức được xây dựng để trông như lưu lượng web thông thường, chẳng hạn [VLESS-Reality](/vpn-protocols/vless-reality), phù hợp hơn. Bài so sánh [VLESS-Reality và WireGuard](/blog/vless-reality-vs-wireguard) của chúng tôi trình bày chi tiết hơn về sự đánh đổi này.

## Doppler có dùng WireGuard không?

Không. Ứng dụng Doppler kết nối qua VLESS-Reality, vì Doppler được xây dựng cho những mạng lọc WireGuard. Hướng dẫn [vì sao chọn VLESS](/vpn-protocols/why-vless) giải thích lý do.
