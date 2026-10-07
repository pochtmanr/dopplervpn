> **Kısaca.** Hysteria 2, HTTP/3'ün arkasındaki taşıma katmanı olan QUIC üzerine kurulu bir vekil sunucu protokolüdür. Zayıf ve kayıplı bağlantılarda hız için tasarlanmıştır; parolası olmayan biri için sunucusu sıradan bir HTTP/3 web sitesi gibi davranır. Zayıf noktası, bazı ağların kısıtladığı ya da tamamen engellediği UDP'ye bağımlı olmasıdır.

## Hysteria 2 nedir?

Hysteria, [apernet](https://github.com/apernet/hysteria) tarafından geliştirilen açık kaynaklı bir projedir; yeniden tasarlanmış bir protokol olan 2. sürüm Eylül 2023'te yayımlandı. Shadowsocks ve VLESS gibi klasik bir VPN değil, bir vekil sunucudur ve istemciler tüm cihazı onun üzerinden yönlendirebilir.

## Nasıl çalışır?

[Protokol şartnamesine](https://v2.hysteria.network/docs/developers/Protocol/) göre Hysteria 2, [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000)'de tanımlandığı biçimiyle QUIC üzerinde, UDP trafiği için güvenilmez datagram uzantısıyla çalışır. QUIC zaten TLS 1.3 şifrelemesi, çoklanmış akışlar ve hızlı bağlantı kurulumu sağlar.

Kılık, kimlik doğrulamada devreye girer. Şartname, bir Hysteria sunucusunun **gerçek bir HTTP/3 sunucusu uygulaması zorunda olduğunu** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) ve istekleri herhangi bir web sunucusunun yapacağı gibi işlemesi gerektiğini belirtir. İstemci özel bir HTTP/3 isteğiyle kimlik doğrular; meraklı bir ziyaretçi ya da aktif bir yoklama olsun, diğer herkes sıradan web yanıtları alır. Şartname, kimlik bilgisi olmayan bir üçüncü tarafa göre sunucunun tıpkı standart bir HTTP/3 web sunucusu gibi davrandığını belirtir.

## Neden hızlıdır?

QUIC, UDP üzerinde çalışır ve paket kaybından, TCP'nin yaptığı gibi her akışı durdurmadan toparlanır. Hysteria ayrıca kararsız bağlantılara yönelik kendi tıkanıklık denetimini kullanabilir; bu yüzden TCP tabanlı protokollerin yavaşladığı tıkanık mobil ağlarda, uzun mesafeli rotalarda ve parazitli Wi-Fi'da hızını korumaya eğilimlidir.

## Hysteria 2'yi engellemek ne kadar zordur?

Aktif yoklamaya karşı iyi dayanır; çünkü yoklamalar bir web sunucusu görür. Açık nokta taşıma katmanıdır. Bir sansürcü, çoğu web sitesini bozmadan UDP'yi ya da özellikle QUIC'i kısıtlayabilir veya engelleyebilir; çünkü HTTP/3 başarısız olduğunda tarayıcılar TCP üzerinden HTTP/2'ye döner. Bunun olduğu yerlerde Hysteria 2'nin gidecek yeri kalmaz, [VLESS-Reality](/vpn-protocols/vless-reality) gibi TCP tabanlı protokoller ise çalışmaya devam eder.

## Hysteria 2 ne zaman kullanılmalı?

- Tıkanıklık denetiminin ve QUIC'in kayıp toparlamasının işe yaradığı **kayıplı ya da uzun mesafeli bağlantılar**.
- **UDP'ye izin veren ağlar.** Güvenmeden önce kontrol edin.
- UDP filtrelendiğinde geçiş yapabilmeniz için bir TCP seçeneğinin yanında ikinci bir protokol olarak. [Sansür rehberimiz](/bypass-censorship), filtrelerin taşıma katmanlarını nasıl hedef aldığını ele alır.

## Doppler Hysteria 2 kullanıyor mu?

Hayır. Doppler, UDP'yi engelleyen ağlarda da çalışmaya devam eden, TCP üzerindeki VLESS-Reality'yi kullanır. [Neden VLESS](/vpn-protocols/why-vless) rehberine bakın.
