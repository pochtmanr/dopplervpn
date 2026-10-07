> **Ringkasnya.** Trojan menyembunyikan trafik proksi di dalam sambungan TLS sebenar ke laman web sebenar yang anda kawal. Sesiapa yang bersambung tanpa kata laluan hanya akan mendapat laman web itu. Ia berfungsi dengan baik, tetapi anda memerlukan domain dan sijil sendiri, dan kedua-duanya boleh ditemui dan disekat.

## Apakah Trojan?

Trojan ialah protokol proksi daripada [projek trojan-gfw](https://github.com/trojan-gfw/trojan), yang mula dikeluarkan pada Oktober 2017. Idea di sebaliknya terdapat pada namanya: daripada mencipta penyamaran, ia bersembunyi di dalam trafik tersulit yang paling lazim di internet, iaitu HTTPS.

## Bagaimanakah ia berfungsi?

[Penerangan protokolnya](https://trojan-gfw.github.io/trojan/protocol) ringkas. Pelayan Trojan mendengar seperti pelayan HTTPS biasa, dengan sijil sebenar untuk domain sebenar. Klien melakukan jabat tangan TLS yang tulen. Kemudian, di dalam sambungan tersulit itu, ia menghantar:

- cincang SHA-224 berkod heks bagi kata laluan yang dikongsi, iaitu 56 aksara,
- satu pemisah baris,
- permintaan kecil yang menyatakan ke mana trafik harus dihalakan, dalam format yang menyerupai SOCKS5,
- satu lagi pemisah baris, diikuti oleh data pertama.

Jika cincang dan permintaan itu sah, pelayan membuka terowong ke destinasi. Jika ada yang tidak betul, pelayan menganggap sambungan itu sebagai "protokol lain" dan menyerahkannya kepada pelayan web sandaran, jadi pelawat melihat laman web biasa.

## Setinggi manakah kesukaran menyekat Trojan?

Dari luar, sambungan Trojan ialah sesi TLS ke domain anda, dengan sijil anda. Siasatan aktif mendapat laman web sebenar sebagai balasan. Itu menjadikan Trojan jauh lebih sukar diasingkan berbanding protokol yang kelihatan rawak, seperti [Shadowsocks](/vpn-protocols/shadowsocks).

Titik lemahnya ialah domain itu sendiri. Setiap pelayan memerlukan domain dan sijil, dan penapis yang mengetahui domain mana milik proksi boleh menyekatnya mengikut nama atau IP. Penyelidik juga telah menunjukkan bahawa TLS yang dibawa di dalam TLS meninggalkan corak masa dan saiz yang boleh [dicap jari](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), yang menjejaskan Trojan dan reka bentuk serupa.

[VLESS-Reality](/vpn-protocols/vless-reality) menghapuskan masalah domain dengan meminjam jabat tangan TLS sebuah laman web popular yang sedia ada, bukannya domain anda sendiri.

## Bilakah anda patut menggunakan Trojan?

- **Apabila anda mengawal sebuah domain** dan mahukan persediaan yang ringkas dan difahami dengan baik yang kelihatan seperti HTTPS.
- **Pada rangkaian yang ditapis secara sederhana** di mana domain anda tidak mungkin menjadi sasaran.
- Perbandingan kami tentang [VLESS, VMess dan Trojan](/blog/vless-vs-vmess-vs-trojan) membantu jika anda sedang memilih antaranya.

## Adakah Doppler menggunakan Trojan?

Tidak. Doppler menggunakan VLESS-Reality, yang tidak memerlukan domain tersendiri. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
