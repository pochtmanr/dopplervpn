> **Tóm tắt.** Hysteria 2 là một giao thức proxy xây dựng trên QUIC, phương thức truyền tải đứng sau HTTP/3. Nó được thiết kế để nhanh trên các kết nối kém và hay mất gói, và với bất kỳ ai không có mật khẩu, máy chủ của nó hoạt động như một trang web HTTP/3 bình thường. Điểm yếu là nó phụ thuộc vào UDP, thứ mà một số mạng làm chậm hoặc chặn hẳn.

## Hysteria 2 là gì?

Hysteria là một dự án mã nguồn mở của [apernet](https://github.com/apernet/hysteria); phiên bản 2, một giao thức được thiết kế lại, phát hành vào tháng 9 năm 2023. Giống Shadowsocks và VLESS, nó là một proxy chứ không phải VPN cổ điển, và các máy khách có thể định tuyến toàn bộ thiết bị qua nó.

## Nó hoạt động như thế nào?

Theo [đặc tả giao thức](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 chạy trên QUIC như định nghĩa trong [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), với phần mở rộng datagram không tin cậy cho lưu lượng UDP. QUIC vốn đã cung cấp mã hóa TLS 1.3, các luồng đa kênh và thiết lập kết nối nhanh.

Ngụy trang nằm ở khâu xác thực. Đặc tả yêu cầu máy chủ Hysteria **phải triển khai một máy chủ HTTP/3 thật** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) và xử lý các yêu cầu như bất kỳ máy chủ web nào. Máy khách xác thực bằng một yêu cầu HTTP/3 đặc biệt; bất kỳ ai khác, dù là người truy cập tò mò hay gói thăm dò chủ động, đều nhận được các phản hồi web bình thường. Đặc tả nêu rằng, với bên thứ ba không có thông tin xác thực, máy chủ hoạt động y hệt một máy chủ web HTTP/3 chuẩn.

## Tại sao nó nhanh?

QUIC chạy trên UDP và phục hồi sau mất gói mà không làm đình trệ mọi luồng như TCP. Hysteria cũng có thể dùng cơ chế kiểm soát tắc nghẽn riêng, nhắm đến các đường truyền không ổn định, nên nó thường giữ được tốc độ trên mạng di động bị nghẽn, các tuyến đường dài và Wi-Fi bị nhiễu, nơi các giao thức dựa trên TCP chậm đi.

## Hysteria 2 khó chặn đến mức nào?

Trước thăm dò chủ động, nó trụ khá tốt, vì các gói thăm dò thấy một máy chủ web. Điểm lộ ra là phương thức truyền tải. Cơ quan kiểm duyệt có thể làm chậm hoặc chặn UDP, hay riêng QUIC, mà không làm hỏng phần lớn các trang web, vì trình duyệt sẽ quay về HTTP/2 qua TCP khi HTTP/3 thất bại. Ở nơi điều đó xảy ra, Hysteria 2 không còn đường nào để đi, trong khi các giao thức dựa trên TCP như [VLESS-Reality](/vpn-protocols/vless-reality) vẫn hoạt động.

## Khi nào nên dùng Hysteria 2?

- **Đường truyền hay mất gói hoặc đường dài**, nơi cơ chế kiểm soát tắc nghẽn của nó và khả năng phục hồi mất gói của QUIC phát huy hiệu quả.
- **Mạng cho phép UDP.** Hãy kiểm tra trước khi dựa vào nó.
- Làm giao thức thứ hai bên cạnh một lựa chọn TCP, để bạn có thể chuyển đổi khi UDP bị lọc. [Hướng dẫn về kiểm duyệt](/bypass-censorship) của chúng tôi nói về cách các bộ lọc nhắm vào phương thức truyền tải.

## Doppler có dùng Hysteria 2 không?

Không. Doppler dùng VLESS-Reality qua TCP, vẫn hoạt động trên các mạng chặn UDP. Xem [vì sao chọn VLESS](/vpn-protocols/why-vless).
