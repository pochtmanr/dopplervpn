> **Tóm tắt.** VLESS là một giao thức proxy tối giản của dự án Xray. Reality là lớp TLS khiến kết nối VLESS trông như một lượt truy cập TLS 1.3 bình thường vào một trang web thật, phổ biến, mà không cần tên miền hay chứng chỉ riêng. Kết hợp lại, hiện đây là tổ hợp phổ biến khó bị cơ quan kiểm duyệt chặn nhất. Trang này là bản tóm tắt; [hướng dẫn chuyên sâu](/how-it-works/vless-reality-tunnel) của chúng tôi có đầy đủ câu chuyện.

## VLESS là gì?

VLESS được [đề xuất vào tháng 7 năm 2020](https://github.com/v2ray/v2ray-core/issues/2636) như một giao thức kế nhiệm nhẹ hơn của [VMess](/vpn-protocols/vmess). [Đặc tả](https://xtls.github.io/en/development/protocols/vless.html) của nó cố ý rất nhỏ gọn: phiên bản giao thức, một UUID dài 16 byte xác định người dùng, một trường tiện ích bổ sung tùy chọn, cùng lệnh, cổng và địa chỉ của đích đến. VLESS không có mã hóa riêng. Nó dựa vào lớp TLS bên dưới, nên lưu lượng không bị mã hóa hai lần.

VLESS là một phần của [Xray-core](https://github.com/XTLS/Xray-core), dự án tách ra từ V2Ray vào tháng 11 năm 2020 và hiện dẫn dắt việc phát triển họ giao thức này.

## Reality bổ sung điều gì?

Các giao thức như [Trojan](/vpn-protocols/trojan) ẩn mình trong TLS đến tên miền của chính bạn, và tên miền đó trở thành thứ cơ quan kiểm duyệt có thể chặn. [Reality](https://github.com/XTLS/REALITY), phát hành trong Xray-core [1.8.0 vào tháng 3 năm 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), loại bỏ điều đó.

Máy chủ Reality xuất trình bước bắt tay TLS của một trang web thật của bên thứ ba. Với người quan sát, kết nối là một lượt truy cập TLS 1.3 bình thường vào trang đó. Máy khách biết khóa của máy chủ được cho đi qua vào đường hầm VLESS; bất kỳ ai khác, kể cả gói thăm dò chủ động của cơ quan kiểm duyệt, được chuyển đến trang web thật và thấy chứng chỉ thật của nó. Không có tên miền hay chứng chỉ nào của Doppler để đưa vào danh sách chặn.

## VLESS-Reality khó chặn đến mức nào?

Đây là lựa chọn phổ biến có khả năng chống chịu tốt nhất mà chúng tôi biết, nhưng nó không vô hình. Nghiên cứu công bố năm 2024 cho thấy [TLS được truyền bên trong TLS có thể bị nhận dạng dấu vân tay](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) qua thời gian và kích thước gói tin, và vào tháng 11 năm 2025, người dùng [báo cáo](https://github.com/net4people/bbs/issues/546) một số ISP ở Nga cắt kết nối Reality. Các nhà cung cấp ứng phó bằng cách tinh chỉnh cài đặt máy chủ và các trang web mà họ mượn, và cuộc rượt đuổi vẫn tiếp diễn.

## Nó nhanh đến mức nào?

Trong sử dụng hằng ngày, chi phí phát sinh là nhỏ. Tiêu đề VLESS chỉ được gửi một lần cho mỗi kết nối, và luồng XTLS Vision tránh việc mã hóa lần thứ hai lưu lượng web vốn đã được mã hóa. Vì chạy trên TCP, VLESS-Reality có thể chậm hơn các giao thức UDP như [WireGuard](/vpn-protocols/wireguard) trên mạng hay mất gói, nhưng nó vẫn hoạt động ở nơi các giao thức đó bị chặn.

## Tôi có thể tìm hiểu thêm ở đâu?

- [Đường hầm VLESS-Reality, chuyên sâu](/how-it-works/vless-reality-tunnel): lịch sử, cơ chế, giới hạn.
- [VLESS là gì?](/blog/what-is-vless) và [định dạng URI của VLESS](/blog/vless-uri-format) trên blog của chúng tôi.
- [VLESS VPN](/vless-vpn): cách Doppler đóng gói VLESS-Reality thành các ứng dụng chỉ cần một chạm.
