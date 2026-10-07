> **Tóm tắt.** Chúng tôi xây dựng Doppler cho những người dùng mạng chặn VPN. Trên các mạng đó, câu hỏi không phải là giao thức nào nhanh nhất trên giấy, mà là giao thức nào vẫn còn kết nối vào ngày mai. Chúng tôi chọn VLESS với Reality vì nó cho cơ quan kiểm duyệt ít thứ nhất để nhận ra và ít thứ nhất để chặn, và chúng tôi chấp nhận những đánh đổi đi kèm.

## Chúng tôi đã chọn theo tiêu chí nào?

Doppler được xây dựng cho những người kết nối từ nơi VPN bị lọc có chủ đích: Nga, Iran, Trung Quốc, một số khu vực vùng Vịnh. Trên các mạng đó, mã hóa là phần dễ. Mọi giao thức trong [bài so sánh](/vpn-protocols) của chúng tôi đều mã hóa tốt. Điều phân biệt chúng là liệu hệ thống lọc có nhận ra được kết nối đó là VPN hay không, và có thể chặn được gì khi đã nhận ra.

Vì vậy chúng tôi đánh giá từng lựa chọn bằng ba câu hỏi:

1. **Nó có dấu vân tay cố định không?** Một bước bắt tay có kích thước cố định hay một cổng chuẩn có thể bị khớp bằng một quy tắc duy nhất.
2. **Chuyện gì xảy ra khi cơ quan kiểm duyệt thăm dò máy chủ?** Tường lửa chủ động kết nối đến các proxy bị nghi ngờ để xem chúng phản hồi ra sao.
3. **Có thứ gì để đưa vào danh sách chặn không?** Một tên miền, một chứng chỉ hay một máy chủ dễ nhận ra là mục tiêu, kể cả khi bản thân lưu lượng được giấu kỹ.

## Tại sao không phải WireGuard, OpenVPN hay IKEv2?

Cả ba đều không đạt câu hỏi thứ nhất. Các gói bắt tay của [WireGuard](/vpn-protocols/wireguard) luôn dài 148 và 92 byte. [OpenVPN](/vpn-protocols/openvpn) bị nhận ra trong hơn 85% luồng bởi các nhà nghiên cứu làm việc bên trong một ISP thật. [IKEv2](/vpn-protocols/ikev2) chạy trên các cổng UDP chuẩn có thể bị chặn hàng loạt. Tháng 8 năm 2023, người dùng ở Nga [báo cáo](https://github.com/net4people/bbs/issues/274) các nhà mạng cắt WireGuard và OpenVPN ngay trong vài gói tin đầu tiên. Đây là những giao thức tốt cho mạng mở. Chúng không được thiết kế cho mạng của chúng tôi.

## Tại sao không phải Shadowsocks hay VMess?

Chúng đạt câu hỏi thứ nhất nhờ trông như các byte ngẫu nhiên, và hóa ra điều đó lại là một dấu vân tay riêng. Từ tháng 11 năm 2021, Great Firewall đã [chặn lưu lượng mã hóa hoàn toàn](https://gfw.report/publications/usenixsecurity23/en/) không giống bất kỳ giao thức đã biết nào. [VMess](/vpn-protocols/vmess) có thể được bọc trong TLS để tránh điều đó, nhưng khi ấy nó cần một tên miền, dẫn chúng ta đến câu hỏi thứ ba.

## Tại sao không phải Trojan?

[Trojan](/vpn-protocols/trojan) trả lời tốt hai câu hỏi đầu: đó là TLS thật, và các gói thăm dò thấy một trang web thật. Nhưng mỗi máy chủ Trojan cần tên miền và chứng chỉ riêng. Một khi cơ quan kiểm duyệt biết tên miền đó, họ có thể chặn nó, và vận hành nhiều tên miền là một cuộc rượt đuổi không dứt.

## VLESS-Reality làm đúng điều gì

[VLESS-Reality](/vpn-protocols/vless-reality) trả lời cả ba:

- **Không có dấu vân tay cố định.** Kết nối là TLS 1.3 qua TCP, loại lưu lượng mã hóa phổ biến nhất trên internet.
- **Các gói thăm dò thấy một trang web thật.** Reality chuyển bất kỳ ai không xác thực được đến trang web thật mà nó mượn bước bắt tay, kèm chứng chỉ thật của trang đó.
- **Không có gì của chúng tôi để chặn theo tên.** Không có tên miền hay chứng chỉ Doppler nào trong bước bắt tay.

Nó cũng chạy qua TCP, nên vẫn hoạt động trên các mạng làm chậm hoặc chặn UDP, nơi [Hysteria 2](/vpn-protocols/hysteria2) và [AmneziaWG](/vpn-protocols/amneziawg) gặp khó khăn. Và bản thân VLESS rất nhỏ gọn: nó dựa vào TLS để mã hóa thay vì thêm mã hóa riêng, nên không có mã hóa kép.

## Những gì chúng tôi đã đánh đổi

- **Tốc độ thuần trên đường truyền hay mất gói.** TCP phục hồi sau mất gói kém mượt hơn QUIC hoặc UDP của WireGuard. Trên kết nối tốt, chênh lệch là nhỏ; trên kết nối kém, nó có thể đáng chú ý.
- **Hỗ trợ tích hợp trong hệ điều hành.** Không hệ điều hành nào có sẵn máy khách VLESS, nên bạn cần một ứng dụng. Chúng tôi quyết định điều đó chấp nhận được và tự xây dựng ứng dụng cho iOS, Android, macOS và Windows.
- **Sự vô hình hoàn hảo.** Nó không tồn tại. Nghiên cứu đã cho thấy [TLS bên trong TLS có thể bị nhận dạng dấu vân tay](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), và vào tháng 11 năm 2025 có [báo cáo](https://github.com/net4people/bbs/issues/546) về một số ISP ở Nga cắt kết nối Reality. VLESS-Reality là một thiết kế chống kiểm duyệt, không phải một sự đảm bảo.

## Chúng tôi làm gì với những giới hạn đó

Kiểm duyệt luôn thay đổi, nên việc chọn giao thức không phải là hết việc. Chúng tôi điều chỉnh cài đặt máy chủ và các trang web mà Reality mượn khi việc lọc thay đổi, và tiếp tục theo dõi chính những nghiên cứu cũng như báo cáo của cộng đồng được trích dẫn trên các trang này. Nếu một cách tiếp cận tốt hơn xuất hiện, trang này sẽ nói rõ.

Để biết đầy đủ câu chuyện kỹ thuật về cách VLESS-Reality hoạt động, hãy đọc [đường hầm VLESS-Reality](/how-it-works/vless-reality-tunnel). Để dùng thử, xem [VLESS VPN](/vless-vpn).
