> **Singkatnya.** Trojan menyembunyikan lalu lintas proxy di dalam koneksi TLS asli ke situs web asli yang Anda kendalikan. Siapa pun yang tersambung tanpa kata sandi hanya akan mendapatkan situs web tersebut. Protokol ini bekerja dengan baik, tetapi Anda memerlukan domain dan sertifikat sendiri, dan keduanya dapat ditemukan dan diblokir.

## Apa itu Trojan?

Trojan adalah protokol proxy dari [proyek trojan-gfw](https://github.com/trojan-gfw/trojan), pertama kali dirilis pada Oktober 2017. Gagasannya ada pada namanya: alih-alih menciptakan penyamaran, ia bersembunyi di dalam lalu lintas terenkripsi yang paling umum di internet, yaitu HTTPS.

## Bagaimana cara kerjanya?

[Deskripsi protokolnya](https://trojan-gfw.github.io/trojan/protocol) singkat. Server Trojan mendengarkan seperti server HTTPS biasa, dengan sertifikat asli untuk domain asli. Klien melakukan handshake TLS yang sungguhan. Kemudian, di dalam koneksi terenkripsi, klien mengirim:

- hash SHA-224 berenkode heksadesimal dari kata sandi bersama, sepanjang 56 karakter,
- sebuah pemisah baris,
- permintaan kecil yang menyatakan ke mana lalu lintas harus diarahkan, dalam format mirip SOCKS5,
- pemisah baris lainnya, diikuti potongan data pertama.

Jika hash dan permintaannya valid, server membuka tunnel ke tujuan. Jika ada yang salah, server memperlakukan koneksi itu sebagai "protokol lain" dan meneruskannya ke server web cadangan, sehingga pengunjung melihat situs web biasa.

## Seberapa sulit memblokir Trojan?

Dari luar, koneksi Trojan adalah sesi TLS ke domain Anda, dengan sertifikat Anda. Probe aktif mendapatkan situs web asli sebagai balasan. Itu membuat Trojan jauh lebih sulit dipilah dibandingkan protokol yang tampak acak, seperti [Shadowsocks](/vpn-protocols/shadowsocks).

Titik lemahnya adalah domain itu sendiri. Setiap server memerlukan domain dan sertifikat, dan sensor yang mengetahui domain mana yang milik proxy dapat memblokirnya berdasarkan nama atau IP. Para peneliti juga telah menunjukkan bahwa TLS yang dibawa di dalam TLS meninggalkan pola waktu dan ukuran yang dapat di-[fingerprint](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), yang berlaku bagi Trojan dan rancangan serupa.

[VLESS-Reality](/vpn-protocols/vless-reality) menghilangkan masalah domain dengan meminjam handshake TLS dari situs web populer yang sudah ada, bukan milik Anda sendiri.

## Kapan sebaiknya menggunakan Trojan?

- **Saat Anda mengendalikan sebuah domain** dan menginginkan penyiapan yang sederhana dan sudah dipahami dengan baik yang tampak seperti HTTPS.
- **Di jaringan yang difilter secara sedang** di mana domain Anda kecil kemungkinannya menjadi sasaran.
- [Perbandingan VLESS, VMess, dan Trojan](/blog/vless-vs-vmess-vs-trojan) kami membantu jika Anda sedang memilih di antaranya.

## Apakah Doppler menggunakan Trojan?

Tidak. Doppler menggunakan VLESS-Reality, yang tidak memerlukan domain sendiri. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
