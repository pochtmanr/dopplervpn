> **Kısaca.** Doppler'ı VPN'lerin engellendiği ağlardaki insanlar için geliştirdik. Bu ağlarda mesele, kâğıt üzerinde hangi protokolün en hızlı olduğu değil, hangisinin yarın da bağlı kalacağıdır. VLESS'i Reality ile seçtik; çünkü sansürcüye tanıyacak ve engelleyecek en az şeyi verir. Beraberinde gelen ödünleri de kabul ediyoruz.

## Neye göre seçim yaptık?

Doppler, VPN'lerin bilerek filtrelendiği yerlerden bağlananlar için geliştirildi: Rusya, İran, Çin, Körfez'in bazı bölgeleri. Bu ağlarda şifreleme işin kolay kısmıdır. [Karşılaştırmamızdaki](/vpn-protocols) her protokol iyi şifreler. Onları birbirinden ayıran, bir filtreleme sisteminin bağlantının VPN olduğunu anlayıp anlayamadığı ve anladığında neyi engelleyebildiğidir.

Bu yüzden her seçeneği üç soruya göre değerlendirdik:

1. **Sabit bir parmak izi var mı?** Sabit boyutlu bir el sıkışma ya da standart bir port tek bir kuralla eşleştirilebilir.
2. **Bir sansürcü sunucuyu yokladığında ne olur?** Güvenlik duvarları, nasıl yanıt verdiklerini görmek için şüpheli vekil sunuculara aktif olarak bağlanır.
3. **Engelleme listesine konabilecek bir şey var mı?** Bir alan adı, bir sertifika ya da tanınabilir bir sunucu, trafiğin kendisi iyi gizlenmiş olsa bile bir hedeftir.

## Neden WireGuard, OpenVPN ya da IKEv2 değil?

Üçü de ilk soruda başarısız olur. [WireGuard](/vpn-protocols/wireguard)'ın el sıkışma paketleri her zaman 148 ve 92 bayttır. [OpenVPN](/vpn-protocols/openvpn), gerçek bir internet servis sağlayıcısının içinde çalışan araştırmacılar tarafından akışların %85'inden fazlasında tanındı. [IKEv2](/vpn-protocols/ikev2), topluca düşürülebilen standart UDP portlarında çalışır. Ağustos 2023'te Rusya'daki kullanıcılar, operatörlerin WireGuard ve OpenVPN'i ilk paketler içinde kestiğini [bildirdi](https://github.com/net4people/bbs/issues/274). Bunlar açık ağlar için iyi protokollerdir. Bizim ağlarımız için tasarlanmadılar.

## Neden Shadowsocks ya da VMess değil?

İlk soruyu rastgele baytlara benzeyerek geçerler; bunun da başlı başına bir parmak izi olduğu ortaya çıktı. Kasım 2021'den beri Büyük Güvenlik Duvarı, bilinen hiçbir protokole benzemeyen [tamamen şifreli trafiği engelliyor](https://gfw.report/publications/usenixsecurity23/en/). [VMess](/vpn-protocols/vmess) bundan kaçınmak için TLS'e sarılabilir, ancak o zaman bir alan adına ihtiyaç duyar; bu da bizi üçüncü soruya getirir.

## Neden Trojan değil?

[Trojan](/vpn-protocols/trojan) ilk iki soruya iyi yanıt verir: gerçek TLS'tir ve yoklamalar gerçek bir web sitesi görür. Ancak her Trojan sunucusunun kendi alan adına ve sertifikasına ihtiyacı vardır. Bir sansürcü o alan adını öğrendiğinde onu engelleyebilir; çok sayıda alan adı işletmek ise sürekli bir kovalamacadır.

## VLESS-Reality neyi doğru yapıyor?

[VLESS-Reality](/vpn-protocols/vless-reality) üçüne de yanıt verir:

- **Sabit parmak izi yok.** Bağlantı, internetteki en yaygın şifreli trafik olan TCP üzerinden TLS 1.3'tür.
- **Yoklamalar gerçek bir web sitesi görür.** Reality, kimliğini doğrulayamayan herkesi, el sıkışmasını ödünç aldığı gerçek siteye, o sitenin özgün sertifikasıyla yönlendirir.
- **Adıyla engellenebilecek bize ait bir şey yok.** El sıkışmada Doppler'a ait bir alan adı ya da sertifika yoktur.

Ayrıca TCP üzerinde çalışır; bu yüzden UDP'yi kısıtlayan ya da engelleyen ağlarda, yani [Hysteria 2](/vpn-protocols/hysteria2) ve [AmneziaWG](/vpn-protocols/amneziawg)'nin zorlandığı yerlerde çalışmaya devam eder. VLESS'in kendisi de küçüktür: kendi şifrelemesini eklemek yerine şifreleme için TLS'e dayanır; dolayısıyla çift şifreleme yoktur.

## Nelerden vazgeçtik?

- **Kayıplı bağlantılarda ham hız.** TCP, paket kaybından QUIC'e ya da WireGuard'ın UDP'sine göre daha az zarif toparlanır. Temiz bir bağlantıda fark küçüktür; zayıf bir bağlantıda fark edilebilir olabilir.
- **Yerleşik işletim sistemi desteği.** Hiçbir işletim sistemi bir VLESS istemcisiyle gelmez; bu yüzden bir uygulamaya ihtiyacınız var. Bunun kabul edilebilir olduğuna karar verdik ve iOS, Android, macOS ve Windows için kendi uygulamalarımızı geliştirdik.
- **Kusursuz görünmezlik.** Böyle bir şey yoktur. Araştırmalar [TLS içinde TLS'in parmak izinin çıkarılabildiğini](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) gösterdi ve Kasım 2025'te bazı Rus internet servis sağlayıcılarının Reality bağlantılarını kestiği [bildirildi](https://github.com/net4people/bbs/issues/546). VLESS-Reality bir sansüre direnç tasarımıdır, garanti değildir.

## Sınırlar konusunda ne yapıyoruz?

Sansür değişiyor; bu yüzden protokol seçimi işin sonu değil. Filtreleme değiştikçe sunucu ayarlarını ve Reality'nin ödünç aldığı siteleri ayarlıyor, bu sayfalarda anılan aynı araştırmaları ve topluluk bildirimlerini izlemeyi sürdürüyoruz. Daha iyi bir yaklaşım ortaya çıkarsa bu sayfa bunu söyleyecek.

VLESS-Reality'nin nasıl çalıştığının tüm teknik hikâyesi için [VLESS-Reality tüneli](/how-it-works/vless-reality-tunnel) yazısını okuyun. Denemek için [VLESS VPN](/vless-vpn) sayfasına bakın.
