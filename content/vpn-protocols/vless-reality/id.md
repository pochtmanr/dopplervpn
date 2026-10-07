> **Singkatnya.** VLESS adalah protokol proxy minimal dari proyek Xray. Reality adalah lapisan TLS yang membuat koneksi VLESS tampak seperti kunjungan TLS 1.3 biasa ke situs web asli yang populer, tanpa domain atau sertifikat milik Anda sendiri. Bersama-sama, keduanya saat ini merupakan kombinasi arus utama yang paling sulit diblokir oleh sensor. Halaman ini adalah ringkasannya; [panduan mendalam](/how-it-works/vless-reality-tunnel) kami memuat penjelasan lengkapnya.

## Apa itu VLESS?

VLESS [diusulkan pada Juli 2020](https://github.com/v2ray/v2ray-core/issues/2636) sebagai penerus [VMess](/vpn-protocols/vmess) yang lebih ringan. [Spesifikasinya](https://xtls.github.io/en/development/protocols/vless.html) sengaja dibuat kecil: versi protokol, UUID 16 byte yang mengidentifikasi pengguna, bidang add-on opsional, serta perintah, port, dan alamat tujuan. VLESS tidak memiliki enkripsi sendiri. Ia mengandalkan lapisan TLS di bawahnya, sehingga lalu lintas tidak dienkripsi dua kali.

VLESS adalah bagian dari [Xray-core](https://github.com/XTLS/Xray-core), proyek yang memisahkan diri dari V2Ray pada November 2020 dan kini memimpin pengembangan keluarga protokol ini.

## Apa yang ditambahkan Reality?

Protokol seperti [Trojan](/vpn-protocols/trojan) bersembunyi di dalam TLS ke domain Anda sendiri, dan domain itu menjadi sesuatu yang dapat diblokir sensor. [Reality](https://github.com/XTLS/REALITY), dirilis di Xray-core [1.8.0 pada Maret 2023](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0), menghilangkannya.

Server Reality menyajikan handshake TLS dari situs web pihak ketiga yang asli. Bagi pengamat, koneksi itu adalah kunjungan TLS 1.3 biasa ke situs tersebut. Klien yang mengetahui kunci server diteruskan ke tunnel VLESS; siapa pun selain itu, termasuk probe aktif milik sensor, diteruskan ke situs web asli dan melihat sertifikat aslinya. Tidak ada domain atau sertifikat Doppler yang dapat dimasukkan ke daftar blokir.

## Seberapa sulit memblokir VLESS-Reality?

Ini adalah opsi arus utama paling tangguh yang kami ketahui, tetapi bukan tidak terlihat. Riset yang dipublikasikan pada 2024 menunjukkan bahwa [TLS yang dibawa di dalam TLS dapat di-fingerprint](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) dari waktu dan ukuran paketnya, dan pada November 2025 pengguna [melaporkan](https://github.com/net4people/bbs/issues/546) beberapa ISP Rusia memutus koneksi Reality. Penyedia menanggapinya dengan menyetel pengaturan server dan situs yang dipinjam, dan permainan kucing-kucingan berlanjut.

## Seberapa cepat?

Dalam penggunaan sehari-hari, overhead-nya kecil. Header VLESS dikirim sekali per koneksi, dan alur XTLS Vision menghindari enkripsi kedua atas lalu lintas web yang sudah terenkripsi. Karena berjalan di atas TCP, VLESS-Reality bisa lebih lambat daripada protokol UDP seperti [WireGuard](/vpn-protocols/wireguard) di jaringan dengan kehilangan paket, tetapi ia tetap berfungsi di tempat protokol tersebut diblokir.

## Di mana saya bisa belajar lebih lanjut?

- [Tunnel VLESS-Reality, secara mendalam](/how-it-works/vless-reality-tunnel): sejarah, mekanisme, batasan.
- [Apa itu VLESS?](/blog/what-is-vless) dan [format URI VLESS](/blog/vless-uri-format) di blog kami.
- [VLESS VPN](/vless-vpn): cara Doppler mengemas VLESS-Reality ke dalam aplikasi sekali ketuk.
