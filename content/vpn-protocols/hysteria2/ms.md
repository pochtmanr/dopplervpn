> **Ringkasnya.** Hysteria 2 ialah protokol proksi yang dibina di atas QUIC, pengangkutan di sebalik HTTP/3. Ia direka untuk kelajuan pada sambungan yang lemah dan yang kehilangan paket, dan bagi sesiapa yang tidak mempunyai kata laluan, pelayannya berkelakuan seperti laman web HTTP/3 biasa. Titik lemahnya ialah ia bergantung pada UDP, yang sesetengah rangkaian memperlahankan atau menyekat terus.

## Apakah Hysteria 2?

Hysteria ialah projek sumber terbuka daripada [apernet](https://github.com/apernet/hysteria); versi 2, protokol yang direka semula, dikeluarkan pada September 2023. Seperti Shadowsocks dan VLESS, ia ialah proksi dan bukan VPN klasik, dan klien boleh menghalakan seluruh peranti melaluinya.

## Bagaimanakah ia berfungsi?

Menurut [spesifikasi protokolnya](https://v2.hysteria.network/docs/developers/Protocol/), Hysteria 2 berjalan melalui QUIC seperti yang ditakrifkan dalam [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000), dengan ekstensi datagram tidak terjamin untuk trafik UDP. QUIC sudah menyediakan penyulitan TLS 1.3, strim yang dimultipleks dan persediaan sambungan yang pantas.

Pengesahan ialah tempat penyamaran bermula. Spesifikasi mensyaratkan bahawa pelayan Hysteria **mesti melaksanakan pelayan HTTP/3 yang sebenar** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) dan mengendalikan permintaan seperti mana-mana pelayan web. Klien mengesahkan diri dengan permintaan HTTP/3 khas; sesiapa lain, sama ada pelawat yang ingin tahu atau siasatan aktif, mendapat respons web biasa. Spesifikasi menyatakan bahawa, bagi pihak ketiga tanpa kelayakan, pelayan itu berkelakuan sama seperti pelayan web HTTP/3 piawai.

## Mengapakah ia pantas?

QUIC berjalan melalui UDP dan pulih daripada kehilangan paket tanpa menghentikan setiap strim seperti yang dilakukan oleh TCP. Hysteria juga boleh menggunakan kawalan kesesakan sendiri, yang ditujukan kepada pautan yang tidak stabil, jadi ia cenderung mengekalkan kelajuannya pada rangkaian mudah alih yang sesak, laluan jarak jauh dan Wi-Fi dengan gangguan, di mana protokol berasaskan TCP menjadi perlahan.

## Setinggi manakah kesukaran menyekat Hysteria 2?

Terhadap siasatan aktif, ia bertahan dengan baik, kerana siasatan melihat pelayan web. Pendedahannya ialah pengangkutan. Penapis boleh memperlahankan atau menyekat UDP, atau QUIC khususnya, tanpa memecahkan kebanyakan laman web, kerana pelayar kembali kepada HTTP/2 melalui TCP apabila HTTP/3 gagal. Apabila itu berlaku, Hysteria 2 tidak mempunyai jalan lain, manakala protokol berasaskan TCP seperti [VLESS-Reality](/vpn-protocols/vless-reality) terus berfungsi.

## Bilakah anda patut menggunakan Hysteria 2?

- **Pautan yang kehilangan paket atau jarak jauh**, di mana kawalan kesesakannya dan pemulihan kehilangan paket QUIC memberi hasil.
- **Rangkaian yang membenarkan UDP.** Semak sebelum anda bergantung padanya.
- Sebagai protokol kedua di samping pilihan TCP, supaya anda boleh bertukar apabila UDP ditapis. [Panduan penapisan](/bypass-censorship) kami merangkumi cara penapis menyasarkan pengangkutan.

## Adakah Doppler menggunakan Hysteria 2?

Tidak. Doppler menggunakan VLESS-Reality melalui TCP, yang terus berfungsi pada rangkaian yang menyekat UDP. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
