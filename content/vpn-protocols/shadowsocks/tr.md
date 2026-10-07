> **Kısaca.** Shadowsocks, Çin'de Büyük Güvenlik Duvarı'nı aşmak için geliştirilmiş hafif, şifreli bir vekil sunucudur. Yıllarca hiçbir şeye benzemeyerek çalıştı. 2021'den beri yapılan araştırmalar, güvenlik duvarının tam da bu tür trafiği engellediğini gösteriyor; çünkü gerçek trafik nadiren bu kadar rastgele olur.

## Shadowsocks nedir?

Shadowsocks, ilk kez [Nisan 2012'de](https://en.wikipedia.org/wiki/Shadowsocks) yayımlanan açık kaynaklı bir vekil sunucu protokolüdür. Kesin konuşmak gerekirse bir VPN değildir: şifreleme ekli, SOCKS5 tarzı bir vekil sunucudur ve hangi trafiğin üzerinden geçeceğine uygulamalar karar verir. Uygulamada ise çoğu Shadowsocks istemcisi artık VPN gibi davranan, sistem genelinde çalışan bir kip sunar.

Basit ve hızlı olduğu için popülerdir. Güncel sürümler gizlilik, bütünlük ve özgünlüğü tek adımda sağlayan [AEAD şifreleri](https://shadowsocks.org/doc/aead.html) kullanır; protokolün [2022 sürümü](https://shadowsocks.org/doc/sip022.html) ise tekrar saldırılarına karşı korumayı sıkılaştırmıştır.

## Nasıl çalışır?

İstemci ve sunucu, bir şifre anahtarına dönüştürülen ortak bir parolayı paylaşır. İstemcinin gönderdiği her şey, istediği web sitesinin adresi dahil, ilk bayttan itibaren şifrelenir. Tanınabilir bir el sıkışma, sertifika ya da düz metin başlık yoktur. Bir gözlemciye göre Shadowsocks bağlantısı, rastgele görünen baytlardan oluşan bir akıştır.

## Büyük Güvenlik Duvarı Shadowsocks'u nasıl tespit eder?

Önce aktif yoklamayla. GFW Report araştırmacıları, güvenlik duvarının şüpheli Shadowsocks sunucularına on binlerce yoklama gönderdiğini, sunucunun nasıl tepki verdiğini görmek için gerçek bağlantıları yeniden oynatıp değiştirdiğini [kayda geçirdi](https://gfw.report/publications/imc20/en/).

Ardından, Kasım 2021'den itibaren daha kaba ve daha geniş kapsamlı bir yöntemle. Bir [USENIX Security 2023 çalışması](https://gfw.report/publications/usenixsecurity23/en/), güvenlik duvarının "tamamen şifreli" trafiği gerçek zamanlı olarak engellediğini ortaya koydu. Güvenlik duvarı bir bağlantının ilk paketine bakar; bilinen bir protokole benzeyen ya da yeterince yazdırılabilir metin içeren her şeyi muaf tutar. Bir kural, bayt başına ortalama kaç bitin ayarlı olduğunu ölçer: 3,4 veya altındaki ya da 4,6 veya üstündeki değerler muaf tutulur, aradaki rastgele görünümlü veri ise tutulmaz. Geriye kalan her şey engellenebilir.

Araştırmacılar ayrıca güvenlik duvarının bunu bağlantıların yaklaşık %26'sına ve yalnızca popüler veri merkezlerinin IP aralıklarına uyguladığını, bunun muhtemelen yan etkileri sınırlamak için olduğunu belirledi. Protokol tasarımcıları için çıkarılacak ders açıktı: rastgele görünmek başlı başına bir parmak izidir.

## Shadowsocks ne zaman kullanılmalı?

- Trafiği yakından denetlemeyen ağlarda **hafif ve hızlı vekil sunucu** olarak.
- Kurulumu kolaylaştıran Outline gibi araçlarla **kendi sunucunu kurmak** için.
- **Yoğun filtrelemede dikkatli olarak.** Çin'de ve tamamen şifreli trafiği engelleyen diğer yerlerde Shadowsocks, [VLESS-Reality](/vpn-protocols/vless-reality) gibi gerçek TLS'i taklit eden protokollerden çok daha az güvenilirdir. [Sansür protokolleri tarihçemiz](/blog/censorship-protocol-history), bu alanın nasıl ilerlediğini izler.

## Doppler Shadowsocks kullanıyor mu?

Hayır. Doppler, [neden VLESS](/vpn-protocols/why-vless) rehberindeki gerekçelerle VLESS-Reality kullanır.
