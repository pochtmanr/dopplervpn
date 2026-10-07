> **Singkatnya.** VMess adalah protokol asli dari proyek V2Ray. Protokol ini mengenkripsi header-nya sendiri dan biasanya dibungkus dalam transport lain, seperti WebSocket melalui TLS, agar tampak seperti lalu lintas web. Ia masih berfungsi, tetapi penerusnya, VLESS dan Trojan, melakukan pekerjaan yang sama dengan overhead yang lebih kecil.

## Apa itu VMess?

VMess adalah protokol proxy terenkripsi yang diperkenalkan [proyek V2Ray](https://github.com/v2fly/v2ray-core) saat dimulai pada 2015. V2Ray berkembang menjadi platform modular untuk membangun proxy: satu inti, banyak protokol dan transport, serta mesin routing yang menentukan lalu lintas mana pergi ke mana. VMess adalah protokol pertamanya dan selama beberapa tahun menjadi protokol utamanya.

Seperti Shadowsocks, VMess secara teknis adalah proxy, bukan VPN, tetapi aplikasi berbasis V2Ray dapat mengarahkan seluruh perangkat Anda melaluinya.

## Bagaimana cara kerjanya?

Setiap pengguna memiliki UUID yang berfungsi sebagai kredensialnya. Menurut [dokumentasi protokol](https://www.v2fly.org/en_US/developer/protocols/vmess.html), header permintaan klien memuat ID autentikasi terenkripsi yang disusun dari stempel waktu Unix, sebuah angka acak, dan checksum, dienkripsi dengan kunci yang diturunkan dari ID pengguna. Server memakainya untuk mengenali pengguna, lalu mendekripsi sisa header dan datanya.

Dokumentasi menjelaskan dua cara melindungi header. Cara modern memakai enkripsi AEAD, yang menjamin header tidak diubah. Cara lama memakai MD5 dan AES-128-CFB dan tidak dapat menjamin integritas header; dokumentasi memperingatkan agar tidak memakainya. Karena ID autentikasi menyertakan stempel waktu, jam klien dan server harus kurang lebih sinkron, penyebab umum masalah "pokoknya tidak mau tersambung".

## Seberapa sulit memblokir VMess?

Sendirian, VMess tampak seperti byte acak, yang menempatkannya pada posisi yang sama dengan [Shadowsocks](/vpn-protocols/shadowsocks): rentan terhadap firewall yang memblokir lalu lintas terenkripsi penuh. Karena itu VMess biasanya dipasang di dalam WebSocket atau gRPC melalui TLS, di belakang domain dan sertifikat, sehingga pengamat melihat sesuatu yang tampak seperti koneksi HTTPS biasa ke sebuah situs web.

Pembungkus itu menjalankan sebagian besar tugas menyembunyikan lalu lintas, dan ia membawa biaya: Anda memerlukan domain, sertifikat, dan sering kali CDN di depan server, dan server kini mengenkripsi data dua kali, sekali untuk TLS dan sekali untuk VMess.

## VMess, VLESS, atau Trojan?

[VLESS](/vpn-protocols/vless-reality) dirancang oleh proyek Xray sebagai penerus yang lebih ringan: ia mempertahankan identitas berbasis UUID tetapi membuang enkripsi bawaan VMess dan sepenuhnya mengandalkan lapisan TLS, sehingga menghindari enkripsi ganda. [Trojan](/vpn-protocols/trojan) menempuh pendekatan serupa dengan kata sandi sebagai ganti UUID. Perbandingan kami antara [VLESS, VMess, dan Trojan](/blog/vless-vs-vmess-vs-trojan) membahas rinciannya.

## Apakah Doppler menggunakan VMess?

Tidak. Doppler menggunakan VLESS dengan Reality. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menjelaskan alasannya.
