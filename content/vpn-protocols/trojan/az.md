> **Qısa xülasə.** Trojan proksi trafikini sizin idarə etdiyiniz real sayta real TLS bağlantısının içində gizlədir. Parolsuz qoşulan hər kəs sadəcə saytı görür. O, yaxşı işləyir, lakin öz domeniniz və sertifikatınız lazımdır və onları tapıb bloklamaq olar.

## Trojan nədir?

Trojan [trojan-gfw layihəsindən](https://github.com/trojan-gfw/trojan) olan, ilk dəfə 2017-ci ilin oktyabrında buraxılmış proksi protokoludur. İdeya adındadır: maskalanma icad etmək əvəzinə o, internetdəki ən geniş yayılmış şifrəli trafikin, yəni HTTPS-in içində gizlənir.

## O necə işləyir?

[Protokolun təsviri](https://trojan-gfw.github.io/trojan/protocol) qısadır. Trojan serveri real domen üçün real sertifikatla normal HTTPS serveri kimi dinləyir. Müştəri əsl TLS əl sıxması edir. Sonra şifrəli bağlantının içində bunları göndərir:

- ortaq parolun onaltılıq kodlanmış SHA-224 heşi, 56 simvol,
- sətir keçidi,
- trafikin hara getməli olduğunu deyən, SOCKS5-ə bənzər formatda kiçik sorğu,
- daha bir sətir keçidi, ardınca isə verilənlərin ilk hissəsi.

Heş və sorğu düzgündürsə, server təyinat yerinə tunel açır. Nəsə səhvdirsə, server bağlantını "digər protokollar" kimi qəbul edir və onu ehtiyat veb serverinə ötürür, beləcə ziyarətçi adi sayt görür.

## Trojan-ı bloklamaq nə qədər çətindir?

Kənardan Trojan bağlantısı sizin domeninizə, sizin sertifikatınızla TLS sessiyasıdır. Aktiv zondlar real sayt alır. Bu, Trojan-ı təsadüfi görünən protokollardan, məsələn, [Shadowsocks](/vpn-protocols/shadowsocks)-dan ayırd etməyi xeyli çətinləşdirir.

Onun zəif nöqtəsi domenin özüdür. Hər serverə domen və sertifikat lazımdır və proksilərə aid domenləri öyrənən senzor onları ad və ya IP ilə bloklaya bilər. Tədqiqatçılar həmçinin göstəriblər ki, TLS içində daşınan TLS zaman və ölçü nümunələri buraxır və bunlarla [barmaq izi çıxarmaq](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) olar; bu, Trojan-a və oxşar quruluşlara aiddir.

[VLESS-Reality](/vpn-protocols/vless-reality) öz domeniniz əvəzinə mövcud, populyar saytın TLS əl sıxmasını götürməklə domen problemini aradan qaldırır.

## Trojan-dan nə vaxt istifadə etməli?

- **Domeni idarə etdiyiniz zaman** və HTTPS-ə bənzəyən sadə, yaxşı başa düşülən quruluş istədiyinizdə.
- **Orta dərəcədə süzgəcdən keçən şəbəkələrdə**, domeninizin hədəf alınma ehtimalı az olanda.
- Onların arasında seçim edirsinizsə, bizim [VLESS, VMess və Trojan](/blog/vless-vs-vmess-vs-trojan) müqayisəmiz kömək edir.

## Doppler Trojan-dan istifadə edirmi?

Xeyr. Doppler öz domeninə ehtiyacı olmayan VLESS-Reality-dən istifadə edir. Baxın: [niyə VLESS](/vpn-protocols/why-vless).
