> **Kısa özet.** Doppler'ı App Store'dan yükleyin, açın ve Connect'e dokunun. Kayıt formu yok: uygulama sizin için anonim bir hesap kimliği oluşturur. Bu rehberdeki diğer her şey isteğe bağlıdır ve çoğu insanın hiç ihtiyacı olmaz.

## Yükleyin ve bağlanın

Doppler, iPhone, iPad ve Mac için tek bir App Store uygulamasıdır. iPhone ve iPad'de iOS veya iPadOS 18 ya da üzeri gerekir. Mac'te macOS 15 Sequoia ya da üzeri gerekir.

1. Cihazınızda App Store'dan **Doppler VPN**'i alın.
2. Açın. Doppler o anda bir hesap kimliği oluşturur. E-posta, telefon numarası veya parola sorulmaz.
3. **Connect**'e dokunun. İlk seferde iOS veya macOS, Doppler'ın bir VPN yapılandırması eklemesine izin verip vermediğinizi sorar. İzin verin. Bu istem Apple'dan gelir ve yalnızca bir kez görürsünüz.

Modem başlatma dizisini, kullanıcı adını ve telefon numarasını bir iletişim kutusuna yazarak çevirmeli bağlantı kurmayı hatırlayanlar bunu kısa bulacak. Bilerek böyle. Eskiden sizin işiniz olan ayarlar artık uygulamanın işi.

```shots
/images/apple/iphone-connect-1000.avif | Ana ekran | iPhone'da Doppler ana ekranı, Hong Kong'a bağlı
/images/apple/iphone-search-1000.avif | Sunucular | iPhone'da her konumun ping'iyle sunucu listesi
/images/apple/iphone-unblock-1000.avif | Connection method | iPhone'da Connection method ekranı
```

## Ana ekran

Kalkan turkuaza dönüp **Bağlandı** dediğinde, cihazdaki her uygulama trafiğini tünelden gönderir. Kalkanın altında hangi sunucuda olduğunuzu ve ping'ini görürsünüz. Altında canlı indirme ve yükleme hızı ile trafiğinizin çıktığı yerin küçük bir haritası vardır.

Sunucu satırına dokunarak sunucu değiştirin. Liste, bağlanmadan önce ölçülmüş her konum için bir ping gösterir; böylece en yakını veya en hızlı yanıt vereni seçebilirsiniz.

Mac'te aynı ekranlar bir kenar çubuğunda durur: üstte VPN, Sunucular, Hız Testi, Connection ve Smart Route; sonra Profile, Abonelik ve Devices; ardından Uygulama Ayarları ve Yardım.

![MacBook Pro'da Doppler, bağlı; kalkanın altında hız testi ve rota haritası](/images/apple/mac-front-1800.avif "Mac'te VPN ekranı: kalkan, sunucu, sonra hız ve rota.")

```shots
/images/apple/mac-path-1920.avif | Connection | Mac'te harita üzerinde rotayla Connection ekranı
/images/apple/mac-split-1920.avif | Smart Route | Mac'te Smart Route ekranı
```

## Sitelerin ne gördüğünü kontrol edin

**Connection** ekranı, her VPN kullanıcısının er ya da geç sorduğu soruyu yanıtlar: gerçekten çalışıyor mu? Sitelerin şu anda gördüğü IP adresini, bu adresin ait olduğu ağı, DNS sorgularınızın tünelden gidip gitmediğini, bir sorgunun ne kadar sürdüğünü ve haritada çizilmiş rotanızı gösterir.

Gösterilen adres sunucununki değil de sizinki ise tünel trafiğinizi taşımıyor demektir. Disconnect yapın, yeniden bağlanın; sürerse Help and Support altındaki Connection log, destek ekibimiz için son denemeleri saklar.

## Yerel siteleri Smart Route ile yerel tutun

Bankalar, vergi daireleri ve evdeki yayın hizmetleri çoğu zaman yabancı adresleri reddeder. **Smart Route** kendi ülkenizdeki siteleri doğrudan dışarı gönderir, geri kalan her şeyi tünelde tutar. Ülkenizi seçin veya Doppler'ın algılamasına bırakın; sonra neyin doğrudan gideceğini seçin: `.jp` gibi bir alan adı bölgesi, o ülkede barındırılan siteler veya kendinizin eklediği alan adları.

Doğrudan giden hiçbir şey VPN tarafından korunmaz. Bu takastır ve Smart Route'un siz açana kadar kapalı olmasının nedeni budur.

## Bir ağ bağlantıyı engelliyorsa

Bazı ağlar, bir bağlantının ziyaret ettiğini söylediği sitenin adını okuyarak VPN'leri engeller. Doppler'ın yanıtı, sunucu listesinin üstünden veya Uygulama Ayarları'ndan açılan **Connection method** ekranıdır. **Automatic**'te bırakın; uygulama en olası üç kamuflaj sitesini birden dener ve en hızlısını tutar. Altında neler olduğunu [SNI rehberi](/guides/what-is-sni) anlatır.

## Bilmeye değer ayarlar

**Uygulama Ayarları** içinde:

- **Açılışta Bağlan**, uygulamayı açar açmaz bağlanır.
- **Kill Switch**, VPN düşerse trafiğin korumasız çıkmasına izin vermek yerine otomatik yeniden bağlanır.
- **Dil**, cihazınızın geri kalanına dokunmadan uygulamanın dilini değiştirir.
- **Görünüm**, metin boyutunu, yüzey stilini ve altı vurgu renginden birini ayarlar.

iPhone'da ayrıca Connect düğmeli bir ana ekran widget'ı ve uzaktan kumanda gibi çalışan bir [Apple Watch uygulaması](/guides/vpn-on-apple-watch) vardır.

## Bir şeyler ters gittiğinde

Doppler bağlantı başarısız olduğunda tek bir sade mesaj gösterir, asla bir hata kodu duvarı değil. Mesaj yetmezse bize ulaşma yolları için uygulamada **Help and Support**'u açın. Oradaki **Connection log** son 50 denemenizi saklar ve yanına göndermek üzere teknik ayrıntıları kopyalamanıza izin verir. Bunları hiçbir zaman ekranda göstermez; yani bir ekran görüntüsü hiçbir şey ele vermez.
