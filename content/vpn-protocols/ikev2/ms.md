> **Ringkasnya.** IKEv2/IPsec ialah VPN yang telah difahami oleh telefon dan komputer riba anda tanpa memerlukan sebarang aplikasi. Ia pantas dan mengendalikan perpindahan antara Wi-Fi dan data mudah alih dengan baik. Ia juga berjalan pada port tetap yang diketahui umum, menjadikannya salah satu protokol yang paling mudah disekat oleh penapis.

## Apakah IKEv2/IPsec?

"IKEv2" sebenarnya terdiri daripada dua bahagian yang bekerja bersama. IPsec ialah suite yang menyulitkan dan mengesahkan paket IP. IKE, Internet Key Exchange, ialah protokol yang digunakan oleh kedua-dua pihak untuk saling mengesahkan dan bersetuju tentang kunci IPsec. Versi 2 IKE telah dipiawaikan [pada Disember 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), dan spesifikasi semasanya ialah [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Oleh kerana ia piawaian IETF, IKEv2 terbina dalam iOS, macOS dan Windows, serta dalam Android sejak versi 11. Banyak get laluan VPN korporat menggunakannya.

## Bagaimanakah ia berfungsi?

Pertukaran kunci berjalan melalui UDP, [biasanya pada port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Setelah kedua-dua pihak bersetuju tentang kunci, tindanan IPsec sistem pengendalian menyulitkan trafik anda menggunakan Encapsulating Security Payload (ESP). Apabila terdapat penghala NAT di tengah-tengah, seperti pada hampir setiap rangkaian rumah dan mudah alih, kedua-dua IKE dan ESP dibungkus dalam UDP pada port 4500.

IKEv2 mempunyai sambungan piawai bernama [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) yang membolehkan sambungan bertahan apabila alamat IP berubah. Itulah sebabnya IKEv2 selesa digunakan pada telefon: apabila anda keluar daripada liputan Wi-Fi ke data mudah alih, terowong terus berjalan dan bukannya bersambung semula dari awal.

## Mengapakah IKEv2 mudah disekat?

IKEv2 tidak cuba kelihatan seperti apa-apa yang lain. Trafiknya menggunakan port UDP yang diketahui umum dan mempunyai format IKE serta ESP piawai yang boleh dihuraikan oleh mana-mana alat rangkaian. Menyekatnya tidak memerlukan pemeriksaan paket mendalam pun: penapis boleh menggugurkan port UDP 500 dan 4500, atau mengenali pertukaran IKE secara langsung.

Itu pertukaran yang munasabah untuk rangkaian korporat dan perjalanan di negara yang terbuka, di mana dikenali sebagai VPN tidak menimbulkan kos. Pada rangkaian yang sengaja menapis VPN, ia biasanya perkara pertama yang berhenti berfungsi.

## Bilakah anda patut menggunakan IKEv2?

- **Aplikasi tidak dibenarkan.** Pada peranti terurus yang tidak membenarkan anda memasang perisian, klien IKEv2 terbina dalam mungkin satu-satunya pilihan.
- **Perayauan mudah alih pada rangkaian terbuka.** MOBIKE menjadikan peralihan antara rangkaian lancar.
- **Bukan di bawah penapisan.** Pada rangkaian yang ditapis, pilih protokol yang direka untuk menyatu, seperti [VLESS-Reality](/vpn-protocols/vless-reality). [Panduan penapisan](/bypass-censorship) kami menerangkan cara penyekatan berfungsi.

## Adakah Doppler menggunakan IKEv2?

Tidak. Doppler bersambung dengan VLESS-Reality di dalam aplikasinya sendiri. Lihat [mengapa VLESS](/vpn-protocols/why-vless) untuk sebab-sebabnya.
