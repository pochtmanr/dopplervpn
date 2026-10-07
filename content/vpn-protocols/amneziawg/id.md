> **Singkatnya.** AmneziaWG adalah fork WireGuard yang mempertahankan kecepatan dan kriptografinya, tetapi mengubah bentuk paket dan header yang membuat WireGuard mudah dikenali. Ia pilihan yang kuat di tempat WireGuard biasa diblokir, dengan satu syarat: setelah obfuskasinya aktif, ia tidak lagi dapat berkomunikasi dengan server WireGuard standar.

## Apa itu AmneziaWG?

AmneziaWG dikembangkan oleh tim di balik [Amnezia VPN](https://amnezia.org/), aplikasi open-source untuk menjalankan server VPN sendiri. [Implementasi Go](https://github.com/amnezia-vpn/amneziawg-go) proyek ini dimulai pada 2023. Ia mengambil [WireGuard](/vpn-protocols/wireguard), yang cepat dan sederhana tetapi memiliki handshake tetap yang mudah dikenali, dan menambahkan lapisan yang menyamarkannya.

## Apa yang diubahnya?

[Dokumentasi AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) menjelaskan beberapa mekanisme, masing-masing dikendalikan oleh parameter konfigurasi:

- **Header dinamis (H1–H4).** Paket WireGuard standar diawali tipe pesan yang tetap untuk masing-masing dari empat formatnya. AmneziaWG mengganti nilai-nilai itu dengan angka yang dipilih dari rentang yang dikonfigurasi, sehingga dua penyiapan berbeda tidak memiliki header yang sama dan tidak ada satu aturan filter yang cocok dengan semuanya.
- **Pengacakan panjang paket (S1–S4).** Pada WireGuard, paket handshake awal selalu tepat 148 byte. AmneziaWG menambahkan prefiks acak ke setiap tipe paket sehingga ukurannya bervariasi.
- **Paket sampah (Jc, Jmin, Jmax).** Sebelum handshake, klien mengirim sejumlah paket pseudoacak dengan panjang acak yang dapat dikonfigurasi, yang mengaburkan awal sesi baik dari segi waktu maupun ukuran.
- **Perlindungan header.** Versi yang lebih baru juga dapat mengenkripsi bidang tipe pesan itu sendiri.

Di bawahnya, kriptografi dan desain keseluruhannya tetap milik WireGuard.

## Seberapa sulit memblokir AmneziaWG?

Ia menghilangkan tanda tangan sederhana yang dipakai filter terhadap WireGuard: ukuran tetap dan nilai header tetap. Itu membuatnya jauh lebih tangguh daripada WireGuard biasa di jaringan yang memblokir VPN.

Ia tetap berjalan di atas UDP, sehingga jaringan yang membatasi atau memblokir UDP secara luas akan memengaruhinya, dan lalu lintasnya tidak meniru aplikasi tertentu seperti [VLESS-Reality](/vpn-protocols/vless-reality) meniru kunjungan TLS ke situs web asli. Filter yang memblokir UDP yang tidak dikenali secara menyeluruh masih dapat menjaringnya.

## Kapan sebaiknya menggunakan AmneziaWG?

- **Di tempat WireGuard diblokir** tetapi UDP masih berfungsi, dan Anda menginginkan kecepatan seperti WireGuard.
- **Server hosting sendiri**, dengan aplikasi Amnezia VPN untuk menyiapkannya.
- Sediakan opsi berbasis TCP, seperti VLESS-Reality, untuk jaringan yang memfilter UDP. [Panduan untuk Rusia](/vpn-for-russia) kami membahas apa yang saat ini masih lolos di sana.

## Apakah Doppler menggunakan AmneziaWG?

Tidak. Doppler menggunakan VLESS-Reality. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
