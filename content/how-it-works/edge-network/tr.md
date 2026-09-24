> **Kısa özet.** Uç düğüm, trafiğinizin tünelden çıkıp açık internete gittiği yer. Gerçek IP'nizi kendi IP'siyle değiştiriyor, DNS'inizi çözümlüyor ve ağın izin verdiği ölçüde size yakın duruyor; çünkü her 100 km fiber, gidiş dönüşte yaklaşık bir milisaniyeye mal oluyor. Ayrıca bir VPN'in "kayıt tutmuyoruz" sözünün ya tutulduğu ya da bozulduğu yer burası. Bizimkinin neyi sakladığı ve neyi saklamadığı, başka sağlayıcıların atladığı kısımlar da dahil, burada.

## Uç düğüm aslında ne yapıyor?

Çevirmeli bağlantı yıllarında internete girdiyseniz, sağlayıcınızın bir zamanlar internete açılan tek kapınız olduğunu hatırlarsınız. Her istek onların binasından, onların adına çıkardı. Bir VPN uç düğümü ikinci bir kapıyı başka bir yere koyuyor ve size kendi adını ödünç veriyor.

Teknik olarak üç iş yapıyor.

1. **Tüneli sonlandırıyor.** [Adım 2'den](/how-it-works/vless-reality-tunnel) gelen şifreli VLESS-Reality bağlantınız buraya iniyor ve burada açılıyor.
2. **Adresi değiştiriyor.** Düğüm isteğinizi kendi genel IP'siyle iletiyor; buna ağ adresi ve port çevirisi deniyor ve daha 2001'de [RFC 3022](https://www.rfc-editor.org/rfc/rfc3022) ile tanımlanmış. Ziyaret ettiğiniz site ev ya da mobil bağlantınızı değil, düğümü görüyor.
3. **DNS sorgularınızı yanıtlıyor.** Doppler DNS'i tünelin içinde çözümlüyor, böylece ziyaret ettiğiniz alan adlarının listesi sağlayıcınızın çözücüsünden hiç geçmiyor.

```chart
schema-edge
```

Bu üçüncü nokta kolayca gözden kaçıyor. Şifresiz DNS, eski düz metin internetinden kalma bir alışkanlık; trafiğinizi tünelden geçirip DNS'i dışarıda bırakan bir VPN, sağlayıcınıza açtığınız her sitenin düzgün bir günlüğünü yine de teslim ediyor. [DNS sızıntı testimiz](/tools/dns-leak-test) sizinkinin bunu yapıp yapmadığını birkaç saniyede söylüyor.

## Sunucuya olan mesafe neden önemli?

Çünkü ışık hızlı, ama yok sayılacak kadar hızlı değil. 56k modemle çevrimiçi oyun oynayan herkes "lag" kelimesini, nedenini öğrenmeden çok önce öğrendi. Yanıtın bir parçası her zaman mesafeydi.

Işık, optik fiberde boşluktaki hızının kabaca üçte ikisiyle, saniyede yaklaşık 200,000 km yol alıyor. Cloudflare'in mühendisleri bunu [güzel özetliyor](https://blog.cloudflare.com/fastest-internet/): 100 km uzaktaki bir sunucu, daha hiçbir bilgisayar hiçbir iş yapmadan size gidiş dönüşte en az **1 ms**'ye mal oluyor. Gerçek güzergâhlar hiçbir zaman düz çizgi olmadığı için gerçek sayılar hep daha yüksek çıkıyor.

```chart
latency-distance
```

Kesikli çizgiyle ölçülen noktalar arasındaki fark yönlendirmeden kaynaklanıyor: kıyı şeritlerini izleyen kablolar, ağdan ağa atlayan trafik, yoğun hatlar. Şimdiye kadar ölçülmüş en iyi Atlantik ötesi kablo olan Hibernia Express, 2015'te New York ile Londra arasında [59 ms'nin altına indi](https://www.submarinenetworks.com/en/systems/trans-atlantic/project-express/hibernia-express-connects-new-york-to-london-in-under-58-95ms). Aynı şehirler arasındaki sıradan internet güzergâhı ise yaklaşık 70 ms ölçülüyor.

### Ne kadar gecikmeyi hissedersiniz?

Sesli görüşmeler için telekom dünyası bunu çok önce çözmüş. ITU'nun [G.114 tavsiyesi](https://www.itu.int/rec/T-REC-G.114-200305-I/en) bir konuşmanın ne kadar tek yön gecikmeyi kaldırabileceğini ortaya koyuyor.

| Tek yön gecikme | Nasıl hissettiriyor (ITU-T G.114) |
|---|---|
| 0 ile 150 ms | Neredeyse şeffaf. Çoğu insan hiçbir şey fark etmiyor. |
| 150 ile 400 ms | Kullanılabilir, ama birbirinizin sözünü kesmeye başlıyorsunuz. |
| 400 ms üzeri | Normal bir konuşma için kabul edilemez. |

Web sayfalarında tolerans, insanların itiraf ettiğinden de düşük. Google'ın araştırması, bir sayfanın yüklenmesi üç saniyeyi aştığında [mobil ziyaretlerin 53%'ünün](https://www.marketingdive.com/news/google-53-of-mobile-users-abandon-sites-that-take-over-3-seconds-to-load/426070/) terk edildiğini buldu. Uzaktaki bir sunucuya yapılan dolambaç, her tek istekte bu bütçeden yiyor.

Doppler uygulamasının konumunuz için en hızlı düğümü otomatik olarak seçmesinin nedeni bu. Yakındaki bir düğüm birkaç milisaniye ekliyor. Dünyanın öbür ucundaki yanlış düğüm ise yaptığınız her şeye saniyenin dörtte birini ekleyebiliyor.

## "Kayıt tutulmuyor" gerçekte ne demek?

Her VPN kayıt tutmadığını söylüyor. Bazıları doğruyu söylüyordu. Bazıları söylemiyordu. Sayılan tek sınav, elinde mahkeme kararıyla biri kapıyı çaldığında ne olduğu ve bu, elimizde bir sicil oluşturacak kadar sık yaşandı.

| Yıl | Sağlayıcı | Ne oldu | Sonuç |
|---|---|---|---|
| 2011 | HideMyAss | LulzSec soruşturmasında Birleşik Krallık mahkeme kararı | Oturum kayıtları [teslim edildi](https://www.theregister.com/2011/09/26/hidemyass_lulzsec_controversy/); bir kullanıcı tutuklandı |
| 2016 | Private Internet Access | Bomba ihbarı davasında FBI celbi | Yalnızca IP'lerin ["doğu kıyısından"](https://torrentfreak.com/vpn-providers-no-logging-claims-tested-in-fbi-case-160312/) geldiğini söyleyebildi |
| 2016 | IPVanish | ABD İç Güvenlik Bakanlığı celbi | "Sıfır kayıt" iddiasına rağmen gerçek IP ve bağlantı zamanları [teslim edildi](https://torrentfreak.com/ipvanish-no-logging-vpn-led-homeland-security-to-comcast-user-180505/) |
| 2017 | PureVPN | FBI'ın siber taciz davası | Kayıtlar, hesabı şüphelinin ev ve iş IP'leriyle [ilişkilendirdi](https://torrentfreak.com/purevpn-logs-helped-fbi-net-alleged-cyberstalker-171009/) |
| 2017 | ExpressVPN | Türkiye'de sunucuya el konuldu | Polis kullanıcıları tanımlayan [hiçbir şey bulamadı](https://torrentfreak.com/vpn-server-seized-to-investigate-russian-ambassadors-assassination-1171219/) |
| 2023 | Mullvad | İsveç polisinin arama kararı | Görevliler [eli boş döndü](https://mullvad.net/en/blog/mullvad-vpn-was-subject-to-a-search-warrant-customer-data-not-compromised); veri zaten yoktu |
| 2025 | Windscribe | Yunanistan'da bir kullanıcının eylemleri nedeniyle CEO yargılandı | Mahkeme [davayı düşürdü](https://windscribe.com/blog/windscribe-greek-court-case/); kimseyi bağlayacak kayıt yoktu |

Bu tablonun dersi hangi markanın iyi olduğuyla ilgili değil. Ders şu: bir gizlilik politikasındaki söz, ancak arkasındaki sistem kadar sağlam. Sınavı geçen sağlayıcılar, veriyi en başından yazmayan sunucular kurmuş olanlardı.

Sektör bunu kanıtlamaya da yöneldi. ExpressVPN'in 2019'da tamamen bellekten çalışan sunucuları [duyurmasından](https://www.expressvpn.com/blog/introducing-trustedserver/) beri yalnızca RAM üzerinde çalışan tasarımlar yaygınlaştı. Büyük sağlayıcılar artık düzenli kayıtsızlık denetimleri için Deloitte, KPMG ve Cure53 gibi firmalara ödeme yapıyor.

## Bir Doppler uç düğümü neyi saklıyor?

Tam liste burada, [güvenlik sayfamızla](/security) ve [gizlilik politikamızla](/privacy) aynı terimlerle.

| Veri | Saklanıyor mu? |
|---|---|
| Ziyaret ettiğiniz siteler veya gezinme geçmişiniz | **Asla** |
| Trafiğinizin içeriği | **Asla** |
| DNS sorguları | **Asla** |
| Kullanılan bant genişliği veya ne kadar süre bağlı kaldığınız | **Asla** |
| Bir kişiyi belirli bir ağ etkinliğine bağlayan herhangi bir şey | **Asla** |
| Anonim, toplu sunucu performans ölçümleri | Evet, ağı sağlıklı tutmak için |
| API'miz için bir oturum açma kaydı (IP, anonim hesap kimliği, cihaz kimliği, zaman) | Evet, kötüye kullanımı durdurmak için 90 güne kadar |

Son satır uç düğümle ilgili değil. Uygulamanızın API'mizde oturum açtığı anı, yani daha tünel yokken olanı kapsıyor ve onu listeliyoruz, çünkü kesin konuşmayı mutlak görünmeye tercih ediyoruz. O kayıt bir cihazın oturum açtığını gösteriyor. O cihazın sonrasında ne yaptığını gösteremiyor, çünkü kayda bağlanacak hiçbir trafik kaydı yok.

### Doppler nerede kurulu?

Doppler VPN, İngiltere ve Galler'de kayıtlı bir şirket olan SIMNETIQ LTD tarafından işletiliyor. Birleşik Krallık, [Five Eyes](https://www.dni.gov/files/ICIG/Documents/Partnerships/FIORC/FIORC-Charter-2025.pdf) istihbarat ortaklarından biri ve [Soruşturma Yetkileri Yasası](https://www.legislation.gov.uk/ukpga/2016/25/section/87) devletin telekom operatörlerinden bağlantı kayıtlarını saklamasını istemesine izin veriyor. Aksini iddia edecek değiliz. Söyleyebileceğimiz şey yukarıdaki tablonun söylediği: böyle bir talebin arayacağı trafik kayıtları hiç oluşturulmuyor ve yasal bir talep, hiçbir zaman yazılmamış veriyi ortaya çıkaramaz.

## Uç düğümler sansüre karşı nasıl yardımcı oluyor?

Trafiğinizi okuyamayan bir sansürcü, bunun yerine sunucuları engellemeye çalışır. Bu yüzden uç ağın sürekli hareket hâlinde olması gerekiyor.

- **Birden çok ülkede sunucular.** Bir güzergâh yavaşsa veya engellenmişse başka bir tanesi var ve otomatik seçim sizin için çalışan en hızlısını buluyor.
- **Döndürme.** Engelleme teknikleri değiştikçe adresler ve yapılandırmalar da değişiyor, siz hiçbir şeyi güncellemeden.
- **Sunucu tarafında protokol güncellemeleri.** Bir ağ, 2025'in sonlarında bazı Rus sağlayıcılarının Reality'ye yaptığı gibi bir taşıma katmanını filtrelemeye başladığında çözüm bizim tarafımızdan geliyor ve uygulamanız onu alıyor.

Sansürle mücadelenin gösterişsiz yarısı bu. Manşetleri protokol alıyor. Bir sürü küçük ayarı filtreleme sisteminin bir adım önünde tutmak ise sizi salı günü bağlı tutan şey.

## Trafiğiniz bundan sonra nereye gidiyor?

Uç düğümden çıkan isteğiniz açık internete ulaşıyor ve istediğiniz site sizinkini değil, düğümün adresini görüyor. Yolculuğun son adımı bu ve kendiniz kontrol edebileceğiniz adım da bu.

Ücretsiz araçlarımız tarayıcınızda çalışıyor, kayıt istemiyor ve hiçbir şey saklamıyor: [IP adresi kontrolü](/tools/what-is-my-ip), [DNS sızıntı testi](/tools/dns-leak-test) ve [WebRTC sızıntı testi](/tools/webrtc-leak-test). Bir kez Doppler kapalıyken, bir kez açıkken çalıştırın ve karşılaştırın. O karşılaştırma, burada yazabileceğimiz her şeyden daha fazlasını anlatır.
