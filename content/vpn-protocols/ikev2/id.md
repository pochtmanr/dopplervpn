> **Singkatnya.** IKEv2/IPsec adalah VPN yang sudah dipahami ponsel dan laptop Anda tanpa aplikasi apa pun. Protokol ini cepat dan menangani perpindahan antara Wi-Fi dan data seluler dengan baik. Ia juga berjalan di port tetap yang sudah dikenal luas, sehingga menjadi salah satu protokol yang paling mudah diblokir oleh sensor.

## Apa itu IKEv2/IPsec?

"IKEv2" sebenarnya terdiri dari dua bagian yang bekerja bersama. IPsec adalah rangkaian yang mengenkripsi dan mengautentikasi paket IP. IKE, Internet Key Exchange, adalah protokol yang dipakai kedua sisi untuk saling mengautentikasi dan menyepakati kunci IPsec. IKE versi 2 distandarisasi [pada Desember 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), dan spesifikasi terkininya adalah [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Karena merupakan standar IETF, IKEv2 tertanam di iOS, macOS, dan Windows, serta di Android sejak versi 11. Banyak gateway VPN perusahaan menggunakannya.

## Bagaimana cara kerjanya?

Pertukaran kunci berjalan melalui UDP, [biasanya di port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Setelah kedua sisi menyepakati kunci, tumpukan IPsec milik sistem operasi mengenkripsi lalu lintas Anda menggunakan Encapsulating Security Payload (ESP). Bila ada router NAT di antaranya, seperti pada hampir semua jaringan rumah dan seluler, IKE dan ESP dibungkus dalam UDP di port 4500.

IKEv2 memiliki ekstensi standar bernama [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) yang memungkinkan koneksi bertahan saat alamat IP berubah. Itulah sebabnya IKEv2 nyaman di ponsel: saat Anda keluar dari jangkauan Wi-Fi ke data seluler, tunnel terus berjalan alih-alih tersambung ulang dari awal.

## Mengapa IKEv2 mudah diblokir?

IKEv2 tidak berusaha menyerupai apa pun. Lalu lintasnya memakai port UDP yang dikenal luas dan memiliki format IKE dan ESP standar yang dapat diurai oleh alat jaringan mana pun. Memblokirnya bahkan tidak memerlukan deep packet inspection: filter cukup menjatuhkan port UDP 500 dan 4500, atau mengenali pertukaran IKE secara langsung.

Itu kompromi yang wajar untuk jaringan perusahaan dan perjalanan di negara yang terbuka, di mana dikenali sebagai VPN tidak berakibat apa pun. Di jaringan yang sengaja memfilter VPN, ini biasanya hal pertama yang berhenti berfungsi.

## Kapan sebaiknya menggunakan IKEv2?

- **Aplikasi tidak diizinkan.** Pada perangkat terkelola yang tidak memungkinkan Anda memasang perangkat lunak, klien IKEv2 bawaan mungkin satu-satunya pilihan.
- **Roaming seluler di jaringan terbuka.** MOBIKE membuat perpindahan antarjaringan berjalan mulus.
- **Tidak berada di bawah sensor.** Di jaringan yang difilter, pilih protokol yang dirancang untuk berbaur, seperti [VLESS-Reality](/vpn-protocols/vless-reality). [Panduan sensor](/bypass-censorship) kami menjelaskan cara kerja pemblokiran.

## Apakah Doppler menggunakan IKEv2?

Tidak. Doppler terhubung dengan VLESS-Reality di dalam aplikasinya sendiri. Lihat [mengapa VLESS](/vpn-protocols/why-vless) untuk alasannya.
