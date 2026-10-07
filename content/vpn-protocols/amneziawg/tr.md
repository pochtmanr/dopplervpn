> **Kısaca.** AmneziaWG, WireGuard'ın hızını ve kriptografisini koruyan, ancak WireGuard'ı kolay fark edilir kılan paket biçimlerini ve başlıkları değiştiren bir WireGuard türevidir. Sade WireGuard'ın engellendiği yerlerde güçlü bir seçenektir; tek bir şartla: gizleme açıldığında artık standart WireGuard sunucularıyla konuşmaz.

## AmneziaWG nedir?

AmneziaWG, kendi VPN sunucunuzu çalıştırmak için geliştirilmiş açık kaynaklı bir uygulama olan [Amnezia VPN](https://amnezia.org/)'in ekibi tarafından geliştirilir. Projenin [Go uygulaması](https://github.com/amnezia-vpn/amneziawg-go) 2023'te başlatıldı. Hızlı ve basit olan ama sabit, tanınabilir bir el sıkışması bulunan [WireGuard](/vpn-protocols/wireguard)'ı alır ve üzerine onu gizleyen bir katman ekler.

## Neyi değiştirir?

[AmneziaWG belgeleri](https://docs.amnezia.org/documentation/amnezia-wg/), her biri yapılandırma parametreleriyle denetlenen birkaç mekanizmayı anlatır:

- **Dinamik başlıklar (H1–H4).** Standart WireGuard paketleri, dört paket biçiminin her biri için sabit bir mesaj türüyle başlar. AmneziaWG bu değerleri yapılandırılmış aralıklardan seçilen sayılarla değiştirir; böylece iki farklı kurulum başlıkları paylaşmaz ve hiçbir tek filtre kuralı hepsiyle eşleşmez.
- **Paket uzunluğu rastgeleleştirme (S1–S4).** WireGuard'da ilk el sıkışma paketi her zaman tam olarak 148 bayttır. AmneziaWG her paket türüne rastgele önekler ekler; böylece boyutlar değişir.
- **Çöp paketler (Jc, Jmin, Jmax).** El sıkışmadan önce istemci, rastgele uzunlukta, yapılandırılabilir sayıda sözde rastgele paket gönderir; bunlar oturumun başlangıcını hem zaman hem boyut bakımından bulanıklaştırır.
- **Başlık koruması.** Yeni sürümler mesaj türü alanının kendisini de şifreleyebilir.

Altta kriptografi ve genel tasarım WireGuard'ınki olarak kalır.

## AmneziaWG'yi engellemek ne kadar zordur?

Filtrelerin WireGuard'a karşı kullandığı basit imzaları, yani sabit boyutları ve sabit başlık değerlerini ortadan kaldırır. Bu da onu VPN'lerin engellendiği ağlarda sade WireGuard'dan çok daha dayanıklı kılar.

Yine de UDP üzerinde çalışır; bu yüzden UDP'yi geniş çapta kısıtlayan ya da engelleyen ağlar onu etkiler. Trafiği ayrıca, [VLESS-Reality](/vpn-protocols/vless-reality)'nin gerçek bir web sitesine yapılan TLS ziyaretini taklit etmesi gibi belirli bir uygulamayı taklit etmez. Tanınmayan UDP'yi doğrudan engelleyen bir filtre onu yine yakalayabilir.

## AmneziaWG ne zaman kullanılmalı?

- **WireGuard'ın engellendiği ama UDP'nin hâlâ çalıştığı yerlerde** ve WireGuard'a benzer hız istediğinizde.
- Kurulumu için Amnezia VPN uygulamasını kullanarak **kendi barındırdığınız sunucularda**.
- UDP'yi filtreleyen ağlar için VLESS-Reality gibi TCP tabanlı bir seçeneği de elinizde tutun. [Rusya rehberimiz](/vpn-for-russia), orada şu anda nelerin geçtiğini ele alır.

## Doppler AmneziaWG kullanıyor mu?

Hayır. Doppler VLESS-Reality kullanır. [Neden VLESS](/vpn-protocols/why-vless) rehberine bakın.
