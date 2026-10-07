> **Kısaca.** VLESS, Xray projesinden gelen asgari bir vekil sunucu protokolüdür. Reality ise bir VLESS bağlantısını, kendi alan adınız ya da sertifikanız olmadan, gerçek ve popüler bir web sitesine yapılan sıradan bir TLS 1.3 ziyaretine benzeten TLS katmanıdır. Birlikte, sansürcülerin engellemesi şu anda en zor olan yaygın birleşimdir. Bu sayfa özettir; tüm hikâye [ayrıntılı rehberimizde](/how-it-works/vless-reality-tunnel) yer alır.

## VLESS nedir?

VLESS, [VMess](/vpn-protocols/vmess)'in daha hafif bir ardılı olarak [Temmuz 2020'de önerildi](https://github.com/v2ray/v2ray-core/issues/2636). [Şartnamesi](https://xtls.github.io/en/development/protocols/vless.html) bilinçli olarak küçüktür: bir protokol sürümü, kullanıcıyı tanımlayan 16 baytlık bir UUID, isteğe bağlı bir eklentiler alanı ve hedefin komutu, portu ve adresi. VLESS'in kendi şifrelemesi yoktur. Alttaki TLS katmanına dayanır; bu yüzden trafik iki kez şifrelenmez.

VLESS, Kasım 2020'de V2Ray'den ayrılan ve bugün bu protokol ailesinin geliştirilmesine öncülük eden proje olan [Xray-core](https://github.com/XTLS/Xray-core)'un bir parçasıdır.

## Reality ne ekler?

[Trojan](/vpn-protocols/trojan) gibi protokoller kendi alan adınıza giden TLS'in içine gizlenir ve o alan adı, bir sansürcünün engelleyebileceği şey hâline gelir. Xray-core'un [Mart 2023'teki 1.8.0 sürümünde](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0) yayımlanan [Reality](https://github.com/XTLS/REALITY) bunu ortadan kaldırır.

Bir Reality sunucusu, gerçek bir üçüncü taraf web sitesinin TLS el sıkışmasını sunar. Bir gözlemciye göre bağlantı, o siteye yapılan normal bir TLS 1.3 ziyaretidir. Sunucunun anahtarını bilen bir istemci VLESS tüneline geçirilir; bir sansürcünün aktif yoklaması dahil diğer herkes gerçek web sitesine yönlendirilir ve onun özgün sertifikasını görür. Engelleme listesine konabilecek bir Doppler alan adı ya da sertifikası yoktur.

## VLESS-Reality'yi engellemek ne kadar zordur?

Bildiğimiz en dayanıklı yaygın seçenektir, ancak görünmez değildir. 2024'te yayımlanan bir araştırma, [TLS içinde taşınan TLS'in](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) zamanlamasından ve paket boyutlarından tanınabildiğini gösterdi; Kasım 2025'te kullanıcılar bazı Rus internet servis sağlayıcılarının Reality bağlantılarını kestiğini [bildirdi](https://github.com/net4people/bbs/issues/546). Sağlayıcılar sunucu ayarlarını ve ödünç aldıkları siteleri ayarlayarak karşılık veriyor; kedi-fare oyunu sürüyor.

## Ne kadar hızlıdır?

Günlük kullanımda ek yük küçüktür. VLESS başlığı bağlantı başına bir kez gönderilir ve XTLS Vision akışı, zaten şifreli olan web trafiğinin ikinci kez şifrelenmesini önler. TCP üzerinde çalıştığı için VLESS-Reality, kayıplı ağlarda [WireGuard](/vpn-protocols/wireguard) gibi UDP protokollerinden daha yavaş olabilir; ancak onların engellendiği yerlerde çalışmaya devam eder.

## Daha fazlasını nereden öğrenebilirim?

- [VLESS-Reality tüneli, ayrıntılı olarak](/how-it-works/vless-reality-tunnel): tarihçe, mekanizma, sınırlar.
- Blogumuzda [VLESS nedir?](/blog/what-is-vless) ve [VLESS URI biçimi](/blog/vless-uri-format).
- [VLESS VPN](/vless-vpn): Doppler'ın VLESS-Reality'yi tek dokunuşluk uygulamalara nasıl dönüştürdüğü.
