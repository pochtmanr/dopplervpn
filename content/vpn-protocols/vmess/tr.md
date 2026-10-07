> **Kısaca.** VMess, V2Ray projesinin özgün protokolüdür. Kendi başlıklarını şifreler ve web trafiğine benzemek için genellikle TLS üzerinden WebSocket gibi başka bir taşıma katmanına sarılır. Hâlâ çalışır, ancak ardıllarından VLESS ve Trojan aynı işi daha az ek yükle yapar.

## VMess nedir?

VMess, [V2Ray projesinin](https://github.com/v2fly/v2ray-core) 2015'te başladığında sunduğu şifreli vekil sunucu protokolüdür. V2Ray, vekil sunucu kurmak için modüler bir platforma dönüştü: tek bir çekirdek, birçok protokol ve taşıma katmanı ile hangi trafiğin nereye gideceğine karar veren bir yönlendirme motoru. VMess onun ilk protokolüydü ve birkaç yıl boyunca ana protokolü oldu.

Shadowsocks gibi VMess de teknik olarak bir VPN değil, bir vekil sunucudur; ancak V2Ray tabanlı uygulamalar tüm cihazınızı onun üzerinden yönlendirebilir.

## Nasıl çalışır?

Her kullanıcının, kimlik bilgisi olarak görev yapan bir UUID'si vardır. [Protokol belgelerine](https://www.v2fly.org/en_US/developer/protocols/vmess.html) göre istemcinin istek başlığı; bir Unix zaman damgasından, rastgele bir sayıdan ve bir sağlama toplamından oluşan, kullanıcının kimliğinden türetilen bir anahtarla şifrelenmiş bir kimlik doğrulama kimliği içerir. Sunucu bunu kullanıcıyı tanımak için kullanır, ardından başlığın geri kalanının ve verinin şifresini çözer.

Belgeler başlığı korumanın iki yolunu anlatır. Modern olanı, başlığın değiştirilmediğini garanti eden AEAD şifrelemesini kullanır. Eski olanı MD5 ve AES-128-CFB kullanıyordu ve başlığın bütünlüğünü garanti edemiyordu; belgeler bu yöntemden kaçınılmasını söyler. Kimlik doğrulama kimliği bir zaman damgası içerdiği için istemci ve sunucu saatlerinin yaklaşık olarak senkron olması gerekir; "bir türlü bağlanmıyor" sorunlarının yaygın bir kaynağı budur.

## VMess'i engellemek ne kadar zordur?

VMess tek başına rastgele baytlara benzer; bu da onu [Shadowsocks](/vpn-protocols/shadowsocks) ile aynı konuma koyar: tamamen şifreli trafiği engelleyen güvenlik duvarlarına açıktır. Bu nedenle VMess genellikle bir alan adı ve sertifika arkasında, TLS üzerinden WebSocket ya da gRPC içinde dağıtılır; böylece bir gözlemci bir web sitesine yapılmış normal bir HTTPS bağlantısına benzeyen bir şey görür.

Bu sarmalayıcı trafiği gizleme işinin çoğunu üstlenir ve bir bedeli vardır: bir alan adına, bir sertifikaya ve çoğu zaman sunucunun önünde bir CDN'e ihtiyaç duyarsınız; ayrıca sunucu artık veriyi iki kez şifreler, biri TLS için, biri VMess için.

## VMess, VLESS ya da Trojan?

[VLESS](/vpn-protocols/vless-reality), Xray projesi tarafından daha hafif bir ardıl olarak tasarlandı: UUID tabanlı kimliği korur, ancak VMess'in kendi şifrelemesini bırakıp tümüyle TLS katmanına dayanır; bu da çift şifrelemeyi önler. [Trojan](/vpn-protocols/trojan) benzer bir yaklaşımı UUID yerine parolayla izler. [VLESS, VMess ve Trojan](/blog/vless-vs-vmess-vs-trojan) karşılaştırmamız ayrıntılara girer.

## Doppler VMess kullanıyor mu?

Hayır. Doppler, Reality ile VLESS kullanır. Nedenini [neden VLESS](/vpn-protocols/why-vless) rehberi açıklar.
