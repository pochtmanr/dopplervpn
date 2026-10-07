> **Ringkasnya.** Kami membina Doppler untuk orang di rangkaian yang menyekat VPN. Pada rangkaian itu, soalannya bukan protokol mana yang paling pantas di atas kertas, tetapi yang mana masih bersambung esok. Kami memilih VLESS dengan Reality kerana ia memberi penapis paling sedikit untuk dikenali dan paling sedikit untuk disekat, dan kami menerima pertukaran yang datang bersamanya.

## Untuk apakah kami memilih?

Doppler dibina untuk orang yang bersambung dari tempat VPN ditapis dengan sengaja: Rusia, Iran, China, sebahagian Teluk. Pada rangkaian itu, penyulitan ialah bahagian yang mudah. Setiap protokol dalam [perbandingan](/vpn-protocols) kami menyulitkan dengan baik. Yang membezakannya ialah sama ada sistem penapisan dapat mengetahui bahawa sambungan itu ialah VPN, dan apa yang boleh disekat setelah ia mengetahuinya.

Jadi kami menilai setiap pilihan berdasarkan tiga soalan:

1. **Adakah ia mempunyai cap jari yang tetap?** Jabat tangan bersaiz tetap atau port piawai boleh dipadankan oleh satu peraturan.
2. **Apa yang berlaku apabila penapis menyiasat pelayan?** Tembok api secara aktif bersambung ke proksi yang disyaki untuk melihat cara ia bertindak balas.
3. **Adakah ada sesuatu untuk diletakkan dalam senarai sekatan?** Domain, sijil atau pelayan yang boleh dikenali ialah sasaran walaupun trafik itu sendiri tersembunyi dengan baik.

## Mengapakah bukan WireGuard, OpenVPN atau IKEv2?

Ketiga-tiganya gagal pada soalan pertama. Paket jabat tangan [WireGuard](/vpn-protocols/wireguard) sentiasa 148 dan 92 bait. [OpenVPN](/vpn-protocols/openvpn) dikenal pasti dalam lebih 85% aliran oleh penyelidik yang bekerja di dalam ISP sebenar. [IKEv2](/vpn-protocols/ikev2) berjalan pada port UDP piawai yang boleh digugurkan secara pukal. Pada Ogos 2023, pengguna di Rusia [melaporkan](https://github.com/net4people/bbs/issues/274) bahawa pembawa memutuskan WireGuard dan OpenVPN dalam paket-paket pertama. Ini ialah protokol yang baik untuk rangkaian terbuka. Ia tidak direka untuk rangkaian kami.

## Mengapakah bukan Shadowsocks atau VMess?

Mereka lulus soalan pertama dengan kelihatan seperti bait rawak, dan itu ternyata menjadi cap jari tersendiri. Sejak November 2021, Great Firewall telah [menyekat trafik tersulit sepenuhnya](https://gfw.report/publications/usenixsecurity23/en/) yang tidak menyerupai mana-mana protokol yang diketahui. [VMess](/vpn-protocols/vmess) boleh dibungkus dalam TLS untuk mengelakkannya, tetapi kemudian ia memerlukan domain, yang membawa kita kepada soalan ketiga.

## Mengapakah bukan Trojan?

[Trojan](/vpn-protocols/trojan) menjawab dua soalan pertama dengan baik: ia TLS sebenar, dan siasatan melihat laman web sebenar. Tetapi setiap pelayan Trojan memerlukan domain dan sijil sendiri. Setelah penapis mengetahui domain itu, ia boleh menyekatnya, dan menjalankan banyak domain ialah pengejaran yang berterusan.

## Apa yang VLESS-Reality lakukan dengan betul

[VLESS-Reality](/vpn-protocols/vless-reality) menjawab ketiga-tiganya:

- **Tiada cap jari tetap.** Sambungan itu ialah TLS 1.3 melalui TCP, trafik tersulit yang paling lazim di internet.
- **Siasatan melihat laman web sebenar.** Reality memajukan sesiapa yang tidak dapat mengesahkan diri ke laman sebenar yang jabat tangannya dipinjam, dengan sijil tulen laman itu.
- **Tiada apa-apa milik kami untuk disekat mengikut nama.** Tiada domain atau sijil Doppler dalam jabat tangan.

Ia juga berjalan melalui TCP, jadi ia terus berfungsi pada rangkaian yang memperlahankan atau menyekat UDP, di mana [Hysteria 2](/vpn-protocols/hysteria2) dan [AmneziaWG](/vpn-protocols/amneziawg) bergelut. Dan VLESS sendiri kecil: ia bergantung pada TLS untuk penyulitan dan bukannya menambah penyulitan sendiri, jadi tiada penyulitan berganda.

## Apa yang kami lepaskan

- **Kelajuan mentah pada pautan yang kehilangan paket.** TCP pulih daripada kehilangan paket dengan kurang lancar berbanding QUIC atau UDP WireGuard. Pada sambungan yang bersih, perbezaannya kecil; pada sambungan yang lemah, ia boleh ketara.
- **Sokongan terbina dalam sistem pengendalian.** Tiada sistem pengendalian yang menyertakan klien VLESS, jadi anda memerlukan aplikasi. Kami memutuskan itu boleh diterima dan membina aplikasi sendiri untuk iOS, Android, macOS dan Windows.
- **Ketidakkelihatan yang sempurna.** Ia tidak wujud. Kajian telah menunjukkan [TLS di dalam TLS boleh dicap jari](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), dan pada November 2025 sesetengah ISP Rusia [dilaporkan](https://github.com/net4people/bbs/issues/546) memutuskan sambungan Reality. VLESS-Reality ialah reka bentuk ketahanan terhadap penapisan, bukan jaminan.

## Apa yang kami lakukan tentang had itu

Penapisan berubah, jadi pilihan protokol bukan penghujung kerja. Kami melaraskan tetapan pelayan dan laman yang dipinjam oleh Reality apabila penapisan berubah, dan kami terus memantau penyelidikan serta laporan komuniti yang sama yang dipetik di halaman-halaman ini. Jika pendekatan yang lebih baik muncul, halaman ini akan menyatakannya.

Untuk kisah teknikal penuh tentang cara VLESS-Reality berfungsi, baca [terowong VLESS-Reality](/how-it-works/vless-reality-tunnel). Untuk mencubanya, lihat [VLESS VPN](/vless-vpn).
