> **Kısa özet.** Her güvenli bağlantı, şifreleme başlamadan önce gideceği web sitesini düz metin olarak adlandırır. Bu ad SNI'dır. Sansürcüler neyi engelleyeceğine karar vermek için onu okur. Doppler her bağlantıya bulunduğunuz yerde izin verilen sıradan bir sitenin adını verir; böylece tünel oraya yapılan normal bir ziyaret gibi görünür.

## Zarftaki ad

Tarayıcınız `https://example.com` açtığında gönderdiği ilk mesaja ClientHello denir. Şifreli oturumu başlatır ve **Server Name Indication**, kısaca SNI adlı bir alan taşır. Alan, okunabilir metinle hangi siteyi istediğinizi söyler.

Pratik bir nedenle vardır. Tek bir sunucu çoğu zaman tek bir IP adresinde yüzlerce web sitesi barındırır ve herhangi bir şifreleme kurulmadan önce hangi sitenin sertifikasını sunacağını bilmesi gerekir. Fikir 2003'te yazıya geçti ve bugün RFC 6066'da belirtiliyor.

Adres çubuğunuzdaki asma kilit, o ilk mesajdan sonrasını kapsar: sayfalar, parolalar, çerezler. Adı kapsamaz. Üzerine adres yazılmış mühürlü bir mektup düşünün. Mektubu kimse okuyamaz. Onu elinden geçiren herkes adresi okuyabilir.

## Sansürcüler neden okur

Bir sansürcü için SNI eldeki en ucuz sinyaldir. Hiçbir şifrelemeyi kırmasına veya trafik desenlerinden tahmin etmesine gerek yoktur. Tek bir alanı okur ve bir listeyle karşılaştırır.

Birçok ulusal filtrenin bugün web sitelerini engelleme biçimi budur ve VPN'leri fark etmelerinin yollarından biri de budur. SNI'sı bilinen bir VPN sağlayıcısını, var olmayan bir adı veya sunucunun yanıtıyla eşleşmeyen bir adı taşıyan bağlantıyı düşürmek kolaydır. Okul veya ofis vekilinin yasak adreslerin listesini tuttuğu 2000'lerin başı web'ini hatırlayanlar yöntemi tanıyacaktır. Yalnızca bir katman aşağı inmiştir.

## Encrypted Client Hello neyi değiştirir

Devam eden bir çözüm var. **Encrypted Client Hello**, ECH, ad dahil tüm ilk mesajı şifreler. Artık bir IETF standardıdır, RFC 9849, ve Cloudflare 2023'te ağı arkasındaki siteler için açtı.

Sansürün en ağır olduğu yerlerde kulağa geldiği kadar yardımcı olmaz. ECH yalnızca hem tarayıcı hem de site desteklediğinde çalışır ve adı okuyamayan bir sansürcü, onu gizleyen her bağlantıyı yine de engelleyebilir. Çin, tam da bu nedenle 2020'de ESNI adlı önceki sürümü toptan engelledi. Gizli bir adın kendisi bir sinyaldir.

## Doppler adı gizlemek yerine nasıl kullanır

Doppler, ECH'nin tersi yolu tutar. Adı gizlemek yerine, sansürcünün engellemek için hiçbir nedeni olmayan bir ad gösterir.

Alttaki protokol **VLESS Reality**'dir. Bir Doppler bağlantısı, bulunduğunuz yerde çalışan gerçek ve popüler bir web sitesinin SNI'sını sunar; örneğin büyük bir arama, alışveriş veya yazılım sitesi. Bir sansürcü kontrol için sunucuyu sondalarsa Reality sondayı gerçek siteye iletir, böylece kontrol geçer. Tünele yalnızca doğru anahtarı tutan istemci ulaşır.

![iPhone'da Doppler'ın Connection method ekranı; bir bağlantının ziyaret gibi görünebileceği siteleri listeliyor](/images/apple/sni-options-1800.avif "Connection method ekranı. Her satır, bağlantınızın ziyaret gibi görünebileceği bir sitedir.")

## Connection method ekranı

Hangi adın işe yaradığı ülkeye ve haftaya bağlıdır. Bu yüzden Doppler seçime kendi ekranını verir: sunucu listesinin üstünden veya Uygulama Ayarları'ndan açılan **Connection method**.

- **Bağlanılan ülke** sizin ülkenizdir. Doppler algılar ve siz değiştirebilirsiniz. Bazı ülkeler özel bir site listesine ihtiyaç duyar; bazıları duymaz.
- **Automatic** varsayılan ve önerdiğimiz seçenektir. Bağlandığınızda uygulama en olası üç siteyi birden dener ve ilk geçen hangisiyse onu tutar. Ülkenizdeki insanlarda son zamanlarda neyin işe yaradığından öğrenir.
- **Seçtiğiniz bir site**, ağınızda belirli bir adın işe yaradığını bildiğiniz zaman içindir. Her satır kaç sunucunun onu taşıdığını söyler. Çalışmayı bırakırsa Automatic'e geri dönün.

![MacBook Pro'da Doppler'ın Connection method paneli](/images/apple/mac-hand-1800.avif "Mac'te aynı ekran.")

İzin verirseniz Doppler hangi sitelerin bağlandığına ve hangilerinin başarısız olduğuna dair anonim sayımlar gönderir. Bu sayımlar Automatic'i ülkenizdeki herkes için daha akıllı kılar. Hesabınızı veya IP adresinizi asla içermezler.

## Bunun vaat etmediği şey

Hiçbir kamuflaj sonsuza dek çalışmaz. Sansürcüler trafiği inceler ve araştırmacılar, SNI mükemmel olsa bile tünellerin bazen zamanlama ve boyut desenleriyle taklit ettikleri sitelerden ayırt edilebildiğini göstermiştir. Kasım 2025'te Rusya'daki kullanıcılar bazı VLESS Reality bağlantılarının kesildiğini bildirdi.

Doppler'ın yanıtı imkânsızı vaat etmek yerine seçenekleri açık tutmaktır: sunucu başına birkaç kamuflaj sitesi, her bağlantıda aralarında bir yarış ve biri başarısız olduğunda yedek rotalar. [Nasıl çalışıyor dizisi](/how-it-works/vless-reality-tunnel) tünelin kendisine daha derin iner.
