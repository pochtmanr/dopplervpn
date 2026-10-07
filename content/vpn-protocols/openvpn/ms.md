> **Ringkasnya.** OpenVPN ialah veteran dalam kalangan VPN sumber terbuka: fleksibel, disokong secara meluas, dan difahami dengan baik selepas lebih dua dekad. Ia juga lebih perlahan daripada protokol yang lebih baharu dan, menurut penyelidikan yang diterbitkan, antara yang paling mudah dicap jari oleh ISP.

## Apakah OpenVPN?

OpenVPN ialah perisian VPN sumber terbuka percuma yang mula dikeluarkan oleh James Yonan [pada Mei 2001](https://en.wikipedia.org/wiki/OpenVPN). Sepanjang kebanyakan tahun 2000-an dan 2010-an, ia menjadi pilihan lalai untuk perkhidmatan VPN komersial dan akses jauh korporat, dan ia masih disertakan dalam banyak penghala dan produk perusahaan.

Ia berjalan dalam ruang pengguna dan bukan dalam kernel sistem pengendalian, serta bergantung pada pustaka OpenSSL dan protokol TLS untuk pertukaran kuncinya. Port yang ditetapkan oleh IANA ialah 1194, walaupun OpenVPN boleh berjalan melalui UDP atau TCP pada hampir mana-mana port.

## Bagaimanakah ia berfungsi?

OpenVPN menggunakan protokol tersuai yang terdiri daripada dua bahagian. Saluran kawalan menggunakan TLS untuk mengesahkan kedua-dua pihak, biasanya dengan sijil, dan untuk bersetuju tentang kunci. Saluran data kemudian membawa trafik anda, yang disulitkan dengan kunci tersebut, di dalam paket UDP atau TCP.

Struktur itu menjadikan OpenVPN sangat boleh dikonfigurasikan. Anda boleh memilih sifer, kaedah pengesahan, port dan pengangkutan, dan menjalankannya melalui proksi. Harga bagi fleksibiliti itu ialah kerumitan: lebih banyak kod, lebih banyak tetapan, dan lebih banyak cara untuk berakhir dengan konfigurasi yang lemah.

## Mengapakah OpenVPN disekat?

TLS di dalam OpenVPN tidak sama dengan lawatan HTTPS ke sesebuah laman web. OpenVPN membungkus jabat tangan TLS-nya dalam rangka paketnya sendiri, jadi trafiknya mempunyai bentuk yang tidak ada pada trafik web biasa.

Penyelidik mengukur sejauh mana perkara itu penting. Satu pasukan dari University of Michigan dan lain-lain [membina sistem cap jari](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) dan menjalankannya di dalam sebuah ISP yang melayani kira-kira sejuta pengguna. Ia mengenal pasti **lebih 85% aliran OpenVPN** dengan sangat sedikit positif palsu, dan ia juga mengesan kebanyakan konfigurasi OpenVPN komersial "dikaburkan" yang mereka uji.

Penapisan di dunia sebenar mengikut penyelidikan itu. Pada Ogos 2023, pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) bahawa pembawa mudah alih memutuskan sambungan OpenVPN tidak lama selepas ia bermula.

## Bilakah anda patut menggunakan OpenVPN?

- **Keserasian.** Penghala lama, get laluan perusahaan dan sesetengah rangkaian korporat menyokong OpenVPN dan tiada yang lebih baharu.
- **Rangkaian TCP sahaja.** OpenVPN boleh berjalan melalui TCP apabila UDP disekat, sesuatu yang tidak dapat dilakukan oleh [WireGuard](/vpn-protocols/wireguard) tanpa bantuan.
- **Bukan pada rangkaian yang ditapis.** Di tempat VPN disekat, OpenVPN cenderung gagal lebih awal. Protokol yang meniru trafik web biasa, seperti [VLESS-Reality](/vpn-protocols/vless-reality), ialah alat yang lebih baik. [Panduan penapisan](/bypass-censorship) kami menerangkan cara sistem penapisan memutuskan apa yang hendak disekat.

## Adakah Doppler menggunakan OpenVPN?

Tidak. Doppler menggunakan VLESS-Reality pada setiap platform. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menerangkan cara kami memilihnya.
