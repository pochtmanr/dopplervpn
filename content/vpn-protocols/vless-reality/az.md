> **Qısa xülasə.** VLESS Xray layihəsindən minimal proksi protokoludur. Reality elə TLS qatıdır ki, VLESS bağlantısını öz domeniniz və ya sertifikatınız olmadan real, populyar sayta adi TLS 1.3 girişi kimi göstərir. Birlikdə onlar hazırda senzorların bloklaması ən çətin olan kütləvi birləşmədir. Bu səhifə xülasədir; tam hekayə bizim [ətraflı bələdçidə](/how-it-works/vless-reality-tunnel)dir.

## VLESS nədir?

VLESS [2020-ci ilin iyulunda təklif edilib](https://github.com/v2ray/v2ray-core/issues/2636), [VMess](/vpn-protocols/vmess)-in daha yüngül davamçısı kimi. Onun [spesifikasiyası](https://xtls.github.io/en/development/protocols/vless.html) qəsdən kiçikdir: protokol versiyası, istifadəçini tanıdan 16 baytlıq UUID, istəyə bağlı əlavələr sahəsi və təyinatın əmri, portu və ünvanı. VLESS-in öz şifrələməsi yoxdur. O, altdakı TLS qatına arxalanır, ona görə trafik iki dəfə şifrələnmir.

VLESS [Xray-core](https://github.com/XTLS/Xray-core)-un hissəsidir. Bu layihə 2020-ci ilin noyabrında V2Ray-dən ayrılıb və indi bu protokol ailəsinin inkişafına rəhbərlik edir.

## Reality nə əlavə edir?

[Trojan](/vpn-protocols/trojan) kimi protokollar öz domeninizə gedən TLS-in içində gizlənir və həmin domen senzorun bloklaya biləcəyi şeyə çevrilir. [Reality](https://github.com/XTLS/REALITY), Xray-core-da [2023-cü ilin martında 1.8.0](https://github.com/XTLS/Xray-core/releases/tag/v1.8.0) ilə buraxılıb, bunu aradan qaldırır.

Reality serveri real üçüncü tərəf saytının TLS əl sıxmasını təqdim edir. Müşahidəçi üçün bağlantı həmin sayta normal TLS 1.3 girişidir. Serverin açarını bilən müştəri VLESS tunelinə buraxılır; senzorun aktiv zondu da daxil olmaqla qalan hər kəs real sayta ötürülür və onun əsl sertifikatını görür. Blok siyahısına salınacaq Doppler domeni və ya sertifikatı yoxdur.

## VLESS-Reality-ni bloklamaq nə qədər çətindir?

Bu, bildiyimiz ən davamlı kütləvi variantdır, lakin görünməz deyil. 2024-cü ildə dərc olunmuş tədqiqat [TLS içində daşınan TLS-in barmaq izinin çıxarıla bildiyini](https://www.usenix.org/conference/usenixsecurity24/presentation/xue-fingerprinting) zamanlama və paket ölçülərinə görə göstərib, 2025-ci ilin noyabrında isə istifadəçilər bəzi Rusiya internet provayderlərinin Reality bağlantılarını kəsdiyini [bildiriblər](https://github.com/net4people/bbs/issues/546). Provayderlər server ayarlarını və götürdükləri saytları tənzimləməklə cavab verir, pişik-siçan isə davam edir.

## O nə qədər sürətlidir?

Gündəlik istifadədə əlavə yük kiçikdir. VLESS başlığı hər bağlantıda bir dəfə göndərilir, XTLS Vision axını isə onsuz da şifrələnmiş veb trafikini ikinci dəfə şifrələməkdən yayınır. O, TCP üzərindən işlədiyi üçün VLESS-Reality itki olan şəbəkələrdə [WireGuard](/vpn-protocols/wireguard) kimi UDP protokollarından yavaş ola bilər, lakin onların bloklandığı yerdə işləməyə davam edir.

## Haradan daha çox öyrənə bilərəm?

- [VLESS-Reality tuneli, ətraflı](/how-it-works/vless-reality-tunnel): tarix, mexanizm, hədlər.
- Bloqumuzda [VLESS nədir?](/blog/what-is-vless) və [VLESS URI formatı](/blog/vless-uri-format).
- [VLESS VPN](/vless-vpn): Doppler VLESS-Reality-ni bir toxunuşla qoşulan tətbiqlərə necə yığır.
