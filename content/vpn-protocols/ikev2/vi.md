> **Tóm tắt.** IKEv2/IPsec là loại VPN mà điện thoại và máy tính xách tay của bạn vốn đã biết "nói" mà không cần ứng dụng nào. Nó nhanh và xử lý tốt việc chuyển giữa Wi-Fi và dữ liệu di động. Nó cũng chạy trên các cổng cố định, ai cũng biết, nên là một trong những giao thức đơn giản nhất để cơ quan kiểm duyệt chặn.

## IKEv2/IPsec là gì?

"IKEv2" thực ra là hai phần phối hợp với nhau. IPsec là bộ giao thức mã hóa và xác thực các gói tin IP. IKE, tức Internet Key Exchange, là giao thức hai bên dùng để xác thực lẫn nhau và thỏa thuận khóa IPsec. Phiên bản 2 của IKE được chuẩn hóa [vào tháng 12 năm 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), và đặc tả hiện hành là [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Vì là một tiêu chuẩn của IETF, IKEv2 được tích hợp sẵn trong iOS, macOS và Windows, và trong Android từ phiên bản 11. Nhiều cổng VPN doanh nghiệp sử dụng nó.

## Nó hoạt động như thế nào?

Việc trao đổi khóa chạy qua UDP, [thường trên cổng 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Khi hai bên đã thống nhất khóa, ngăn xếp IPsec của hệ điều hành mã hóa lưu lượng của bạn bằng Encapsulating Security Payload (ESP). Khi có bộ định tuyến NAT nằm giữa, như trên hầu hết mạng gia đình và mạng di động, cả IKE lẫn ESP đều được bọc trong UDP trên cổng 4500.

IKEv2 có một phần mở rộng chuẩn gọi là [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555), cho phép kết nối tồn tại qua việc đổi địa chỉ IP. Đó là lý do IKEv2 dễ chịu trên điện thoại: bước ra khỏi vùng phủ sóng Wi-Fi sang dữ liệu di động, đường hầm vẫn tiếp tục thay vì phải kết nối lại từ đầu.

## Tại sao IKEv2 dễ bị chặn?

IKEv2 không cố tỏ ra giống bất cứ thứ gì khác. Lưu lượng của nó dùng các cổng UDP ai cũng biết và có định dạng IKE và ESP chuẩn mà công cụ mạng nào cũng phân tích được. Để chặn nó thậm chí không cần kiểm tra gói tin sâu: bộ lọc có thể chặn các cổng UDP 500 và 4500, hoặc nhận ra trực tiếp quá trình trao đổi IKE.

Đó là một đánh đổi hợp lý cho mạng doanh nghiệp và việc đi lại ở các nước mở, nơi bị nhận ra là VPN không tốn gì. Trên các mạng cố ý lọc VPN, đây thường là thứ ngừng hoạt động đầu tiên.

## Khi nào nên dùng IKEv2?

- **Không được cài ứng dụng.** Trên thiết bị được quản lý mà bạn không thể cài phần mềm, máy khách IKEv2 tích hợp có thể là lựa chọn duy nhất.
- **Di chuyển trên mạng mở.** MOBIKE giúp việc chuyển giữa các mạng diễn ra mượt mà.
- **Không bị kiểm duyệt.** Trên các mạng bị lọc, hãy chọn giao thức được thiết kế để hòa lẫn vào lưu lượng thường, chẳng hạn [VLESS-Reality](/vpn-protocols/vless-reality). [Hướng dẫn về kiểm duyệt](/bypass-censorship) của chúng tôi giải thích cách việc chặn hoạt động.

## Doppler có dùng IKEv2 không?

Không. Doppler kết nối bằng VLESS-Reality bên trong ứng dụng của riêng mình. Xem [vì sao chọn VLESS](/vpn-protocols/why-vless) để biết lý do.
