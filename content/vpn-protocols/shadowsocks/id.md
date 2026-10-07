> **Singkatnya.** Shadowsocks adalah proxy terenkripsi ringan yang dibuat di Tiongkok untuk menembus Great Firewall. Bertahun-tahun ia berhasil dengan tampil seperti tidak apa-apa. Sejak 2021, riset menunjukkan firewall tersebut memblokir justru jenis lalu lintas seperti itu, karena lalu lintas asli jarang sekali seacak itu.

## Apa itu Shadowsocks?

Shadowsocks adalah protokol proxy open-source yang pertama kali dirilis [pada April 2012](https://en.wikipedia.org/wiki/Shadowsocks). Secara tegas, ia bukan VPN: ia adalah proxy bergaya SOCKS5 dengan enkripsi, dan aplikasilah yang menentukan lalu lintas mana yang dikirim melaluinya. Dalam praktiknya, sebagian besar klien Shadowsocks kini menawarkan mode seluruh sistem yang bekerja seperti VPN.

Protokol ini populer karena sederhana dan cepat. Versi terkini memakai [cipher AEAD](https://shadowsocks.org/doc/aead.html), yang menyediakan kerahasiaan, integritas, dan keaslian dalam satu langkah, dan [edisi 2022](https://shadowsocks.org/doc/sip022.html) dari protokol ini memperketat perlindungan replay.

## Bagaimana cara kerjanya?

Klien dan server berbagi sebuah kata sandi, yang diubah menjadi kunci enkripsi. Semua yang dikirim klien, termasuk alamat situs web yang dituju, dienkripsi sejak byte pertama. Tidak ada handshake yang dapat dikenali, tidak ada sertifikat, dan tidak ada header plaintext. Bagi pengamat, koneksi Shadowsocks adalah aliran byte yang tampak acak.

## Bagaimana Great Firewall mendeteksi Shadowsocks?

Pertama, melalui active probing. Peneliti di GFW Report [mencatat](https://gfw.report/publications/imc20/en/) firewall mengirim puluhan ribu probe ke server yang diduga Shadowsocks, memutar ulang dan mengubah koneksi asli untuk melihat bagaimana server bereaksi.

Kemudian, sejak November 2021, melalui metode yang lebih kasar dan lebih luas. [Studi USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) menemukan firewall memblokir lalu lintas "terenkripsi penuh" secara real time. Firewall melihat paket pertama sebuah koneksi dan mengecualikan apa pun yang tampak seperti protokol yang dikenal atau berisi cukup banyak teks yang dapat dicetak. Satu aturan mengukur rata-rata jumlah bit bernilai satu per byte: nilai 3.4 atau kurang, atau 4.6 atau lebih, dikecualikan, sedangkan data yang tampak acak di antaranya tidak. Sisanya dapat diblokir.

Para peneliti juga menemukan bahwa firewall menerapkan ini pada sekitar 26% koneksi, dan hanya pada rentang IP pusat data populer, kemungkinan untuk membatasi dampak yang tidak disengaja. Pelajaran bagi perancang protokol jelas: tampak acak itu sendiri adalah sidik jari.

## Kapan sebaiknya menggunakan Shadowsocks?

- **Proxy yang ringan dan cepat** di jaringan yang tidak memeriksa lalu lintas dengan ketat.
- **Hosting sendiri** dengan alat seperti Outline, yang membuat penyiapan menjadi mudah.
- **Dengan hati-hati di bawah pemfilteran ketat.** Di Tiongkok dan tempat lain yang memblokir lalu lintas terenkripsi penuh, Shadowsocks jauh kurang andal dibandingkan protokol yang meniru TLS asli, seperti [VLESS-Reality](/vpn-protocols/vless-reality). [Sejarah protokol anti-sensor](/blog/censorship-protocol-history) kami menelusuri bagaimana bidang ini berkembang.

## Apakah Doppler menggunakan Shadowsocks?

Tidak. Doppler menggunakan VLESS-Reality, dengan alasan yang dijelaskan di [mengapa VLESS](/vpn-protocols/why-vless).
