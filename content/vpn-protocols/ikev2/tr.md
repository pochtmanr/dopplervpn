> **Kısaca.** IKEv2/IPsec, telefonunuzun ve dizüstü bilgisayarınızın herhangi bir uygulama olmadan zaten konuşabildiği VPN'dir. Hızlıdır ve Wi-Fi ile mobil veri arasındaki geçişleri iyi yönetir. Ayrıca sabit ve herkesçe bilinen portlarda çalışır; bu da onu bir sansürcünün engellemesi en kolay protokollerden biri yapar.

## IKEv2/IPsec nedir?

"IKEv2" aslında birlikte çalışan iki parçadır. IPsec, IP paketlerini şifreleyen ve doğrulayan paketlerin bütünüdür. İnternet Anahtar Değişimi anlamına gelen IKE ise iki tarafın birbirinin kimliğini doğrulamak ve IPsec anahtarları üzerinde anlaşmak için kullandığı protokoldür. IKE'nin 2. sürümü [Aralık 2005'te](https://en.wikipedia.org/wiki/Internet_Key_Exchange) standartlaştırıldı; güncel şartname [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296)'dır.

Bir IETF standardı olduğu için IKEv2; iOS, macOS ve Windows'a, Android'e ise 11. sürümden itibaren yerleşiktir. Birçok kurumsal VPN ağ geçidi onu kullanır.

## Nasıl çalışır?

Anahtar değişimi UDP üzerinden, [genellikle 500 numaralı portta](https://en.wikipedia.org/wiki/Internet_Key_Exchange) yürür. İki taraf anahtarlar üzerinde anlaştıktan sonra işletim sisteminin IPsec yığını trafiğinizi Encapsulating Security Payload (ESP) ile şifreler. Yolda bir NAT yönlendirici olduğunda (hemen her ev ve mobil ağda olduğu gibi) hem IKE hem de ESP, 4500 numaralı portta UDP içine sarılır.

IKEv2'nin, bağlantının IP adresi değişimine dayanmasını sağlayan [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) adlı standart bir uzantısı vardır. IKEv2'nin telefonlarda keyifli olmasının nedeni budur: Wi-Fi kapsama alanından çıkıp mobil veriye geçtiğinizde tünel baştan bağlanmak yerine kaldığı yerden devam eder.

## IKEv2 neden kolay engellenir?

IKEv2, başka bir şeye benzemeye çalışmaz. Trafiği herkesçe bilinen UDP portlarını kullanır ve herhangi bir ağ aracının ayrıştırabileceği standart IKE ve ESP biçimlerine sahiptir. Onu engellemek için derin paket denetimi bile gerekmez: bir filtre 500 ve 4500 numaralı UDP portlarını düşürebilir ya da IKE alışverişini doğrudan tanıyabilir.

VPN olarak tanınmanın hiçbir bedeli olmadığı kurumsal ağlar ve açık ülkelerdeki seyahatler için bu makul bir tercihtir. VPN'lerin bilerek filtrelendiği ağlarda ise genellikle çalışmayı ilk bırakan protokoldür.

## IKEv2 ne zaman kullanılmalı?

- **Uygulamaya izin yok.** Yazılım kuramadığınız yönetilen bir cihazda, yerleşik IKEv2 istemcisi tek seçenek olabilir.
- **Filtrelenmeyen ağlarda mobil dolaşım.** MOBIKE, ağlar arasında geçiş yaparken akıcı bir deneyim sağlar.
- **Sansür altında değilse.** Filtrelenen ağlarda, [VLESS-Reality](/vpn-protocols/vless-reality) gibi çevreye karışmak üzere tasarlanmış bir protokol seçin. [Sansür rehberimiz](/bypass-censorship), engellemenin nasıl çalıştığını açıklar.

## Doppler IKEv2 kullanıyor mu?

Hayır. Doppler, kendi uygulamalarının içinde VLESS-Reality ile bağlanır. Nedenleri için [neden VLESS](/vpn-protocols/why-vless) rehberine bakın.
