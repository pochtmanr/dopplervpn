> **Ringkasnya.** WireGuard ialah protokol VPN arus perdana yang paling pantas dan paling ringkas, dan pada rangkaian yang tidak ditapis, ia pilihan yang sangat baik. Namun, ia tidak pernah direka untuk menyembunyikan bahawa ia sebuah VPN, dan di Rusia, Iran dan China, ia antara protokol pertama yang disekat.

## Apakah WireGuard?

WireGuard ialah protokol VPN yang ditulis oleh Jason A. Donenfeld dan mula dikeluarkan pada 2015. Matlamatnya adalah untuk menggantikan protokol terdahulu yang besar dan boleh dikonfigurasikan dengan sesuatu yang cukup kecil untuk diaudit. Pada Mac 2020, ia [digabungkan ke dalam kernel Linux 5.6](https://en.wikipedia.org/wiki/WireGuard), dan aplikasi rasmi kini tersedia untuk Windows, macOS, iOS, Android dan Linux.

Daripada membiarkan setiap pihak merundingkan set sifer, WireGuard menetapkan satu set primitif moden yang tetap. [Halaman protokolnya](https://www.wireguard.com/protocol/) menyenaraikannya: ChaCha20 dengan Poly1305 untuk penyulitan, Curve25519 untuk pertukaran kunci, dan BLAKE2s untuk pencincangan. Tiada apa yang boleh tersalah konfigurasi dan tiada pilihan lama yang lebih lemah untuk dijadikan alternatif.

## Bagaimanakah ia berfungsi?

Setiap peranti mempunyai pasangan kunci, seperti SSH. Klien dan pelayan mengetahui kunci awam satu sama lain terlebih dahulu, dan jabat tangan berasaskan rangka kerja protokol Noise (halaman protokol menamakan binaan yang tepat, `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Semua paket dihantar melalui UDP](https://www.wireguard.com/protocol/), dan sesi baharu disediakan dalam satu pusingan pergi-balik sahaja.

Reka bentuk itulah yang menjadikan WireGuard terasa pantas. Hanya sedikit yang perlu dirundingkan, kod berjalan di dalam kernel sistem pengendalian pada Linux, dan perpindahan antara Wi-Fi dan data mudah alih dikendalikan secara senyap kerana protokol ini tidak mengekalkan sambungan yang terbuka lama.

## Mengapakah WireGuard disekat?

Kesederhanaan yang sama yang menjadikan WireGuard mudah diaudit juga menjadikannya mudah dikenali. [Kertas putihnya](https://www.wireguard.com/papers/wireguard.pdf) menetapkan mesej jabat tangan bait demi bait, jadi paket pertama daripada klien sentiasa 148 bait dan balasannya sentiasa 92 bait, masing-masing bermula dengan medan jenis mesej yang tetap. Sistem pemeriksaan paket mendalam (DPI) hanya memerlukan peraturan yang pendek untuk mengesan corak itu pada UDP.

Penapis memang telah berbuat demikian. Pada Ogos 2023, pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) bahawa pembawa mudah alih utama memutuskan sesi WireGuard sejurus selepas jabat tangan. Penyulitan masih melindungi kandungan, tetapi sambungan itu sendiri telah terputus.

Ini ialah pertukaran reka bentuk, bukan pepijat. Pengarang WireGuard memilih protokol yang tetap dan minimum, dan penyamaran tidak termasuk dalam senarai matlamat. Projek seperti [AmneziaWG](/vpn-protocols/amneziawg) mengubah bentuk paket untuk memulihkan sedikit perlindungan.

## Bilakah anda patut menggunakan WireGuard?

- **Rangkaian yang tidak ditapis.** Di rumah, di tempat kerja, atau ketika melancong di negara yang tidak menyekat VPN, WireGuard sukar ditandingi dari segi kelajuan dan hayat bateri.
- **Hos sendiri.** Jika anda menjalankan pelayan sendiri, WireGuard ialah salah satu protokol yang paling mudah untuk disediakan dengan betul.
- **Bukan di bawah penapisan DPI.** Jika rangkaian anda menyekat VPN, protokol yang dibina agar kelihatan seperti trafik web biasa, seperti [VLESS-Reality](/vpn-protocols/vless-reality), lebih sesuai. Perbandingan kami tentang [VLESS-Reality dan WireGuard](/blog/vless-reality-vs-wireguard) membincangkan pertukaran ini dengan lebih terperinci.

## Adakah Doppler menggunakan WireGuard?

Tidak. Aplikasi Doppler bersambung melalui VLESS-Reality, kerana Doppler dibina untuk rangkaian yang menapis WireGuard. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menerangkan sebab di sebaliknya.
