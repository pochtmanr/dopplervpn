> **Singkatnya.** WireGuard adalah protokol VPN arus utama yang paling cepat dan paling sederhana, dan di jaringan yang tidak difilter ia pilihan yang sangat baik. Namun protokol ini tidak pernah dirancang untuk menyembunyikan bahwa ia adalah VPN, dan di Rusia, Iran, dan Tiongkok ia termasuk protokol pertama yang diblokir.

## Apa itu WireGuard?

WireGuard adalah protokol VPN yang ditulis oleh Jason A. Donenfeld dan pertama kali dirilis pada 2015. Tujuannya adalah menggantikan protokol-protokol besar dan serbaguna sebelumnya dengan sesuatu yang cukup kecil untuk diaudit. Pada Maret 2020 protokol ini [digabungkan ke kernel Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), dan kini tersedia aplikasi resmi untuk Windows, macOS, iOS, Android, dan Linux.

Alih-alih membiarkan kedua sisi menegosiasikan cipher suite, WireGuard menetapkan satu set primitif modern. [Halaman protokolnya](https://www.wireguard.com/protocol/) menyebutkannya: ChaCha20 dengan Poly1305 untuk enkripsi, Curve25519 untuk pertukaran kunci, dan BLAKE2s untuk hashing. Tidak ada yang bisa salah konfigurasi dan tidak ada opsi lama yang lebih lemah sebagai cadangan.

## Bagaimana cara kerjanya?

Setiap perangkat memiliki pasangan kunci, seperti pada SSH. Klien dan server saling mengetahui kunci publik masing-masing sebelumnya, dan handshake-nya didasarkan pada kerangka protokol Noise (halaman protokol menyebutkan konstruksi persisnya, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Semua paket dikirim melalui UDP](https://www.wireguard.com/protocol/), dan sesi baru dibuat dalam satu kali pulang-pergi.

Rancangan itulah yang membuat WireGuard terasa cepat. Hanya sedikit yang perlu dinegosiasikan, kodenya berjalan di dalam kernel sistem operasi di Linux, dan perpindahan antara Wi-Fi dan data seluler ditangani secara senyap karena protokol ini tidak mempertahankan koneksi yang terbuka lama.

## Mengapa WireGuard diblokir?

Kesederhanaan yang membuat WireGuard mudah diaudit juga membuatnya mudah dikenali. [Whitepaper](https://www.wireguard.com/papers/wireguard.pdf)-nya menetapkan pesan handshake byte demi byte, sehingga paket pertama dari klien selalu 148 byte dan balasannya selalu 92 byte, masing-masing diawali bidang tipe pesan yang tetap. Sistem deep packet inspection (DPI) hanya perlu aturan singkat untuk mengenali pola itu di UDP.

Sensor telah melakukan persis hal itu. Pada Agustus 2023 pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) bahwa operator seluler besar memutus sesi WireGuard tepat setelah handshake. Enkripsi tetap melindungi isinya, tetapi koneksinya sendiri hilang.

Ini adalah kompromi desain, bukan bug. Para pembuat WireGuard memilih protokol yang tetap dan minimal, dan penyamaran tidak termasuk dalam tujuan mereka. Proyek seperti [AmneziaWG](/vpn-protocols/amneziawg) mengubah bentuk paket untuk memulihkan sebagian penyamaran.

## Kapan sebaiknya menggunakan WireGuard?

- **Jaringan yang tidak difilter.** Di rumah, di kantor, atau saat bepergian di negara yang tidak memblokir VPN, WireGuard sulit dikalahkan dalam hal kecepatan dan daya tahan baterai.
- **Hosting sendiri.** Jika Anda menjalankan server sendiri, WireGuard adalah salah satu protokol yang paling mudah disiapkan dengan benar.
- **Bukan di bawah pemfilteran DPI.** Jika jaringan Anda memblokir VPN, protokol yang dibuat agar tampak seperti lalu lintas web biasa, seperti [VLESS-Reality](/vpn-protocols/vless-reality), lebih cocok. Perbandingan kami antara [VLESS-Reality dan WireGuard](/blog/vless-reality-vs-wireguard) membahas kompromi ini lebih rinci.

## Apakah Doppler menggunakan WireGuard?

Tidak. Aplikasi Doppler terhubung melalui VLESS-Reality, karena Doppler dibuat untuk jaringan yang memfilter WireGuard. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menjelaskan alasannya.
