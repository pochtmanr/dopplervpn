> **Tóm tắt.** AmneziaWG là một bản fork của WireGuard, giữ nguyên tốc độ và mật mã của nó nhưng thay đổi hình dạng gói tin và tiêu đề khiến WireGuard dễ bị nhận ra. Đây là lựa chọn mạnh ở nơi WireGuard thuần bị chặn, với một điều kiện: khi bật chế độ làm rối, nó không còn giao tiếp được với các máy chủ WireGuard chuẩn.

## AmneziaWG là gì?

AmneziaWG do nhóm đứng sau [Amnezia VPN](https://amnezia.org/) phát triển, một ứng dụng mã nguồn mở để chạy máy chủ VPN của riêng bạn. [Bản triển khai bằng Go](https://github.com/amnezia-vpn/amneziawg-go) của dự án bắt đầu từ năm 2023. Nó lấy [WireGuard](/vpn-protocols/wireguard), vốn nhanh và đơn giản nhưng có bước bắt tay cố định, dễ nhận ra, rồi thêm một lớp ngụy trang cho nó.

## Nó thay đổi những gì?

[Tài liệu AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) mô tả nhiều cơ chế, mỗi cơ chế được điều khiển bằng các tham số cấu hình:

- **Tiêu đề động (H1–H4).** Gói tin WireGuard chuẩn bắt đầu bằng một loại thông điệp cố định cho mỗi trong bốn định dạng gói. AmneziaWG thay các giá trị đó bằng những số chọn từ các khoảng được cấu hình, nên hai thiết lập khác nhau không dùng chung tiêu đề và không có một quy tắc lọc nào khớp được tất cả.
- **Ngẫu nhiên hóa độ dài gói (S1–S4).** Trong WireGuard, gói bắt tay đầu tiên luôn dài đúng 148 byte. AmneziaWG thêm các tiền tố ngẫu nhiên vào từng loại gói để kích thước thay đổi.
- **Gói rác (Jc, Jmin, Jmax).** Trước khi bắt tay, máy khách gửi một số lượng cấu hình được các gói giả ngẫu nhiên có độ dài ngẫu nhiên, làm mờ phần đầu phiên cả về thời gian lẫn kích thước.
- **Bảo vệ tiêu đề.** Các phiên bản mới hơn còn có thể mã hóa chính trường loại thông điệp.

Bên dưới, mật mã và thiết kế tổng thể vẫn là của WireGuard.

## AmneziaWG khó chặn đến mức nào?

Nó loại bỏ các dấu hiệu đơn giản mà bộ lọc dùng để nhắm vào WireGuard: kích thước cố định và giá trị tiêu đề cố định. Nhờ đó nó có khả năng chống chịu tốt hơn nhiều so với WireGuard thuần trên các mạng chặn VPN.

Nó vẫn chạy qua UDP, nên các mạng làm chậm hoặc chặn UDP trên diện rộng sẽ ảnh hưởng đến nó, và lưu lượng của nó không mô phỏng một ứng dụng cụ thể nào theo cách [VLESS-Reality](/vpn-protocols/vless-reality) mô phỏng một lượt truy cập TLS vào trang web thật. Bộ lọc chặn thẳng UDP không nhận ra được vẫn có thể bắt được nó.

## Khi nào nên dùng AmneziaWG?

- **Ở nơi WireGuard bị chặn** nhưng UDP vẫn hoạt động, và bạn muốn tốc độ gần như WireGuard.
- **Máy chủ tự dựng**, dùng ứng dụng Amnezia VPN để thiết lập.
- Hãy giữ một lựa chọn dựa trên TCP, chẳng hạn VLESS-Reality, cho các mạng lọc UDP. [Hướng dẫn cho Nga](/vpn-for-russia) của chúng tôi nói về những gì hiện đang vượt qua được ở đó.

## Doppler có dùng AmneziaWG không?

Không. Doppler dùng VLESS-Reality. Xem [vì sao chọn VLESS](/vpn-protocols/why-vless).
