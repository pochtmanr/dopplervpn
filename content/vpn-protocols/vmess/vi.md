> **Tóm tắt.** VMess là giao thức gốc của dự án V2Ray. Nó mã hóa tiêu đề của chính mình và thường được bọc trong một phương thức truyền tải khác, chẳng hạn WebSocket qua TLS, để trông như lưu lượng web. Nó vẫn hoạt động, nhưng các giao thức kế nhiệm là VLESS và Trojan làm cùng việc đó với ít chi phí hơn.

## VMess là gì?

VMess là giao thức proxy mã hóa mà [dự án V2Ray](https://github.com/v2fly/v2ray-core) giới thiệu khi bắt đầu vào năm 2015. V2Ray phát triển thành một nền tảng dạng mô-đun để xây dựng proxy: một lõi, nhiều giao thức và phương thức truyền tải, cùng một bộ định tuyến quyết định lưu lượng nào đi đâu. VMess là giao thức đầu tiên của nó và trong vài năm là giao thức chính.

Giống Shadowsocks, về mặt kỹ thuật VMess là một proxy chứ không phải VPN, nhưng các ứng dụng dựa trên V2Ray có thể định tuyến toàn bộ thiết bị của bạn qua nó.

## Nó hoạt động như thế nào?

Mỗi người dùng có một UUID đóng vai trò thông tin xác thực. Theo [tài liệu giao thức](https://www.v2fly.org/en_US/developer/protocols/vmess.html), tiêu đề yêu cầu của máy khách chứa một ID xác thực đã mã hóa, được tạo từ dấu thời gian Unix, một số ngẫu nhiên và một giá trị kiểm tra, mã hóa bằng khóa suy ra từ ID của người dùng. Máy chủ dùng nó để nhận ra người dùng, rồi giải mã phần còn lại của tiêu đề và dữ liệu.

Tài liệu mô tả hai cách bảo vệ tiêu đề. Cách hiện đại dùng mã hóa AEAD, đảm bảo tiêu đề không bị thay đổi. Cách cũ dùng MD5 và AES-128-CFB và không đảm bảo được tính toàn vẹn của tiêu đề; tài liệu khuyến cáo không dùng. Vì ID xác thực có dấu thời gian, đồng hồ của máy khách và máy chủ cần xấp xỉ khớp nhau, đây là nguồn gốc phổ biến của các sự cố "không kết nối được".

## VMess khó chặn đến mức nào?

Tự nó, VMess trông như các byte ngẫu nhiên, khiến nó rơi vào vị trí giống [Shadowsocks](/vpn-protocols/shadowsocks): dễ bị các tường lửa chặn lưu lượng mã hóa hoàn toàn nhắm đến. Vì vậy VMess thường được triển khai bên trong WebSocket hoặc gRPC qua TLS, đằng sau một tên miền và chứng chỉ, để người quan sát thấy thứ trông như một kết nối HTTPS bình thường đến một trang web.

Lớp bọc đó đảm nhiệm phần lớn việc che giấu lưu lượng, và nó đi kèm chi phí: bạn cần một tên miền, một chứng chỉ và thường là CDN đặt trước máy chủ, và giờ máy chủ mã hóa dữ liệu hai lần, một lần cho TLS và một lần cho VMess.

## VMess, VLESS hay Trojan?

[VLESS](/vpn-protocols/vless-reality) được dự án Xray thiết kế như một giao thức kế nhiệm nhẹ hơn: nó giữ danh tính dựa trên UUID nhưng bỏ phần mã hóa riêng của VMess và dựa hoàn toàn vào lớp TLS, nhờ đó tránh mã hóa kép. [Trojan](/vpn-protocols/trojan) theo cách tiếp cận tương tự, dùng mật khẩu thay cho UUID. Bài so sánh [VLESS, VMess và Trojan](/blog/vless-vs-vmess-vs-trojan) của chúng tôi đi vào chi tiết.

## Doppler có dùng VMess không?

Không. Doppler dùng VLESS với Reality. Hướng dẫn [vì sao chọn VLESS](/vpn-protocols/why-vless) giải thích lý do.
