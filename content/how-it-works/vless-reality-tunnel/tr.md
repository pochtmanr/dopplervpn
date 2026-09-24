> **Kısa özet.** Şifreleme *ne gönderdiğinizi* gizler. *VPN kullandığınızı* gizlemez ve giderek artan sayıda ülkede yalnızca bu bile bağlantınızın kesilmesine yetiyor. VLESS-Reality işte bu ikinci sorunu çözmek için kurgulandı. Dışarıdan bakıldığında gerçek, tanınmış bir web sitesine yapılan normal bir TLS 1.3 ziyareti gibi görünüyor ve sunucuyu kurcalayan herkesin karşısına o gerçek web sitesi çıkıyor. Bu rehber protokolün nereden geldiğini, nasıl çalıştığını ve sınırlarının nerede olduğunu anlatıyor.

## Şifreleme neden yetmiyor?

Klasik VPN protokolleri trafiği gizli tutmak için tasarlandı, sessiz tutmak için değil. OpenVPN de WireGuard da iyi şifreliyor. İkisinin de hat üzerinde tanınabilir bir biçimi var ve derin paket incelemesi (DPI) sistemleri bu biçimi okumayı öğrendi.

Bunların hiçbiri yeni değil. 2000'lerin ADSL'inde LimeWire ya da ilk BitTorrent istemcilerini çalıştıran herkes ilk raundu yaşadı: sağlayıcılar dosya paylaşım trafiğini deseninden tanıyor ve tek bir dosyayı bile okumadan hızını kısıyordu. Sansürcüler bugün aynı şeyi daha iyi araçlarla yapıyor.

Araştırmacılar bunu ölçtü. Michigan Üniversitesi'nden ve başka kurumlardan bir ekip, yaklaşık bir milyon kullanıcıya hizmet veren bir internet sağlayıcısının içinde [bir parmak izi sistemi çalıştırdı](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen). Sistem, neredeyse hiç yanlış alarm vermeden **OpenVPN akışlarının 85%'inden fazlasını** ayıkladı. Ayrıca "gizlenmiş" diye satılan VPN kurulumlarının **41'inden 34'ünü** yakaladı.

WireGuard'ı fark etmek daha da kolay ve nedeni basit. [El sıkışma mesajları](https://www.wireguard.com/papers/wireguard.pdf) her zaman aynı boyutta: UDP üzerinden başlangıçta 148 bayt, yanıtta 92 bayt. Bu, hız açısından mükemmel bir mühendislik ve filtre yazan herkese armağan. 56k modemle internete bağlananlar sorunu hemen tanıyacak: el sıkışmanın o cıyaklaması, tek bir notasını kimse anlamasa bile evdeki herkese bağlanmakta olduğunuzu duyururdu. Sabit boyutlu bir el sıkışma, o gürültünün sessiz hâli. Ağustos 2023'te Rusya'daki kullanıcılar, büyük mobil operatörlerin WireGuard oturumlarını ilk iki veri paketinden sonra, OpenVPN'i ise yaklaşık on beş paketten sonra kestiğini [bildirdi](https://github.com/net4people/bbs/issues/274).

```chart
detection-rates
```

Bunun önemi Rusya'nın çok ötesine geçiyor. Freedom House'un [Freedom on the Net 2025](https://freedomhouse.org/report/freedom-net/2025/uncertain-future-global-internet) raporu, izlediği 72 ülkede internet özgürlüğünün gerilediği **üst üste 15. yılı** kayda geçirdi. Bunların en az 21'inde, insanların sansürü aşmak için kullandığı araçların [kendisi engellenmişti](https://freedomhouse.org/report/special-report/2025/tunnel-vision-anti-censorship-tools-end-end-encryption-and-fight-free).

## Shadowsocks'tan Reality'ye nasıl gelindi?

Bu listedeki her protokol, kendinden öncekinin yakalanmasına verilmiş bir yanıttı.

```chart
protocol-timeline
```

Shadowsocks hiçbir şeye benzememeye, saf rastgele baytlar gibi görünmeye çalıştı. Büyük Güvenlik Duvarı şüpheli sunucuları [aktif olarak sondalamayı](https://gfw.report/publications/imc20/en/) öğrendi: araştırmacılar dört aydan kısa sürede **12,300 Çin IP adresinden gelen 51,837 sonda** kaydetti ve bunların yarısından fazlası gerçek bir bağlantının ardından bir dakika içinde geldi. Ardından Çin, Kasım 2021'den itibaren ilk paketin ne kadar rastgele göründüğüne dair basit kurallar kullanarak ["tamamen şifreli" trafiği](https://gfw.report/publications/usenixsecurity23/en/) toptan engellemeye başladı.

Topluluğun çıkardığı ders sertti. Rastgele görünmek şüphe çekiyor, çünkü normal trafik rastgele değil. Normal trafik TLS. SSL asma kilidinin yalnızca ödeme sayfalarında belirdiği yıllarda şifreli trafik, kendi başına göze batacak kadar seyrekti. Bugün ise bütün web'in fon gürültüsü ve mevcut en iyi kamuflaj. Bu yüzden yeni kuşak saklanmayı bırakıp taklit etmeye başladı.

Trojan, proxy trafiğini gerçek TLS'in içine sardı; ama kendi alan adına ve sertifikasına ihtiyaç duyuyordu ve bir sansürcü bunları listeleyip engelleyebiliyordu. RPRX adıyla bilinen bir geliştiricinin [Temmuz 2020'de](https://github.com/v2ray/v2ray-core/issues/2636) önerdiği VLESS, proxy katmanını küçücük bir başlığa indirdi ve şifrelemeyi altındaki TLS'e bıraktı. Mart 2023'te [Xray-core v1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0) ile çıkan Reality ise kendi alan adınıza duyulan ihtiyacı tümüyle ortadan kaldırdı.

## VLESS nedir?

VLESS, sunucuya trafiğinizin nereye gitmesi gerektiğini söyleyen parça. Bilerek asgari düzeyde tutulmuş. Bir istek başlığı sürüm için 1 bayt, kullanıcı kimliği için 16 bayt, komut ve port için birkaç bayt, sonra da hedef adresten oluşuyor: bağlantı başına bir kez gönderilen, [yaklaşık 22 bayt artı adres](https://xtls.github.io/en/development/protocols/vless.html). Ondan sonra verileriniz hiç ellenmeden akıyor.

VLESS'in kendine ait bir şifrelemesi yok ve bu bilinçli bir tercih. Zaten şifreli olan bir TLS akışının içinde yeniden şifrelemek pil harcıyor ve göze batan ikinci bir katman ekliyor. VLESS, altındaki TLS katmanına güveniyor; Reality de tam burada devreye giriyor.

## Reality nasıl çalışıyor?

Reality tek bir soruyu yanıtlıyor: bir sansürcünün engelleyebileceği bir sertifika olmadan TLS'i nasıl çalıştırırsınız?

Yanıtı, başkasınınkini ödünç almak. Bir Reality sunucusu, TLS 1.3 destekleyen gerçek ve popüler bir hedef web sitesiyle yapılandırılıyor. Bir bağlantı geldiğinde olanlar şunlar.

1. **Uygulamanız normal bir TLS 1.3 el sıkışması başlatıyor.** İçindeki site adı (SNI) o gerçek web sitesinin adı ve el sıkışmanın parmak izi yaygın bir tarayıcınınkiyle eşleşiyor.
2. **Sunucu gizli bir belirteci kontrol ediyor.** Uygulamanız, yalnızca gerçek bir Doppler istemcisinin üretebileceği, x25519 anahtar çiftinden türetilmiş bir kanıtı el sıkışmanın içine karıştırıyor. Dışarıdan bakan biri için bu, sıradan el sıkışma rastgeleliği gibi görünüyor.
3. **Gerçek istemci: tünel açılıyor.** Sunucu el sıkışmayı geçici bir sertifikayla tamamlıyor ve VLESS trafiğinizi taşımaya başlıyor.
4. **Başka herkes: bağlantı öteye aktarılıyor.** Bir sansürcünün sondası, meraklı bir tarayıcı ya da düz bir web tarayıcısı gerçek web sitesine yönlendiriliyor ve onun gerçek, geçerli sertifikasını görüyor. Bulunacak sıra dışı hiçbir şey yok.

```chart
schema-reality
```

Dördüncü adım işin zekice kısmı. Shadowsocks'u yakalayan teknik olan aktif sondalama, artık proxy beklediği yerde gerçek bir web sitesi buluyor. Sunucuyu SNI'ya bakarak engellemek, milyonlarca insanın kullandığı büyük bir siteyi engellemek anlamına gelirdi.

Doppler bunun üzerine bir de **XTLS Vision** kullanıyor; [Ekim 2022'de](https://xtls.github.io/en/about/news.html) yayımlanan bir akış kipi. Tünelin içindeki trafik zaten TLS ise, ki bugün web trafiğinin çoğu öyle, Vision onu ikinci kez şifrelemeyi bırakıyor. Bu hem işlemci ve pil tasarrufu sağlıyor hem de TLS içine yerleşmiş TLS'in ele veren boyutlarını ortadan kaldırıyor.

## Diğer protokollerle karşılaştırınca nasıl duruyor?

| Protokol | Dışarıdan bakanın gördüğü | Nasıl yakalanıyor | Kendi alan adı ve sertifikası gerekiyor mu |
|---|---|---|---|
| OpenVPN | Ayırt edilebilir OpenVPN paketleri | Parmak izi çıkarma, bir çalışmada [akışların 85%'inden fazlası](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) | Hayır |
| WireGuard | Sabit 148 ve 92 baytlık UDP el sıkışması | Sabit mesaj boyutları; Rusya'da 2 paketten sonra kesiliyor (kullanıcı bildirimleri, 2023) | Hayır |
| Shadowsocks | Rastgele görünen baytlar | Rastgelelik kuralları ve aktif sondalama | Hayır |
| Trojan | Kendi alan adınıza gerçek TLS | Alan adı ve sertifika listelenebiliyor | **Evet** |
| **VLESS + Reality** | Gerçek, popüler bir web sitesine TLS 1.3 | Listenin en zoru; sınırlar için aşağıya bakın | **Hayır** |

Hat üzerindeki yüke gelince: her TLS 1.3 kaydı, 16 KB'a kadar veri için [22 bayt](https://www.rfc-editor.org/rfc/rfc8446#section-5.2) ekliyor. WireGuard her pakete 32 bayt ekliyor, üstüne kendi UDP ve IP başlıkları geliyor. Günlük kullanımda ikisi de fark edeceğiniz bir sayı değil. Asıl önemli fark, bağlantının hayatta kalıp kalmadığı.

## VLESS-Reality tespit edilemez mi?

Hiçbir protokol tespit edilemez değildir ve aksini söyleyen size bir şey satıyordur. Araştırmaların ve sahadan gelen bildirimlerin gerçekte gösterdiği şu.

- **TLS içindeki TLS iz bırakıyor.** [2024 tarihli bir USENIX Security makalesi](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting), bir TLS el sıkışmasının başka bir TLS bağlantısının içinde taşınma deseninin gizlenmiş proxy'leri tanımlayabildiğini gösterdi; test edilen 23 kurulumda tespit oranları 70%'in üzerindeydi. XTLS Vision tam da bu desene karşı tasarlanmıştı ve yazarların onun dolgusuyla baş edebilmek için ayrı bir sınıflandırıcıya ihtiyacı oldu.
- **Sansürcüler uyum sağlamayı sürdürüyor.** Kasım 2025'te kullanıcılar, Rusya'daki bazı ev internet sağlayıcılarının veri akmaya başladığı anda VLESS + Reality + Vision bağlantılarını kesmeye başladığını [bildirdi](https://github.com/net4people/bbs/issues/546). Paylaştıkları geçici çözümler arasında farklı portlar ve taşıma katmanları vardı.

İşte bu yüzden protokol işin yalnızca yarısı. Diğer yarısı onu iyi işletmek: ayarları döndürmek, bir ağ kurallarını değiştirdiğinde taşıma katmanını değiştirmek ve bunu sizden hiçbir şeyi yeniden yapılandırmanızı istemeden yapmak. Doppler bunu sunucu tarafında hallediyor; konu [adım 3: uç ağ](/how-it-works/edge-network) yazısında.

## Bu sizin için ne anlama geliyor?

- Sıradan ağlarda çifte şifreleme olmadan hızlı, modern bir TLS 1.3 tüneli elde ediyorsunuz.
- Sansürlü ağlarda bağlantınız popüler bir web sitesine yapılan ziyaret gibi görünüyor; bu da herkesin internetini bozmadan engellenmesi en zor trafik türü.
- Hiçbir yapılandırma dosyasına elinizi sürmüyorsunuz. Doğru kurulumu uygulama sizin için seçiyor.

VPN seçmeye çalışan insanlar için hazırlanmış daha kısa bir genel bakış isterseniz [VLESS protokolü rehberimize](/vless-vpn) bakın. Sonrasında trafiğinizi tünelden çıktığı yere kadar takip edin: [adım 3, Doppler uç düğümü](/how-it-works/edge-network).
