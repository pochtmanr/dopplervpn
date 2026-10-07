> **Qısa xülasə.** Hysteria 2 HTTP/3-ün arxasındakı nəqliyyat olan QUIC üzərində qurulmuş proksi protokoludur. O, pis və itki olan bağlantılarda sürət üçün hazırlanıb və parolu olmayan hər kəs üçün serveri adi HTTP/3 saytı kimi davranır. Zəif yeri odur ki, o, UDP-dən asılıdır, bəzi şəbəkələr isə UDP-ni məhdudlaşdırır və ya tam bloklayır.

## Hysteria 2 nədir?

Hysteria [apernet](https://github.com/apernet/hysteria)-dən açıq mənbəli layihədir; yenidən qurulmuş protokol olan 2-ci versiya 2023-cü ilin sentyabrında buraxılıb. Shadowsocks və VLESS kimi o da klassik VPN yox, proksidir və müştərilər bütün cihazı ondan keçirə bilər.

## O necə işləyir?

[Protokol spesifikasiyasına](https://v2.hysteria.network/docs/developers/Protocol/) görə Hysteria 2 [RFC 9000](https://www.rfc-editor.org/rfc/rfc9000)-də müəyyən edildiyi kimi QUIC üzərində, UDP trafiki üçün etibarsız dataqram genişlənməsi ilə işləyir. QUIC artıq TLS 1.3 şifrələməsi, multiplekslənmiş axınlar və sürətli bağlantı qurulması təmin edir.

Maskalanma autentifikasiyada başlayır. Spesifikasiya tələb edir ki, Hysteria serveri **real HTTP/3 serveri həyata keçirməlidir** ([RFC 9114](https://www.rfc-editor.org/rfc/rfc9114)) və sorğuları istənilən veb serverin etdiyi kimi emal etməlidir. Müştəri xüsusi HTTP/3 sorğusu ilə autentifikasiya olunur; maraqlı ziyarətçi və ya aktiv zond olsun, qalan hər kəs adi veb cavabları alır. Spesifikasiya deyir ki, etimadnaməsi olmayan üçüncü tərəf üçün server standart HTTP/3 veb serveri kimi davranır.

## O niyə sürətlidir?

QUIC UDP üzərində işləyir və paket itkisindən elə bərpa olunur ki, TCP kimi hər axını dayandırmır. Hysteria qeyri-sabit xətlər üçün nəzərdə tutulmuş öz tıxac idarəetməsindən də istifadə edə bilər, ona görə o, TCP əsaslı protokolların yavaşladığı yüklənmiş mobil şəbəkələrdə, uzaq marşrutlarda və maneəli Wi-Fi-da sürətini saxlamağa meyllidir.

## Hysteria 2-ni bloklamaq nə qədər çətindir?

Aktiv zondlamaya qarşı o, yaxşı dayanır, çünki zondlar veb server görür. Açıq qalan tərəf nəqliyyatdır. Senzor əksər saytları pozmadan UDP-ni və ya konkret QUIC-i məhdudlaşdıra və ya bloklaya bilər, çünki brauzerlər HTTP/3 alınmayanda TCP üzərindən HTTP/2-yə qayıdır. Bu baş verəndə Hysteria 2-nin gedəcək yeri qalmır, [VLESS-Reality](/vpn-protocols/vless-reality) kimi TCP əsaslı protokollar isə işləməyə davam edir.

## Hysteria 2-dən nə vaxt istifadə etməli?

- **İtki olan və ya uzaq xətlərdə**, onun tıxac idarəetməsi və QUIC-in itki bərpası özünü doğrultduqda.
- **UDP-yə icazə verən şəbəkələrdə.** Ona arxalanmazdan əvvəl yoxlayın.
- UDP süzgəcdən keçəndə keçid edə biləsiniz deyə TCP variantı ilə yanaşı ikinci protokol kimi. Bizim [senzura bələdçisi](/bypass-censorship) süzgəclərin nəqliyyatı necə hədəf aldığını əhatə edir.

## Doppler Hysteria 2-dən istifadə edirmi?

Xeyr. Doppler UDP-ni bloklayan şəbəkələrdə də işləməyə davam edən, TCP üzərindən VLESS-Reality-dən istifadə edir. Baxın: [niyə VLESS](/vpn-protocols/why-vless).
