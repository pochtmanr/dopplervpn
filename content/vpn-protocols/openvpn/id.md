> **Singkatnya.** OpenVPN adalah veteran VPN open-source: fleksibel, didukung luas, dan sudah dipahami dengan baik setelah lebih dari dua dekade. Namun protokol ini lebih lambat daripada protokol yang lebih baru dan, menurut riset yang dipublikasikan, termasuk yang paling mudah dikenali sidik jarinya oleh ISP.

## Apa itu OpenVPN?

OpenVPN adalah perangkat lunak VPN open-source gratis yang pertama kali dirilis oleh James Yonan [pada Mei 2001](https://en.wikipedia.org/wiki/OpenVPN). Sepanjang sebagian besar 2000-an dan 2010-an, ia menjadi pilihan standar untuk layanan VPN komersial dan akses jarak jauh perusahaan, dan hingga kini masih disertakan di banyak router dan produk enterprise.

OpenVPN berjalan di user space, bukan di dalam kernel sistem operasi, dan mengandalkan pustaka OpenSSL serta protokol TLS untuk pertukaran kuncinya. Port yang ditetapkan IANA adalah 1194, meskipun OpenVPN dapat berjalan melalui UDP atau TCP di hampir semua port.

## Bagaimana cara kerjanya?

OpenVPN memakai protokol khusus dengan dua bagian. Saluran kontrol menggunakan TLS untuk mengautentikasi kedua sisi, biasanya dengan sertifikat, dan menyepakati kunci. Saluran data kemudian membawa lalu lintas Anda, yang dienkripsi dengan kunci tersebut, di dalam paket UDP atau TCP.

Struktur itu membuat OpenVPN sangat dapat dikonfigurasi. Anda dapat memilih cipher, metode autentikasi, port, dan transport, serta menjalankannya melalui proxy. Harga dari fleksibilitas itu adalah kompleksitas: lebih banyak kode, lebih banyak pengaturan, dan lebih banyak peluang berakhir dengan konfigurasi yang lemah.

## Mengapa OpenVPN diblokir?

TLS di dalam OpenVPN tidak sama dengan kunjungan HTTPS ke sebuah situs web. OpenVPN membungkus handshake TLS-nya dengan framing paketnya sendiri, sehingga lalu lintasnya memiliki bentuk yang tidak dimiliki lalu lintas web biasa.

Para peneliti mengukur seberapa besar pengaruhnya. Tim dari University of Michigan dan pihak lain [membangun sistem fingerprinting](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) dan menjalankannya di dalam sebuah ISP yang melayani sekitar satu juta pengguna. Sistem itu mengidentifikasi **lebih dari 85% aliran OpenVPN** dengan sangat sedikit positif palsu, dan juga menangkap sebagian besar konfigurasi OpenVPN "terobfuskasi" komersial yang mereka uji.

Pemfilteran di dunia nyata mengikuti riset tersebut. Pada Agustus 2023 pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) bahwa operator seluler memutus koneksi OpenVPN tidak lama setelah dimulai.

## Kapan sebaiknya menggunakan OpenVPN?

- **Kompatibilitas.** Router lama, gateway enterprise, dan sebagian jaringan perusahaan mendukung OpenVPN dan tidak ada yang lebih baru.
- **Jaringan khusus TCP.** OpenVPN dapat berjalan melalui TCP saat UDP diblokir, sesuatu yang tidak dapat dilakukan [WireGuard](/vpn-protocols/wireguard) tanpa bantuan.
- **Bukan di jaringan yang difilter.** Di tempat VPN diblokir, OpenVPN cenderung gagal lebih awal. Protokol yang meniru lalu lintas web normal, seperti [VLESS-Reality](/vpn-protocols/vless-reality), adalah alat yang lebih tepat. [Panduan sensor](/bypass-censorship) kami menjelaskan bagaimana sistem pemfilteran memutuskan apa yang akan diputus.

## Apakah Doppler menggunakan OpenVPN?

Tidak. Doppler menggunakan VLESS-Reality di semua platform. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menjelaskan bagaimana kami memilihnya.
