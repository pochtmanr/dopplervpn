> **Kısaca.** OpenVPN, açık kaynaklı VPN'lerin kıdemlisidir: esnek, geniş destekli ve yirmi yılı aşkın sürede iyi tanınmış bir protokol. Yeni protokollerden yavaştır ve yayımlanmış araştırmalara göre bir internet servis sağlayıcısının parmak izini en kolay çıkarabildiği protokollerden biridir.

## OpenVPN nedir?

OpenVPN, James Yonan tarafından [Mayıs 2001'de](https://en.wikipedia.org/wiki/OpenVPN) ilk kez yayımlanan ücretsiz, açık kaynaklı bir VPN yazılımıdır. 2000'li ve 2010'lu yılların büyük bölümünde ticari VPN hizmetlerinin ve kurumsal uzaktan erişimin varsayılan tercihi oldu; hâlâ birçok yönlendiricide ve kurumsal üründe bulunur.

İşletim sistemi çekirdeğinde değil, kullanıcı alanında çalışır ve anahtar değişimi için OpenSSL kütüphanesine ve TLS protokolüne dayanır. IANA'nın atadığı port 1194'tür; ancak OpenVPN neredeyse her portta UDP veya TCP üzerinden çalışabilir.

## Nasıl çalışır?

OpenVPN, iki bölümden oluşan özel bir protokol kullanır. Kontrol kanalı, iki tarafın kimliğini (genellikle sertifikalarla) doğrulamak ve anahtarlar üzerinde anlaşmak için TLS kullanır. Veri kanalı ise trafiğinizi bu anahtarlarla şifrelenmiş hâlde UDP veya TCP paketleri içinde taşır.

Bu yapı OpenVPN'i çok yapılandırılabilir kılar. Şifreleri, kimlik doğrulama yöntemlerini, portları ve taşıma katmanlarını seçebilir, onu vekil sunucular üzerinden çalıştırabilirsiniz. Bu esnekliğin bedeli karmaşıklıktır: daha fazla kod, daha fazla ayar ve zayıf bir yapılandırmayla karşılaşmanın daha fazla yolu.

## OpenVPN neden engellenir?

OpenVPN'in içindeki TLS, bir web sitesine yapılan HTTPS ziyaretiyle aynı şey değildir. OpenVPN, TLS el sıkışmasını kendi paket çerçevesine sarar; bu yüzden trafiğinin sıradan web trafiğinde bulunmayan bir biçimi vardır.

Araştırmacılar bunun ne kadar önemli olduğunu ölçtü. Michigan Üniversitesi'nden ve diğer kurumlardan bir ekip [bir parmak izi sistemi geliştirdi](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) ve bunu yaklaşık bir milyon kullanıcıya hizmet veren bir internet servis sağlayıcısının içinde çalıştırdı. Sistem, çok az yanlış pozitifle **OpenVPN akışlarının %85'inden fazlasını** tanıdı; test edilen ticari "gizlenmiş" OpenVPN kurulumlarının da çoğunu yakaladı.

Gerçek dünyadaki filtreleme araştırmaları izliyor. Ağustos 2023'te Rusya'daki kullanıcılar, mobil operatörlerin OpenVPN bağlantılarını başladıktan kısa süre sonra kestiğini [bildirdi](https://github.com/net4people/bbs/issues/274).

## OpenVPN ne zaman kullanılmalı?

- **Uyumluluk.** Eski yönlendiriciler, kurumsal ağ geçitleri ve bazı şirket ağları OpenVPN'i destekler, daha yenisini desteklemez.
- **Yalnızca TCP'ye izin veren ağlar.** OpenVPN, UDP engellendiğinde TCP üzerinden çalışabilir; [WireGuard](/vpn-protocols/wireguard) ise yardım almadan bunu yapamaz.
- **Filtrelenen ağlarda değil.** VPN'lerin engellendiği yerlerde OpenVPN genellikle erken devre dışı kalır. [VLESS-Reality](/vpn-protocols/vless-reality) gibi normal web trafiğini taklit eden bir protokol daha uygun bir araçtır. [Sansür rehberimiz](/bypass-censorship), filtreleme sistemlerinin neyi keseceğine nasıl karar verdiğini açıklar.

## Doppler OpenVPN kullanıyor mu?

Hayır. Doppler her platformda VLESS-Reality kullanır. Nasıl seçtiğimizi [neden VLESS](/vpn-protocols/why-vless) rehberi açıklar.
