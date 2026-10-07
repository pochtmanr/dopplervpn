> **Kısaca.** Trojan, vekil sunucu trafiğini sizin denetlediğiniz gerçek bir web sitesine yapılan gerçek bir TLS bağlantısının içine gizler. Parola olmadan bağlanan herkes yalnızca web sitesini görür. İyi çalışır, ancak kendi alan adınıza ve sertifikanıza ihtiyaç duyarsınız; bunlar da bulunup engellenebilir.

## Trojan nedir?

Trojan, ilk kez Ekim 2017'de yayımlanan [trojan-gfw projesine](https://github.com/trojan-gfw/trojan) ait bir vekil sunucu protokolüdür. Fikri adında saklıdır: bir kılık icat etmek yerine, internetteki en yaygın şifreli trafiğin, yani HTTPS'in içine gizlenir.

## Nasıl çalışır?

[Protokol açıklaması](https://trojan-gfw.github.io/trojan/protocol) kısadır. Bir Trojan sunucusu, gerçek bir alan adı için gerçek bir sertifikayla normal bir HTTPS sunucusu gibi dinler. İstemci gerçek bir TLS el sıkışması gerçekleştirir. Ardından şifreli bağlantının içinde şunları gönderir:

- ortak parolanın onaltılık kodlanmış SHA-224 özeti; bu 56 karakterdir,
- bir satır sonu,
- trafiğin nereye gitmesi gerektiğini SOCKS5'e benzer bir biçimde belirten küçük bir istek,
- bir satır sonu daha ve ardından verinin ilk parçası.

Özet ve istek geçerliyse sunucu hedefe bir tünel açar. Herhangi bir şey yanlışsa sunucu bağlantıyı "diğer protokoller" olarak değerlendirir ve bir yedek web sunucusuna aktarır; böylece ziyaretçi sıradan bir web sitesi görür.

## Trojan'ı engellemek ne kadar zordur?

Dışarıdan bakıldığında bir Trojan bağlantısı, alan adınıza ve sertifikanıza yapılmış bir TLS oturumudur. Aktif yoklamalar karşılığında gerçek bir web sitesi alır. Bu, Trojan'ı [Shadowsocks](/vpn-protocols/shadowsocks) gibi rastgele görünen protokollere göre ayırt etmeyi çok daha zor kılar.

Zayıf noktası alan adının kendisidir. Her sunucunun bir alan adına ve sertifikaya ihtiyacı vardır; hangi alan adlarının vekil sunuculara ait olduğunu öğrenen bir sansürcü onları ada ya da IP'ye göre engelleyebilir. Araştırmacılar ayrıca TLS içinde taşınan TLS'in, Trojan'ı ve benzer tasarımları etkileyen zamanlama ve boyut desenleri bıraktığını, bunların [parmak izinin çıkarılabildiğini](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) gösterdi.

[VLESS-Reality](/vpn-protocols/vless-reality), sizin kendi alan adınız yerine var olan, popüler bir web sitesinin TLS el sıkışmasını ödünç alarak alan adı sorununu ortadan kaldırır.

## Trojan ne zaman kullanılmalı?

- **Bir alan adını denetlediğinizde** ve HTTPS'e benzeyen, basit ve iyi bilinen bir kurulum istediğinizde.
- Alan adınızın hedef alınma ihtimalinin düşük olduğu, **orta düzeyde filtrelenen ağlarda**.
- Aralarında seçim yapıyorsanız [VLESS, VMess ve Trojan](/blog/vless-vs-vmess-vs-trojan) karşılaştırmamız yardımcı olur.

## Doppler Trojan kullanıyor mu?

Hayır. Doppler, kendi alan adına ihtiyaç duymayan VLESS-Reality kullanır. [Neden VLESS](/vpn-protocols/why-vless) rehberine bakın.
