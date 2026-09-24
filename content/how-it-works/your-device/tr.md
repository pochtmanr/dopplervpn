> **Kısa özet.** Herhangi bir VPN devreye girmeden önce telefonunuz ya da bilgisayarınız ağa zaten epey şey söylüyor: IP adresinizi, sorguladığınız siteleri ve çoğu zaman bağlandığınız her sitenin adını. Çoğu VPN bunun üstüne bir de e-postanızı ve kartınızı istiyor. Doppler tersi yolu seçiyor. Uygulama cihazınızın içinde rastgele bir hesap kimliği üretiyor, sizden hiçbir şey istemiyor ve DNS'inizi tünelin içinde çözümlüyor.

## Bağlanmadan önce cihazınız neleri ele veriyor?

Kafe Wi-Fi'ında bir web sitesi açtığınızda en az üç taraf bunun bir kısmını izleyebiliyor: Wi-Fi'ı işleten kişi, internet sağlayıcınız ve sitenin kendisi. Hiçbirinin bir şeyi kırmasına gerek yok. Her biri, ağın tasarımı gereği kendisine verdiğini görüyor.

2010 dolaylarında dizüstü bilgisayarıyla bir kahveciye giren herkes Firesheep'i hatırlayabilir: o yılın ekim ayında çıkan bir Firefox eklentisi. Açık ağı paylaşan kişinin, popüler sitelerde başkalarının açık oturumlarına tıklaya tıklaya girmesini sağlıyordu; hiçbir beceri gerekmiyordu. Her sayfada HTTPS kullanılması o deliği kapattı. Hepsini kapatmadı.

Sıradan bir bağlantıda cihazınızdan hâlâ şunlar çıkıyor.

### IP adresiniz

Her paket genel IP adresinizi taşıyor ve IP, çoğu insanın sandığından fazlasını söylüyor. Web'in büyük bir bölümünün arkasındaki konum verisini sağlayan MaxMind, bir IP'yi 99.8% oranında doğru ülkeye yerleştirdiğini [belirtiyor](https://support.maxmind.com/hc/en-us/articles/4407630607131-Geolocation-Accuracy). ABD adreslerinde şehri, 50 km yanılma payıyla, üç seferin yaklaşık ikisinde doğru buluyor. Bu, bir sitenin siz daha tek bir tuşa basmadan bulunduğunuz şehri ve sağlayıcınızı çıkarması için yeterli.

### DNS sorgularınız

Tarayıcınız `example.com` sitesini yükleyebilmek için önce bir DNS sunucusuna adresi sormak zorunda. İnternetin tarihinin büyük bölümünde bu sorular, HTTPS kullanan siteler için bile düz metin olarak gidiyordu. Firefox, ABD'deki kullanıcılar için [şifreli DNS'i varsayılan olarak açmaya](https://blog.mozilla.org/blog/2020/02/25/firefox-continues-push-to-bring-dns-over-https-by-default-for-us-users/) ancak Şubat 2020'de başladı. Birçok telefonda, modemde ve uygulamada sorgular hâlâ şifresiz yolculuk ediyor, yani sağlayıcınız ziyaret ettiğiniz her alan adının listesini okuyabiliyor.

### HTTPS'in içindeki site adı

İlk dönem web'de parolalar ağ üzerinden HTTP ve FTP ile düz metin olarak geçiyordu; aynı hattaki, bakmaya niyetli herkes onları okuyabiliyordu. Bugün HTTPS sayfayı, yazdığınız metni ve yüklediğiniz görselleri gizliyor. *Hangi siteyle* konuştuğunuzu genellikle gizlemiyor. Bir TLS bağlantısının ilk mesajı olan ClientHello, siteyi SNI adlı bir alanda adıyla anıyor ve bu alan geleneksel olarak açık gönderiliyor. Bir çözüm var, adı Encrypted Client Hello (ECH): Cloudflare bunu müşterileri için Eylül 2023'te [devreye aldı](https://blog.cloudflare.com/announcing-encrypted-client-hello/) ve [RFC 9849](https://www.rfc-editor.org/info/rfc9849/) olarak bir IETF standardı hâline geldi. Ne var ki yalnızca hem tarayıcınız hem de site desteklediğinde işe yarıyor ve birçok site hâlâ desteklemiyor.

### WebRTC

Ocak 2015'te Daniel Roesler adlı bir geliştirici, tarayıcının görüntülü görüşme özelliği WebRTC'den makinenin ağ adreslerini isteyen kısa bir betik yayımladı. Hiçbir izin penceresi çıkmıyordu ve bir VPN'e bağlı olan insanların [gerçek IP'sini açığa çıkarıyordu](https://thehackernews.com/2015/02/webrtc-leaks-vpn-ip-address.html). Tarayıcılar o günden beri sınırlar getirdi, ama kötü yapılandırılmış bir VPN hâlâ bu yoldan sızdırabiliyor. Kendinizinkini [WebRTC sızıntı testimizle](/tools/webrtc-leak-test) kontrol edebilirsiniz.

### Tarayıcınızın parmak izi

IP gizlenmiş olsa bile tarayıcı kendi biçimini ele veriyor: ekran boyutu, yazı tipleri, ekran kartı, saat dilimi, dil. 2010'da EFF'nin Panopticlick projesi [yaklaşık 470,000 tarayıcı topladı](https://www.eff.org/press/archives/2010/05/13) ve bunların 83.6%'sının benzersiz olduğunu buldu. 2016 tarihli bir çalışma, AmIUnique, başka 118,934 tarayıcıya baktı ve yine 89.4%'ünü [benzersiz](https://www.semanticscholar.org/paper/fe2f4faec5cf209ae7d8a73100db9cce46ce53d4) buldu.

```chart
fingerprint-uniqueness
```

VPN, parmak izi çıkarmayı çözmüyor. Bu bir tarayıcı sorunu ve aşağıdaki tablonun aksini düşündürmesine izin vermektense bunu burada söylemeyi tercih ederiz.

## Kim neyi görebiliyor?

HTTPS kullanan bir sitede gezinen biri için tablo şöyle: önce VPN'siz, sonra Doppler bağlıyken.

| Ne görünüyor | Wi-Fi'ınıza veya sağlayıcınıza, VPN'siz | Wi-Fi'ınıza veya sağlayıcınıza, Doppler ile | Web sitesine, Doppler ile |
|---|---|---|---|
| Gerçek IP adresiniz | Evet | Evet (zaten sağlayıcınız onlar) | **Hayır**, uç düğümün IP'sini görüyor |
| Sorguladığınız alan adları (DNS) | DNS şifresizse çoğu zaman evet | **Hayır**, DNS tünelin içinde çözümleniyor | Yalnızca kendi alan adını |
| TLS el sıkışmasındaki site adı (SNI) | Evet, site ECH kullanmıyorsa | **Hayır**, sıradan görünen tek bir TLS oturumu görüyor | Kendi adını |
| Sayfa içeriği | Hayır (HTTPS koruyor) | Hayır | Evet, sayfa onların |
| VPN kullandığınız | Klasik protokollerde genellikle evet | Anlaması çok zor, bkz. [adım 2](/how-it-works/vless-reality-tunnel) | Muhtemelen, IP'den |
| Tarayıcı parmak iziniz | Hayır | Hayır | **Evet**, VPN bunu değiştirmiyor |

Örüntü basit. İyi bir VPN, güveni o an üzerinde oturduğunuz ağdan başka bir yere taşıyor. Oturum açtığınız sitelere karşı sizi görünmez yapmıyor.

## İnternet sağlayıcıları çevrimiçi yaptıklarınızla neden ilgileniyor?

Çünkü veri para ediyor ve bazı ülkelerde yasa onlardan bunu saklamalarını istiyor.

Ekim 2021'de ABD Federal Ticaret Komisyonu, ülkenin mobil internet pazarının yaklaşık 98%'ine birlikte hizmet veren altı sağlayıcı hakkında [bir uzman raporu yayımladı](https://www.ftc.gov/news-events/news/press-releases/2021/10/ftc-staff-report-finds-many-internet-service-providers-collect-troves-personal-data-users-have-few). Rapor, bu şirketlerin "birçok tüketicinin bekleyebileceğinden çok daha fazla veri" topladığını buldu; buna kullanıcılarının bütün internet trafiğine ve gerçek zamanlı konumuna erişim de dahil. Bazıları müşterilerini reklam amacıyla ırka veya cinsel yönelime göre gruplara ayırmıştı.

Veri saklama yasaları bir katman daha ekliyor:

- **Birleşik Krallık.** [2016 Soruşturma Yetkileri Yasası'nın](https://www.legislation.gov.uk/ukpga/2016/25/section/87) 87. maddesi uyarınca sağlayıcılardan "internet bağlantı kayıtlarını" (bir cihazın hangi hizmetlere bağlandığını) 12 aya kadar saklamaları istenebiliyor.
- **Rusya.** 1 Temmuz 2018'den beri Yarovaya yasası operatörlerden [iletişim içeriğini altı ay, üst veriyi üç yıl saklamalarını](https://www.hrw.org/news/2020/06/18/russia-growing-internet-isolation-control-censorship) zorunlu tutuyor.
- **Avrupa Birliği.** AB'nin en yüksek mahkemesi 2014'te [Veri Saklama Direktifi'ni iptal etti](https://curia.europa.eu/site/upload/docs/application/pdf/2014-04/cp140054en.pdf), 2016'da da bir adım öteye giderek trafik verisinin toptan saklanmasının AB hukukuna aykırı olduğuna hükmetti. Yine de birkaç üye devlet kendi ulusal düzenlemesini yürütmeye devam ediyor.

Bunların hiçbiri sizin onayınıza ihtiyaç duymuyor. Cihazınızdan korumasız çıkan trafiğin başına gelen şey basitçe bu.

## E-posta istemek neden gizlilik riski yaratıyor?

Çoğu VPN uygulaması bir kayıt formuyla başlıyor: e-posta, parola, sonra kart. Her alan, sağlayıcının artık elinde tuttuğu bir veri parçası ve tutulan veri sızabiliyor.

VPN sektöründeki en kötü sızıntıların bazıları, hiçbir şey saklamama sözü veren sağlayıcılardan geldi:

- **2020.** Tek bir arka uç paylaşan, aralarında UFO VPN'in de bulunduğu yedi Hong Kong VPN uygulaması "kayıt tutulmuyor" diyordu. Araştırmacılar; e-posta adresleri, düz metin parolalar, IP adresleri ve bağlantı kayıtları içeren, toplam 1.2 TB'lık, [bir milyardan fazla kayıt satırı](https://www.theregister.com/2020/07/17/ufo_vpn_database/) barındıran açık bir veritabanı buldu.
- **2021.** SuperVPN, GeckoVPN ve ChatVPN'in [21 milyon kullanıcısına](https://www.kaspersky.com/blog/supervpn-geckovpn-chatvopn-leak/39029/) ait kayıtlar bir hacker forumunda satışa çıktı: e-postalar, parolalar, adlar, ülkeler ve ödeme bilgileri.
- **2023.** Bir araştırmacı, kullanıcıların asıl IP adreslerini ve ziyaret ettikleri web adreslerini de içeren [360 milyon kayıtlık](https://www.vpnmentor.com/news/report-super-vpn-breach/) korumasız bir SuperVPN veritabanı buldu.

VPN'ler bu konuda hiç de yalnız değil. Troy Hunt'ın işlettiği ihlal dizini [Have I Been Pwned](https://haveibeenpwned.com/), Eylül 2026 itibarıyla 17.8 milyardan fazla ihlale uğramış hesap listeliyordu. Verizon'un [2026 Veri İhlali Soruşturmaları Raporu](https://www.verizon.com/business/resources/executivebriefs/2026-dbir-executive-summary.pdf), incelediği ihlallerin yaklaşık dörtte birinde çalınan veriler arasında kimlik bilgilerinin de bulunduğunu tespit etti.

```chart
dbir-2026
```

Avrupa'nın gizlilik yasası çözümü tek satıra sığdırıyor. [GDPR'nin](https://eur-lex.europa.eu/eli/reg/2016/679/oj) 5(1)(c) maddesi, kişisel verilerin "gerekli olanla sınırlı" olması gerektiğini söylüyor. Hiç toplanmamış veri ihlal edilemez, satılamaz ya da teslim edilemez.

## Doppler hesap açmadan nasıl bağlanıyor?

Doppler'i ilk açtığınızda uygulama cihazınızın içinde rastgele bir hesap kimliği üretiyor. `VPN-XXXX-XXXX-XXXX` biçiminde görünüyor ve aboneliğiniz *o*. E-posta alanı yok, telefon numarası yok, başka bir siteden devşireceğiniz bir parola yok.

```chart
schema-device
```

1990'ların sonunda bir ICQ numaranız olduysa fikir tanıdık gelecek. Listenizdekiler sizi bir rakam dizisiyle tanıyordu ve sizi bulmaları için o yetiyordu. Doppler de aynı şekilde çalışıyor, kişi listesi olmadan.

Alışıldık kayıt akışının karşısına koyduğunuzda değişen şey şu.

| Veri | Tipik VPN kaydı | Doppler |
|---|---|---|
| E-posta adresi | Zorunlu | **Hiç istenmiyor** |
| Telefon numarası | Bazen | **Hiç istenmiyor** |
| Parola | Zorunlu, çoğu zaman başka yerden tekrarlanıyor | **Yok**, kimlik bilgisi rastgele kimliğin kendisi |
| Gerçek ad | Kartınızdan alınıyor | Uygulama mağazasından veya kripto ile ödediğinizde toplanmıyor |
| Hesap tanımlayıcısı | E-postanıza bağlı | Rastgele `VPN-XXXX-XXXX-XXXX` |
| Cihaz tanımlayıcısı | Değişiyor | Evet, paketinizin cihaz sınırını uygulamak için |
| API oturum açma kaydı | Değişiyor, çoğu zaman açıklanmıyor | IP, hesap kimliği, cihaz kimliği ve zaman; kötüye kullanımı durdurmak için 90 güne kadar tutuluyor |

O son satırı bilerek yazıyoruz. Uygulama, oturum açmak ya da sunucu listesini almak için API'mizle konuştuğunda, her web hizmetinde olduğu gibi isteğin geldiği IP adresini görüyoruz. Bu oturum açma kaydını kötüye kullanımı durdurmak ve hız sınırlarını uygulamak için 90 güne kadar tutuyoruz. Kayıt, bir cihazın oturum açtığını gösteriyor. Sonrasında ne yaptığınız hakkında hiçbir şey söylemiyor, çünkü trafik hiçbir zaman kaydedilmiyor. [Güvenlik sayfamız](/security) tam listeyi açıklıyor.

Web sitemizden ödeme yaparsanız kart bilgilerinizi biz değil, kart işlemcisi görüyor. Hiçbir adın bağlanmasını istemiyorsanız [kripto ile ödeyebilirsiniz](/pay-with-crypto).

### Bu, geçiş anahtarlarının (passkey) aynısı değil mi?

Fikir akraba. W3C'nin Mart 2019'da WebAuthn'u bir web standardı yapmasından beri siteler, yazdığınız parolanın yerini cihazınızda üretilen bir sırrın aldığı oturum açma yöntemlerine doğru ilerliyor. FIDO Alliance, Mayıs 2026 itibarıyla kullanımda yaklaşık 5 milyar geçiş anahtarı [saydı](https://fidoalliance.org/fido-alliance-reports-accelerating-global-passkey-adoption-on-world-passkey-day-2026/). Geçiş anahtarları yine de, arkasında genellikle e-postanız duran bir hesabın üzerinde oturuyor. Doppler bir adım daha ileri gidiyor ve kimliğin arkasında hiçbir kimlik bulundurmuyor.

## Bundan sonra ne oluyor?

Uygulama oturum açtıktan sonra tüneli açıyor. O andan itibaren DNS sorgularınız, TLS el sıkışmalarınızdaki site adları ve gerçek hedefleriniz tünelin içinde yolculuk ediyor; Wi-Fi'ın sahibi ve sağlayıcınız artık onları okuyamıyor.

Ancak bir sorun var: düz bir VPN tüneli kolayca fark ediliyor ve birçok ülkede fark edilmek engellenmek demek. Doppler'in bundan nasıl kaçındığı [adım 2: VLESS-Reality tüneli](/how-it-works/vless-reality-tunnel) yazısının konusu.

Önce kendi cihazınızın ne kadar açıkta olduğunu görmek ister misiniz? Ücretsiz [IP kontrolümüz](/tools/what-is-my-ip), [DNS sızıntı testimiz](/tools/dns-leak-test) ve [WebRTC sızıntı testimiz](/tools/webrtc-leak-test) bir sitenin bağlantınız hakkında şu anda tam olarak ne öğrenebileceğini gösteriyor.
