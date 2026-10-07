> **Ringkasnya.** Shadowsocks ialah proksi tersulit yang ringan dan dibina di China untuk menembusi Great Firewall. Selama bertahun-tahun ia berfungsi dengan kelihatan seperti tiada apa-apa. Sejak 2021, penyelidikan menunjukkan bahawa tembok api itu menyekat trafik jenis itu, kerana trafik sebenar jarang sebegitu rawak.

## Apakah Shadowsocks?

Shadowsocks ialah protokol proksi sumber terbuka yang mula dikeluarkan [pada April 2012](https://en.wikipedia.org/wiki/Shadowsocks). Secara tegasnya, ia bukan VPN: ia ialah proksi bergaya SOCKS5 dengan penyulitan, dan aplikasi menentukan trafik yang hendak dihantar melaluinya. Dalam praktiknya, kebanyakan klien Shadowsocks kini menawarkan mod seluruh sistem yang berfungsi seperti VPN.

Ia popular kerana ia ringkas dan pantas. Versi semasa menggunakan [sifer AEAD](https://shadowsocks.org/doc/aead.html), yang menyediakan kerahsiaan, integriti dan ketulenan dalam satu langkah, dan [edisi 2022](https://shadowsocks.org/doc/sip022.html) protokol ini memperketat perlindungan ulang tayang.

## Bagaimanakah ia berfungsi?

Klien dan pelayan berkongsi kata laluan, yang ditukar menjadi kunci penyulitan. Segala-galanya yang dihantar oleh klien, termasuk alamat laman web yang dikehendakinya, disulitkan sejak bait pertama lagi. Tiada jabat tangan yang boleh dikenali, tiada sijil dan tiada pengepala teks biasa. Bagi pemerhati, sambungan Shadowsocks ialah aliran bait yang kelihatan rawak.

## Bagaimanakah Great Firewall mengesan Shadowsocks?

Pertama, melalui penyiasatan aktif. Penyelidik di GFW Report [merekodkan](https://gfw.report/publications/imc20/en/) tembok api itu menghantar puluhan ribu siasatan kepada pelayan yang disyaki Shadowsocks, mengulang tayang dan mengubah sambungan sebenar untuk melihat bagaimana pelayan bertindak balas.

Kemudian, mulai November 2021, melalui kaedah yang lebih kasar dan lebih luas. Satu [kajian USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) mendapati tembok api itu menyekat trafik "tersulit sepenuhnya" secara masa nyata. Ia memeriksa paket pertama sesuatu sambungan dan mengecualikan apa-apa yang kelihatan seperti protokol yang diketahui atau mengandungi cukup banyak teks yang boleh dicetak. Satu peraturan mengukur purata bilangan bit yang ditetapkan bagi setiap bait: nilai pada atau di bawah 3.4, atau pada atau di atas 4.6, dikecualikan, dan data yang kelihatan rawak di antaranya tidak dikecualikan. Apa-apa yang tinggal boleh disekat.

Para penyelidik juga mendapati tembok api itu menggunakan ini pada kira-kira 26% sambungan, dan hanya pada julat IP pusat data yang popular, mungkin untuk mengehadkan kesan sampingan. Pengajaran bagi pereka protokol jelas: kelihatan rawak itu sendiri ialah cap jari.

## Bilakah anda patut menggunakan Shadowsocks?

- **Proksi yang ringan dan pantas** pada rangkaian yang tidak memeriksa trafik dengan teliti.
- **Hos sendiri** dengan alat seperti Outline, yang menjadikan persediaan mudah.
- **Dengan berhati-hati di bawah penapisan ketat.** Di China dan tempat lain yang menyekat trafik tersulit sepenuhnya, Shadowsocks jauh kurang boleh dipercayai berbanding protokol yang meniru TLS sebenar, seperti [VLESS-Reality](/vpn-protocols/vless-reality). [Sejarah protokol penapisan](/blog/censorship-protocol-history) kami menjejaki bagaimana bidang ini telah berkembang.

## Adakah Doppler menggunakan Shadowsocks?

Tidak. Doppler menggunakan VLESS-Reality, atas sebab-sebab dalam [mengapa VLESS](/vpn-protocols/why-vless).
