> **Qısa xülasə.** Doppler-i VPN-ləri bloklayan şəbəkələrdəki insanlar üçün qurduq. Həmin şəbəkələrdə sual kağız üzərində hansı protokolun daha sürətli olması deyil, sabah da hansının qoşulu qalmasıdır. VLESS ilə Reality-ni ona görə seçdik ki, o, senzora tanımaq üçün ən az və bloklamaq üçün ən az şey verir və bununla gələn güzəştləri qəbul edirik.

## Nə üçün seçirdik?

Doppler VPN-lərin məqsədli süzgəcdən keçirildiyi yerlərdən qoşulan insanlar üçün qurulub: Rusiya, İran, Çin, Körfəzin bir hissəsi. Həmin şəbəkələrdə şifrələmə asan hissədir. Bizim [müqayisəmizdəki](/vpn-protocols) hər protokol yaxşı şifrələyir. Onları ayıran odur ki, süzgəcləmə sistemi bağlantının VPN olduğunu deyə bilirmi və deyəndən sonra nəyi bloklaya bilər.

Ona görə hər variantı üç sualla qiymətləndirdik:

1. **Sabit barmaq izi varmı?** Sabit ölçülü əl sıxma və ya standart port tək qayda ilə tutula bilər.
2. **Senzor serveri zondlayanda nə baş verir?** Firewall-lar necə cavab verdiklərinə baxmaq üçün şübhəli proksilərə aktiv şəkildə qoşulur.
3. **Blok siyahısına salınacaq bir şey varmı?** Domen, sertifikat və ya tanınan server trafikin özü yaxşı gizlədilsə belə hədəfdir.

## Niyə WireGuard, OpenVPN və ya IKEv2 yox?

Üçü də birinci sualdan keçmir. [WireGuard](/vpn-protocols/wireguard)-ın əl sıxma paketləri həmişə 148 və 92 baytdır. [OpenVPN](/vpn-protocols/openvpn)-i real internet provayderinin içində işləyən tədqiqatçılar axınların 85%-dən çoxunda tanıyıb. [IKEv2](/vpn-protocols/ikev2) bütövlükdə atıla bilən standart UDP portlarında işləyir. 2023-cü ilin avqustunda Rusiyadakı istifadəçilər operatorların WireGuard və OpenVPN-i ilk paketlər içində kəsdiyini [bildiriblər](https://github.com/net4people/bbs/issues/274). Bunlar açıq şəbəkələr üçün yaxşı protokollardır. Onlar bizim şəbəkələrimiz üçün hazırlanmayıb.

## Niyə Shadowsocks və ya VMess yox?

Onlar təsadüfi baytlara bənzəməklə birinci sualdan keçir və bunun özünün barmaq izi olduğu ortaya çıxdı. 2021-ci ilin noyabrından Böyük Firewall məlum heç bir protokola bənzəməyən [tam şifrələnmiş trafiki bloklayır](https://gfw.report/publications/usenixsecurity23/en/). [VMess](/vpn-protocols/vmess) bundan yayınmaq üçün TLS-ə bükülə bilər, lakin onda ona domen lazımdır və bu, bizi üçüncü suala gətirir.

## Niyə Trojan yox?

[Trojan](/vpn-protocols/trojan) ilk iki suala yaxşı cavab verir: o, real TLS-dir və zondlar real sayt görür. Lakin hər Trojan serverinə öz domeni və sertifikatı lazımdır. Senzor həmin domeni öyrənən kimi onu bloklaya bilər, çoxlu domeni saxlamaq isə arası kəsilməyən qovmadır.

## VLESS-Reality nəyi düzgün tutur

[VLESS-Reality](/vpn-protocols/vless-reality) hər üçünə cavab verir:

- **Sabit barmaq izi yoxdur.** Bağlantı TCP üzərindən TLS 1.3-dür, internetdəki ən geniş yayılmış şifrəli trafikdir.
- **Zondlar real sayt görür.** Reality autentifikasiya edə bilməyəni, əl sıxmasını götürdüyü real sayta, həmin saytın əsl sertifikatı ilə yönləndirir.
- **Adla bloklanacaq bizə aid heç nə yoxdur.** Əl sıxmada Doppler domeni və ya sertifikatı yoxdur.

O, həm də TCP üzərində işləyir, ona görə UDP-ni məhdudlaşdıran və ya bloklayan, [Hysteria 2](/vpn-protocols/hysteria2) və [AmneziaWG](/vpn-protocols/amneziawg)-nin çətinlik çəkdiyi şəbəkələrdə işləməyə davam edir. VLESS-in özü isə kiçikdir: öz şifrələməsini əlavə etmək əvəzinə şifrələmə üçün TLS-ə arxalanır, ona görə ikiqat şifrələmə yoxdur.

## Nədən imtina etdik

- **İtki olan xətlərdə birbaşa sürət.** TCP paket itkisindən QUIC və ya WireGuard-ın UDP-si qədər rəvan bərpa olunmur. Təmiz bağlantıda fərq kiçikdir; pisində hiss oluna bilər.
- **Əməliyyat sisteminə quraşdırılmış dəstək.** Heç bir əməliyyat sistemi VLESS müştərisi ilə gəlmir, ona görə tətbiq lazımdır. Bunun qəbul edilə biləcəyinə qərar verdik və iOS, Android, macOS və Windows üçün öz tətbiqlərimizi qurduq.
- **Tam görünməzlik.** O, mövcud deyil. Tədqiqat [TLS içində TLS-in barmaq izinin çıxarıla bildiyini](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) göstərib, 2025-ci ilin noyabrında isə bəzi Rusiya internet provayderlərinin Reality bağlantılarını kəsdiyi [bildirilib](https://github.com/net4people/bbs/issues/546). VLESS-Reality senzuraya davamlılıq üçün qurulmuş dizayndır, zəmanət deyil.

## Hədlərlə bağlı nə edirik

Senzura dəyişir, ona görə protokol seçimi işin sonu deyil. Süzgəcləmə dəyişdikcə server ayarlarını və Reality-nin götürdüyü saytları tənzimləyirik və bu səhifələrdə istinad edilən eyni tədqiqatları və icma hesabatlarını izləməyə davam edirik. Daha yaxşı yanaşma ortaya çıxsa, bu səhifə bunu deyəcək.

VLESS-Reality-nin necə işlədiyinin tam texniki hekayəsi üçün [VLESS-Reality tunelini](/how-it-works/vless-reality-tunnel) oxuyun. Sınamaq üçün [VLESS VPN](/vless-vpn) səhifəsinə baxın.
