> **Singkatnya.** Kami membangun Doppler untuk orang-orang di jaringan yang memblokir VPN. Di jaringan seperti itu, pertanyaannya bukan protokol mana yang tercepat di atas kertas, melainkan protokol mana yang masih tersambung besok. Kami memilih VLESS dengan Reality karena protokol ini memberi sensor paling sedikit hal untuk dikenali dan paling sedikit hal untuk diblokir, dan kami menerima kompromi yang menyertainya.

## Apa yang kami pertimbangkan?

Doppler dibuat untuk orang yang terhubung dari tempat-tempat di mana VPN sengaja difilter: Rusia, Iran, Tiongkok, sebagian kawasan Teluk. Di jaringan seperti itu, enkripsi adalah bagian yang mudah. Setiap protokol dalam [perbandingan](/vpn-protocols) kami mengenkripsi dengan baik. Yang membedakan mereka adalah apakah sistem pemfilteran dapat mengetahui bahwa koneksi itu adalah VPN, dan apa yang dapat diblokirnya setelah itu.

Jadi kami menilai setiap opsi dengan tiga pertanyaan:

1. **Apakah ia memiliki sidik jari yang tetap?** Handshake berukuran tetap atau port standar dapat dicocokkan dengan satu aturan.
2. **Apa yang terjadi saat sensor memprobe server?** Firewall secara aktif menghubungi proxy yang dicurigai untuk melihat bagaimana responsnya.
3. **Apakah ada sesuatu yang dapat dimasukkan ke daftar blokir?** Domain, sertifikat, atau server yang dapat dikenali adalah sasaran meskipun lalu lintasnya sendiri tersembunyi dengan baik.

## Mengapa bukan WireGuard, OpenVPN, atau IKEv2?

Ketiganya gagal pada pertanyaan pertama. Paket handshake [WireGuard](/vpn-protocols/wireguard) selalu 148 dan 92 byte. [OpenVPN](/vpn-protocols/openvpn) teridentifikasi pada lebih dari 85% aliran oleh peneliti yang bekerja di dalam ISP nyata. [IKEv2](/vpn-protocols/ikev2) berjalan di port UDP standar yang dapat dijatuhkan sekaligus. Pada Agustus 2023 pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) operator memutus WireGuard dan OpenVPN dalam beberapa paket pertama. Ini adalah protokol yang baik untuk jaringan terbuka. Mereka tidak dirancang untuk jaringan kami.

## Mengapa bukan Shadowsocks atau VMess?

Keduanya lolos pertanyaan pertama dengan tampak seperti byte acak, dan ternyata itu sendiri menjadi sidik jari. Sejak November 2021 Great Firewall [memblokir lalu lintas terenkripsi penuh](https://gfw.report/publications/usenixsecurity23/en/) yang tidak menyerupai protokol mana pun yang dikenal. [VMess](/vpn-protocols/vmess) dapat dibungkus TLS untuk menghindarinya, tetapi kemudian ia memerlukan domain, yang membawa kita ke pertanyaan ketiga.

## Mengapa bukan Trojan?

[Trojan](/vpn-protocols/trojan) menjawab dua pertanyaan pertama dengan baik: ia adalah TLS asli, dan probe melihat situs web asli. Namun setiap server Trojan memerlukan domain dan sertifikatnya sendiri. Begitu sensor mengetahui domain itu, ia dapat memblokirnya, dan mengelola banyak domain berarti terus-menerus berkejaran.

## Apa yang dilakukan VLESS-Reality dengan benar

[VLESS-Reality](/vpn-protocols/vless-reality) menjawab ketiganya:

- **Tidak ada sidik jari tetap.** Koneksinya adalah TLS 1.3 melalui TCP, lalu lintas terenkripsi yang paling umum di internet.
- **Probe melihat situs web asli.** Reality meneruskan siapa pun yang tidak dapat mengautentikasi ke situs asli yang handshake-nya dipinjam, lengkap dengan sertifikat asli situs itu.
- **Tidak ada milik kami yang dapat diblokir berdasarkan nama.** Tidak ada domain atau sertifikat Doppler dalam handshake.

Ia juga berjalan di atas TCP, sehingga tetap berfungsi di jaringan yang membatasi atau memblokir UDP, tempat [Hysteria 2](/vpn-protocols/hysteria2) dan [AmneziaWG](/vpn-protocols/amneziawg) kesulitan. Dan VLESS sendiri kecil: ia mengandalkan TLS untuk enkripsi alih-alih menambahkan enkripsi sendiri, sehingga tidak ada enkripsi ganda.

## Apa yang kami korbankan

- **Kecepatan mentah di tautan dengan banyak kehilangan paket.** TCP pulih dari kehilangan paket kurang mulus dibandingkan QUIC atau UDP milik WireGuard. Pada koneksi yang bersih selisihnya kecil; pada koneksi yang buruk bisa terasa.
- **Dukungan bawaan OS.** Tidak ada sistem operasi yang menyertakan klien VLESS, jadi Anda memerlukan aplikasi. Kami memutuskan itu dapat diterima dan membangun aplikasi sendiri untuk iOS, Android, macOS, dan Windows.
- **Ketidakterlihatan yang sempurna.** Itu tidak ada. Riset menunjukkan [TLS di dalam TLS dapat di-fingerprint](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), dan pada November 2025 beberapa ISP Rusia [dilaporkan](https://github.com/net4people/bbs/issues/546) memutus koneksi Reality. VLESS-Reality adalah desain untuk ketahanan terhadap sensor, bukan jaminan.

## Apa yang kami lakukan terhadap batasan itu

Sensor berubah, sehingga pilihan protokol bukanlah akhir dari pekerjaan. Kami menyesuaikan pengaturan server dan situs yang dipinjam Reality seiring perubahan pemfilteran, dan kami terus memantau riset serta laporan komunitas yang sama yang dikutip di halaman-halaman ini. Jika pendekatan yang lebih baik muncul, halaman ini akan menyatakannya.

Untuk penjelasan teknis lengkap tentang cara kerja VLESS-Reality, baca [tunnel VLESS-Reality](/how-it-works/vless-reality-tunnel). Untuk mencobanya, lihat [VLESS VPN](/vless-vpn).
