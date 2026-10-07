> **Tóm tắt.** Shadowsocks là một proxy mã hóa nhẹ, được tạo ra ở Trung Quốc để vượt qua Great Firewall. Trong nhiều năm, nó hoạt động nhờ trông không giống bất cứ thứ gì. Từ năm 2021, các nghiên cứu cho thấy tường lửa này chặn chính loại lưu lượng đó, vì lưu lượng thật hiếm khi ngẫu nhiên đến vậy.

## Shadowsocks là gì?

Shadowsocks là một giao thức proxy mã nguồn mở, phát hành lần đầu [vào tháng 4 năm 2012](https://en.wikipedia.org/wiki/Shadowsocks). Nói chính xác thì nó không phải VPN: đó là một proxy kiểu SOCKS5 có mã hóa, và các ứng dụng tự quyết định lưu lượng nào được gửi qua nó. Trên thực tế, hầu hết máy khách Shadowsocks hiện nay đều có chế độ toàn hệ thống hoạt động như một VPN.

Nó phổ biến vì đơn giản và nhanh. Các phiên bản hiện tại dùng [bộ mã hóa AEAD](https://shadowsocks.org/doc/aead.html), cung cấp tính bảo mật, toàn vẹn và xác thực trong một bước, và [phiên bản 2022](https://shadowsocks.org/doc/sip022.html) của giao thức đã siết chặt khả năng chống phát lại.

## Nó hoạt động như thế nào?

Máy khách và máy chủ dùng chung một mật khẩu, được chuyển thành khóa mã hóa. Mọi thứ máy khách gửi đi, kể cả địa chỉ của trang web muốn truy cập, đều được mã hóa từ byte đầu tiên. Không có bắt tay dễ nhận ra, không có chứng chỉ và không có tiêu đề ở dạng văn bản thuần. Với người quan sát, một kết nối Shadowsocks là một luồng byte trông như ngẫu nhiên.

## Great Firewall phát hiện Shadowsocks như thế nào?

Thứ nhất, bằng thăm dò chủ động. Các nhà nghiên cứu của GFW Report [đã ghi nhận](https://gfw.report/publications/imc20/en/) tường lửa gửi hàng chục nghìn gói thăm dò đến các máy chủ bị nghi là Shadowsocks, phát lại và chỉnh sửa các kết nối thật để xem máy chủ phản ứng ra sao.

Sau đó, từ tháng 11 năm 2021, bằng một phương pháp thô hơn và rộng hơn. Một [nghiên cứu tại USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) phát hiện tường lửa chặn lưu lượng "mã hóa hoàn toàn" theo thời gian thực. Nó xem gói tin đầu tiên của kết nối và cho qua mọi thứ trông giống một giao thức đã biết hoặc chứa đủ văn bản in được. Một quy tắc đo số bit được đặt trung bình trên mỗi byte: các giá trị từ 3,4 trở xuống hoặc từ 4,6 trở lên được cho qua, còn dữ liệu trông ngẫu nhiên nằm giữa hai mốc đó thì không. Phần còn lại có thể bị chặn.

Các nhà nghiên cứu cũng nhận thấy tường lửa áp dụng điều này cho khoảng 26% số kết nối, và chỉ với các dải IP của những trung tâm dữ liệu phổ biến, có lẽ để hạn chế thiệt hại ngoài ý muốn. Bài học cho những người thiết kế giao thức rất rõ ràng: trông ngẫu nhiên tự nó đã là một dấu vân tay.

## Khi nào nên dùng Shadowsocks?

- **Proxy nhẹ và nhanh** trên các mạng không kiểm tra lưu lượng kỹ.
- **Tự dựng máy chủ** với các công cụ như Outline, giúp việc thiết lập đơn giản.
- **Thận trọng khi bị lọc nặng.** Ở Trung Quốc và những nơi khác chặn lưu lượng mã hóa hoàn toàn, Shadowsocks kém tin cậy hơn nhiều so với các giao thức mô phỏng TLS thật, chẳng hạn [VLESS-Reality](/vpn-protocols/vless-reality). [Lịch sử các giao thức vượt kiểm duyệt](/blog/censorship-protocol-history) của chúng tôi theo dõi cách lĩnh vực này đã tiến lên.

## Doppler có dùng Shadowsocks không?

Không. Doppler dùng VLESS-Reality, vì những lý do nêu trong [vì sao chọn VLESS](/vpn-protocols/why-vless).
