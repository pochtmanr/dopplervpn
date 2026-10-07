> **Singkatnya.** Hysteria 2 adalah protokol proxy yang dibangun di atas QUIC, transport di balik HTTP/3. Protokol ini dirancang untuk kecepatan pada koneksi yang buruk dan banyak kehilangan paket, dan bagi siapa pun tanpa kata sandi, servernya berperilaku seperti situs web HTTP/3 biasa. Titik lemahnya adalah ketergantungan pada UDP, yang dibatasi atau diblokir sepenuhnya oleh sebagian jaringan.

## Apa itu Hysteria 2?

Hysteria adalah proyek open-source dari [apernet](https://github.com/apernet/hysteria); versi 2, protokol yang dirancang ulang, dirilis pada September 2023. Seperti Shadowsocks dan VLESS, ia adalah proxy, bukan VPN klasik, dan klien dapat mengarahkan seluruh perangkat melaluinya.

## Bagaimana cara kerjanya?

Menurut [spesifikasi protokolnya](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 berjalan di atas QUIC sebagaimana didefinisikan dalam [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), dengan ekstensi datagram tidak andal untuk lalu lintas UDP. QUIC sudah menyediakan enkripsi TLS 1.3, stream yang di-multiplex, dan pembuatan koneksi yang cepat.

Autentikasi adalah tempat penyamaran berperan. Spesifikasi mewajibkan bahwa server Hysteria **harus mengimplementasikan server HTTP/3 yang nyata** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) dan menangani permintaan seperti server web mana pun. Klien mengautentikasi dengan permintaan HTTP/3 khusus; siapa pun selain itu, baik pengunjung yang penasaran maupun probe aktif, mendapatkan respons web biasa. Spesifikasi menyatakan bahwa bagi pihak ketiga tanpa kredensial, server berperilaku persis seperti server web HTTP/3 standar.

## Mengapa cepat?

QUIC berjalan di atas UDP dan pulih dari kehilangan paket tanpa menghentikan setiap stream seperti yang dilakukan TCP. Hysteria juga dapat memakai pengendalian kemacetan sendiri yang ditujukan untuk tautan tidak stabil, sehingga cenderung mempertahankan kecepatannya di jaringan seluler yang padat, rute jarak jauh, dan Wi-Fi yang berinterferensi, tempat protokol berbasis TCP melambat.

## Seberapa sulit memblokir Hysteria 2?

Terhadap active probing, ia bertahan dengan baik, karena probe melihat server web. Kerentanannya ada pada transport. Sensor dapat membatasi atau memblokir UDP, atau QUIC secara khusus, tanpa merusak sebagian besar situs web, karena browser beralih ke HTTP/2 melalui TCP ketika HTTP/3 gagal. Di tempat hal itu terjadi, Hysteria 2 tidak punya jalan lain, sedangkan protokol berbasis TCP seperti [VLESS-Reality](/vpn-protocols/vless-reality) tetap berfungsi.

## Kapan sebaiknya menggunakan Hysteria 2?

- **Tautan dengan banyak kehilangan paket atau jarak jauh**, di mana pengendalian kemacetannya dan pemulihan kehilangan paket QUIC memberi manfaat.
- **Jaringan yang mengizinkan UDP.** Periksa dulu sebelum mengandalkannya.
- Sebagai protokol kedua di samping opsi TCP, sehingga Anda dapat beralih saat UDP difilter. [Panduan sensor](/bypass-censorship) kami membahas bagaimana filter menargetkan transport.

## Apakah Doppler menggunakan Hysteria 2?

Tidak. Doppler menggunakan VLESS-Reality melalui TCP, yang tetap berfungsi di jaringan yang memblokir UDP. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
