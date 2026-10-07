> **Ringkasnya.** VMess ialah protokol asal projek V2Ray. Ia menyulitkan pengepalanya sendiri dan biasanya dibungkus dalam pengangkutan lain, seperti WebSocket melalui TLS, supaya kelihatan seperti trafik web. Ia masih berfungsi, tetapi penggantinya, VLESS dan Trojan, melakukan tugas yang sama dengan overhed yang lebih rendah.

## Apakah VMess?

VMess ialah protokol proksi tersulit yang diperkenalkan oleh [projek V2Ray](https://github.com/v2fly/v2ray-core) apabila ia bermula pada 2015. V2Ray berkembang menjadi platform modular untuk membina proksi: satu teras, banyak protokol dan pengangkutan, serta enjin penghalaan yang menentukan trafik mana pergi ke mana. VMess ialah protokol pertamanya dan selama beberapa tahun menjadi protokol utamanya.

Seperti Shadowsocks, VMess secara teknikal ialah proksi dan bukan VPN, tetapi aplikasi berasaskan V2Ray boleh menghalakan seluruh peranti anda melaluinya.

## Bagaimanakah ia berfungsi?

Setiap pengguna mempunyai UUID yang bertindak sebagai kelayakannya. Menurut [dokumentasi protokol](https://www.v2fly.org/en_US/developer/protocols/vmess.html), pengepala permintaan klien mengandungi ID pengesahan tersulit yang dibina daripada cap masa Unix, nombor rawak dan checksum, disulitkan dengan kunci yang diterbitkan daripada ID pengguna. Pelayan menggunakannya untuk mengenali pengguna, kemudian menyahsulit baki pengepala dan data.

Dokumentasi itu menerangkan dua cara melindungi pengepala. Cara moden menggunakan penyulitan AEAD, yang menjamin pengepala tidak diubah. Cara lama menggunakan MD5 dan AES-128-CFB dan tidak dapat menjamin integriti pengepala; dokumentasi memberi amaran supaya tidak menggunakannya. Oleh kerana ID pengesahan mengandungi cap masa, jam klien dan pelayan perlu kira-kira selaras, satu punca biasa bagi masalah "tidak mahu bersambung".

## Setinggi manakah kesukaran menyekat VMess?

Dengan sendirinya, VMess kelihatan seperti bait rawak, yang meletakkannya dalam kedudukan yang sama dengan [Shadowsocks](/vpn-protocols/shadowsocks): terdedah kepada tembok api yang menyekat trafik tersulit sepenuhnya. Itulah sebabnya VMess biasanya dikerahkan di dalam WebSocket atau gRPC melalui TLS, di belakang domain dan sijil, supaya pemerhati melihat apa yang kelihatan seperti sambungan HTTPS biasa ke sebuah laman web.

Pembungkus itu melakukan sebahagian besar kerja menyembunyikan trafik, dan ia membawa kos: anda memerlukan domain, sijil dan selalunya CDN di hadapan pelayan, dan pelayan kini menyulitkan data dua kali, sekali untuk TLS dan sekali untuk VMess.

## VMess, VLESS atau Trojan?

[VLESS](/vpn-protocols/vless-reality) direka oleh projek Xray sebagai pengganti yang lebih ringan: ia mengekalkan identiti berasaskan UUID tetapi membuang penyulitan VMess sendiri dan bergantung sepenuhnya pada lapisan TLS, yang mengelakkan penyulitan berganda. [Trojan](/vpn-protocols/trojan) mengambil pendekatan yang serupa dengan kata laluan dan bukannya UUID. Perbandingan kami tentang [VLESS, VMess dan Trojan](/blog/vless-vs-vmess-vs-trojan) membincangkan butirannya.

## Adakah Doppler menggunakan VMess?

Tidak. Doppler menggunakan VLESS dengan Reality. Panduan [mengapa VLESS](/vpn-protocols/why-vless) menerangkan sebabnya.
