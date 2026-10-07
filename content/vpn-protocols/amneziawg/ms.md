> **Ringkasnya.** AmneziaWG ialah fork WireGuard yang mengekalkan kelajuan dan kriptografinya tetapi mengubah bentuk paket dan pengepala yang menjadikan WireGuard mudah dikesan. Ia ialah pilihan yang kukuh di tempat WireGuard biasa disekat, dengan satu kekurangan: ia tidak lagi berkomunikasi dengan pelayan WireGuard piawai apabila pengaburannya dihidupkan.

## Apakah AmneziaWG?

AmneziaWG dibangunkan oleh pasukan di sebalik [Amnezia VPN](https://amnezia.org/), aplikasi sumber terbuka untuk menjalankan pelayan VPN sendiri. [Pelaksanaan Go](https://github.com/amnezia-vpn/amneziawg-go) projek ini dimulakan pada 2023. Ia mengambil [WireGuard](/vpn-protocols/wireguard), yang pantas dan ringkas tetapi mempunyai jabat tangan yang tetap dan mudah dikenali, lalu menambah lapisan yang menyamarnya.

## Apakah yang diubahnya?

[Dokumentasi AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) menerangkan beberapa mekanisme, masing-masing dikawal oleh parameter konfigurasi:

- **Pengepala dinamik (H1–H4).** Paket WireGuard piawai bermula dengan jenis mesej tetap bagi setiap satu daripada empat format paketnya. AmneziaWG menggantikan nilai-nilai itu dengan nombor yang dipilih daripada julat yang dikonfigurasikan, jadi dua persediaan yang berbeza tidak berkongsi pengepala dan tiada satu peraturan penapis yang sepadan dengan kesemuanya.
- **Panjang paket yang dirawakkan (S1–S4).** Dalam WireGuard, paket jabat tangan awal sentiasa tepat 148 bait. AmneziaWG menambah awalan rawak pada setiap jenis paket supaya saiznya berubah-ubah.
- **Paket sampah (Jc, Jmin, Jmax).** Sebelum jabat tangan, klien menghantar bilangan yang boleh dikonfigurasikan bagi paket rawak semu berpanjang rawak, yang mengaburkan permulaan sesi dari segi masa dan saiz.
- **Perlindungan pengepala.** Versi yang lebih baharu juga boleh menyulitkan medan jenis mesej itu sendiri.

Di bawahnya, kriptografi dan reka bentuk keseluruhan kekal milik WireGuard.

## Setinggi manakah kesukaran menyekat AmneziaWG?

Ia menghapuskan tandatangan mudah yang digunakan oleh penapis terhadap WireGuard: saiz tetap dan nilai pengepala tetap. Itu menjadikannya jauh lebih berdaya tahan daripada WireGuard biasa pada rangkaian yang menyekat VPN.

Ia masih berjalan melalui UDP, jadi rangkaian yang memperlahankan atau menyekat UDP secara meluas akan menjejaskannya, dan trafiknya tidak meniru mana-mana aplikasi tertentu seperti cara [VLESS-Reality](/vpn-protocols/vless-reality) meniru lawatan TLS ke laman web sebenar. Penapis yang menyekat terus UDP yang tidak dapat dikenali masih boleh menangkapnya.

## Bilakah anda patut menggunakan AmneziaWG?

- **Di tempat WireGuard disekat** tetapi UDP masih berfungsi, dan anda mahukan kelajuan seperti WireGuard.
- **Pelayan yang dihos sendiri**, menggunakan aplikasi Amnezia VPN untuk menyediakannya.
- Simpan pilihan berasaskan TCP, seperti VLESS-Reality, untuk rangkaian yang menapis UDP. [Panduan untuk Rusia](/vpn-for-russia) kami merangkumi apa yang kini dapat dilalui di sana.

## Adakah Doppler menggunakan AmneziaWG?

Tidak. Doppler menggunakan VLESS-Reality. Lihat [mengapa VLESS](/vpn-protocols/why-vless).
