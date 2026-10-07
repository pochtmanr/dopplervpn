> **Kısaca.** WireGuard, yaygın VPN protokolleri arasında en hızlı ve en basit olanıdır; filtrelenmeyen bir ağda mükemmel bir seçimdir. Ancak bir VPN olduğunu gizlemek üzere tasarlanmamıştır ve Rusya, İran ile Çin'de ilk engellenen protokoller arasındadır.

## WireGuard nedir?

WireGuard, Jason A. Donenfeld tarafından yazılmış ve ilk kez 2015'te yayımlanmış bir VPN protokolüdür. Amacı, kendinden önceki büyük ve yapılandırılabilir protokollerin yerine denetlenebilecek kadar küçük bir şey koymaktı. Mart 2020'de [Linux 5.6 çekirdeğine dahil edildi](https://en.wikipedia.org/wiki/WireGuard); bugün Windows, macOS, iOS, Android ve Linux için resmî uygulamalar bulunuyor.

WireGuard, tarafların bir şifre takımı üzerinde anlaşmasına izin vermek yerine tek bir modern ilkel kümesini sabitler. [Protokol sayfası](https://www.wireguard.com/protocol/) bunları sıralar: şifreleme için Poly1305 ile ChaCha20, anahtar değişimi için Curve25519 ve özetleme için BLAKE2s. Yanlış yapılandırılacak bir şey yoktur; geri dönülebilecek daha eski ve daha zayıf bir seçenek de yoktur.

## Nasıl çalışır?

Her cihazın, tıpkı SSH'de olduğu gibi bir anahtar çifti vardır. İstemci ve sunucu birbirlerinin açık anahtarlarını önceden bilir; el sıkışma Noise protokol çerçevesine dayanır (protokol sayfası tam yapıyı `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s` olarak belirtir). [Tüm paketler UDP üzerinden gönderilir](https://www.wireguard.com/protocol/) ve yeni bir oturum tek bir gidiş-dönüşte kurulur.

WireGuard'ın hızlı hissettirmesinin nedeni bu tasarımdır. Üzerinde anlaşılacak çok az şey vardır, Linux'ta kod işletim sistemi çekirdeğinin içinde çalışır ve protokol uzun süreli bir bağlantıyı açık tutmadığı için Wi-Fi ile mobil veri arasındaki geçişler fark edilmeden halledilir.

## WireGuard neden engellenir?

WireGuard'ın denetlenmesini kolaylaştıran basitlik, onu tanınır da kılar. [Teknik belgesi](https://www.wireguard.com/papers/wireguard.pdf) el sıkışma mesajlarını bayt bayt tanımlar; dolayısıyla istemciden gelen ilk paket her zaman 148 bayt, yanıt ise her zaman 92 bayttır ve her biri sabit bir mesaj türü alanıyla başlar. Derin paket denetimi (DPI) sisteminin bu deseni UDP üzerinde fark etmesi için kısa bir kural yeterlidir.

Sansürcüler tam olarak bunu yaptı. Ağustos 2023'te Rusya'daki kullanıcılar, büyük mobil operatörlerin WireGuard oturumlarını el sıkışmanın hemen ardından kestiğini [bildirdi](https://github.com/net4people/bbs/issues/274). Şifreleme içeriği korumaya devam etti, ancak bağlantının kendisi kesildi.

Bu bir hata değil, bir tasarım tercihidir. WireGuard'ın geliştiricileri sabit ve asgari bir protokolü seçti; gizlenme hedefleri arasında yoktu. [AmneziaWG](/vpn-protocols/amneziawg) gibi projeler, bir ölçüde gizlenmeyi geri kazandırmak için paketlerin biçimini değiştirir.

## WireGuard ne zaman kullanılmalı?

- **Filtrelenmeyen ağlar.** Evde, işte ya da VPN'leri engellemeyen bir ülkede seyahat ederken hız ve pil ömrü açısından WireGuard'ın önüne geçmek zordur.
- **Kendi sunucunu kurmak.** Kendi sunucunuzu işletiyorsanız WireGuard, doğru kurulumu en kolay protokollerden biridir.
- **DPI filtrelemesi altında değilse.** Ağınız VPN'leri engelliyorsa, [VLESS-Reality](/vpn-protocols/vless-reality) gibi sıradan web trafiğine benzeyecek şekilde tasarlanmış bir protokol daha uygundur. [VLESS-Reality ile WireGuard](/blog/vless-reality-vs-wireguard) karşılaştırmamız bu dengeyi daha ayrıntılı ele alır.

## Doppler WireGuard kullanıyor mu?

Hayır. Doppler uygulamaları VLESS-Reality üzerinden bağlanır; çünkü Doppler, WireGuard'ın filtrelendiği ağlar için geliştirildi. Gerekçeyi [neden VLESS](/vpn-protocols/why-vless) rehberi açıklar.
