> **Ringkasnya.** VLESS ialah protokol proksi minimum daripada projek Xray. Reality ialah lapisan TLS yang menjadikan sambungan VLESS kelihatan seperti lawatan TLS 1.3 biasa ke laman web sebenar yang popular, tanpa domain atau sijil sendiri. Bersama-sama, kedua-duanya kini merupakan gabungan arus perdana yang paling sukar disekat oleh penapis. Halaman ini ialah ringkasannya; [panduan mendalam](/how-it-works/vless-reality-tunnel) kami mengandungi kisah penuhnya.

## Apakah VLESS?

VLESS [dicadangkan pada Julai 2020](https://github.com/v2ray/v2ray-core/issues/2636) sebagai pengganti yang lebih ringan bagi [VMess](/vpn-protocols/vmess). [Spesifikasinya](https://xtls.github.io/en/development/protocols/vless.html) sengaja dibuat kecil: versi protokol, UUID 16 bait yang mengenal pasti pengguna, medan tambahan pilihan, serta arahan, port dan alamat destinasi. VLESS tidak mempunyai penyulitan sendiri. Ia bergantung pada lapisan TLS di bawahnya, jadi trafik tidak disulitkan dua kali.

VLESS merupakan sebahagian daripada [Xray-core](https://github.com/XTLS/Xray-core), projek yang berpisah daripada V2Ray pada November 2020 dan kini mengetuai pembangunan keluarga protokol ini.

## Apakah yang ditambah oleh Reality?

Protokol seperti [Trojan](/vpn-protocols/trojan) bersembunyi di dalam TLS ke domain anda sendiri, dan domain itu menjadi sesuatu yang boleh disekat oleh penapis. [Reality](https://github.com/XTLS/REALITY), yang dikeluarkan dalam Xray-core [1.8.0 pada Mac 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), menghapuskannya.

Pelayan Reality membentangkan jabat tangan TLS sebuah laman web pihak ketiga yang sebenar. Bagi pemerhati, sambungan itu ialah lawatan TLS 1.3 biasa ke laman tersebut. Klien yang mengetahui kunci pelayan dibenarkan masuk ke terowong VLESS; sesiapa lain, termasuk siasatan aktif penapis, diserahkan kepada laman web sebenar dan melihat sijilnya yang tulen. Tiada domain atau sijil Doppler untuk diletakkan dalam senarai sekatan.

## Setinggi manakah kesukaran menyekat VLESS-Reality?

Ia pilihan arus perdana yang paling berdaya tahan yang kami ketahui, tetapi ia bukan tidak kelihatan. Penyelidikan yang diterbitkan pada 2024 menunjukkan bahawa [TLS yang dibawa di dalam TLS boleh dicap jari](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) melalui masa dan saiz paketnya, dan pada November 2025, pengguna [melaporkan](https://github.com/net4people/bbs/issues/546) bahawa sesetengah ISP Rusia memutuskan sambungan Reality. Penyedia bertindak balas dengan melaraskan tetapan pelayan dan laman web yang dipinjam, dan permainan kucing dan tikus ini berterusan.

## Seberapa pantaskah ia?

Dalam penggunaan harian, overhednya kecil. Pengepala VLESS dihantar sekali bagi setiap sambungan, dan aliran XTLS Vision mengelakkan penyulitan kali kedua bagi trafik web yang sudah disulitkan. Oleh kerana ia berjalan melalui TCP, VLESS-Reality boleh lebih perlahan daripada protokol UDP seperti [WireGuard](/vpn-protocols/wireguard) pada rangkaian yang kehilangan paket, tetapi ia terus berfungsi di tempat protokol tersebut disekat.

## Di manakah saya boleh belajar lebih lanjut?

- [Terowong VLESS-Reality, secara mendalam](/how-it-works/vless-reality-tunnel): sejarah, mekanisme, had.
- [Apakah VLESS?](/blog/what-is-vless) dan [format URI VLESS](/blog/vless-uri-format) di blog kami.
- [VLESS VPN](/vless-vpn): cara Doppler membungkus VLESS-Reality ke dalam aplikasi satu ketik.
