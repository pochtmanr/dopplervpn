> **Tóm tắt.** OpenVPN là "lão làng" của các VPN mã nguồn mở: linh hoạt, được hỗ trợ rộng rãi và được hiểu rõ sau hơn hai thập kỷ. Nó cũng chậm hơn các giao thức mới hơn và, theo nghiên cứu đã công bố, là một trong những giao thức dễ bị nhà cung cấp dịch vụ internet nhận dạng dấu vân tay nhất.

## OpenVPN là gì?

OpenVPN là phần mềm VPN mã nguồn mở, miễn phí do James Yonan phát hành lần đầu [vào tháng 5 năm 2001](https://en.wikipedia.org/wiki/OpenVPN). Trong phần lớn thập niên 2000 và 2010, nó là lựa chọn mặc định cho các dịch vụ VPN thương mại và truy cập từ xa trong doanh nghiệp, và hiện vẫn có mặt trong nhiều bộ định tuyến và sản phẩm doanh nghiệp.

Nó chạy ở không gian người dùng thay vì trong nhân hệ điều hành, và dựa vào thư viện OpenSSL cùng giao thức TLS để trao đổi khóa. Cổng do IANA ấn định là 1194, nhưng OpenVPN có thể chạy qua UDP hoặc TCP trên hầu hết mọi cổng.

## Nó hoạt động như thế nào?

OpenVPN dùng một giao thức riêng gồm hai phần. Kênh điều khiển dùng TLS để xác thực hai bên, thường bằng chứng chỉ, và thỏa thuận khóa. Sau đó, kênh dữ liệu truyền lưu lượng của bạn, được mã hóa bằng các khóa đó, bên trong gói tin UDP hoặc TCP.

Cấu trúc đó khiến OpenVPN rất dễ tùy biến. Bạn có thể chọn bộ mã hóa, phương thức xác thực, cổng và phương thức truyền tải, và chạy nó qua proxy. Cái giá của sự linh hoạt là độ phức tạp: nhiều mã hơn, nhiều thiết lập hơn và nhiều cách hơn để rơi vào một cấu hình yếu.

## Tại sao OpenVPN bị chặn?

TLS bên trong OpenVPN không giống một lượt truy cập HTTPS vào trang web. OpenVPN bọc bước bắt tay TLS trong định dạng gói tin riêng của nó, nên lưu lượng có một hình dạng mà lưu lượng web thông thường không có.

Các nhà nghiên cứu đã đo xem điều đó quan trọng đến mức nào. Một nhóm từ Đại học Michigan và các đơn vị khác [đã xây dựng một hệ thống nhận dạng dấu vân tay](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) và chạy nó bên trong một nhà cung cấp dịch vụ internet phục vụ khoảng một triệu người dùng. Hệ thống nhận ra **hơn 85% luồng OpenVPN** với rất ít báo động nhầm, và cũng bắt được phần lớn các cấu hình OpenVPN "làm rối" thương mại mà họ thử nghiệm.

Việc lọc ngoài đời thực đi theo nghiên cứu. Tháng 8 năm 2023, người dùng ở Nga [báo cáo](https://github.com/net4people/bbs/issues/274) các nhà mạng di động cắt kết nối OpenVPN ngay sau khi chúng bắt đầu.

## Khi nào nên dùng OpenVPN?

- **Tính tương thích.** Bộ định tuyến cũ, cổng kết nối doanh nghiệp và một số mạng công ty chỉ hỗ trợ OpenVPN chứ không có gì mới hơn.
- **Mạng chỉ có TCP.** OpenVPN có thể chạy qua TCP khi UDP bị chặn, điều mà [WireGuard](/vpn-protocols/wireguard) không làm được nếu không có hỗ trợ thêm.
- **Không dùng trên mạng bị lọc.** Ở nơi VPN bị chặn, OpenVPN thường hỏng sớm. Một giao thức mô phỏng lưu lượng web bình thường, chẳng hạn [VLESS-Reality](/vpn-protocols/vless-reality), là công cụ tốt hơn. [Hướng dẫn về kiểm duyệt](/bypass-censorship) của chúng tôi giải thích cách các hệ thống lọc quyết định cắt gì.

## Doppler có dùng OpenVPN không?

Không. Doppler dùng VLESS-Reality trên mọi nền tảng. Hướng dẫn [vì sao chọn VLESS](/vpn-protocols/why-vless) giải thích cách chúng tôi chọn nó.
