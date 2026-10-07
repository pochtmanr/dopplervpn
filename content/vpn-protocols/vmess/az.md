> **Qısa xülasə.** VMess V2Ray layihəsinin ilk protokoludur. O, öz başlıqlarını şifrələyir və adətən veb trafikə bənzəmək üçün başqa nəqliyyata, məsələn, TLS üzərindən WebSocket-ə bükülür. O, hələ də işləyir, lakin davamçıları olan VLESS və Trojan eyni işi daha az əlavə yüklə görür.

## VMess nədir?

VMess [V2Ray layihəsinin](https://github.com/v2fly/v2ray-core) 2015-ci ildə başlayanda təqdim etdiyi şifrəli proksi protokoludur. V2Ray proksi qurmaq üçün modulyar platformaya çevrildi: bir nüvə, çoxlu protokol və nəqliyyat, trafikin hara gedəcəyinə qərar verən marşrutlaşdırma mühərriki. VMess onun ilk protokolu idi və bir neçə il əsas protokolu olaraq qaldı.

Shadowsocks kimi VMess də texniki cəhətdən VPN yox, proksidir, lakin V2Ray əsaslı tətbiqlər bütün cihazınızı ondan keçirə bilər.

## O necə işləyir?

Hər istifadəçinin etimadnamə rolunu oynayan UUID-i var. [Protokol sənədlərinə](https://www.v2fly.org/en_US/developer/protocols/vmess.html) görə, müştərinin sorğu başlığına Unix vaxt damğasından, təsadüfi ədəddən və yoxlama cəmindən qurulan, istifadəçinin ID-sindən əldə edilmiş açarla şifrələnmiş autentifikasiya identifikatoru daxildir. Server istifadəçini tanımaq üçün ondan istifadə edir, sonra başlığın qalanını və verilənləri deşifrə edir.

Sənədlər başlığı qorumağın iki yolunu təsvir edir. Müasir yol başlığın dəyişdirilmədiyini təmin edən AEAD şifrələməsindən istifadə edir. Köhnə yol MD5 və AES-128-CFB istifadə edirdi və başlığın bütövlüyünü təmin edə bilmirdi; sənədlər bundan çəkindirir. Autentifikasiya identifikatoruna vaxt damğası daxil olduğu üçün müştəri və server saatları təxminən sinxron olmalıdır və bu, "sadəcə qoşulmur" problemlərinin tez-tez rast gəlinən səbəbidir.

## VMess-i bloklamaq nə qədər çətindir?

Tək başına VMess təsadüfi baytlara bənzəyir və bu, onu [Shadowsocks](/vpn-protocols/shadowsocks) ilə eyni vəziyyətə salır: tam şifrələnmiş trafiki bloklayan firewall-lara açıq qalır. Buna görə VMess adətən domen və sertifikat arxasında, TLS üzərindən WebSocket və ya gRPC içində yerləşdirilir ki, müşahidəçi sayta adi HTTPS bağlantısı kimi görünən bir şey görsün.

Trafiki gizlətməyin əsas işini bu örtük görür və bunun qiyməti var: domen, sertifikat və tez-tez serverin qarşısında CDN lazımdır, server isə verilənləri iki dəfə şifrələyir, bir dəfə TLS üçün və bir dəfə VMess üçün.

## VMess, VLESS, yoxsa Trojan?

[VLESS](/vpn-protocols/vless-reality) Xray layihəsi tərəfindən daha yüngül davamçı kimi hazırlanıb: UUID əsaslı kimliyi saxlayır, lakin VMess-in öz şifrələməsini atır və tamamilə TLS qatına arxalanır, bu da ikiqat şifrələmənin qarşısını alır. [Trojan](/vpn-protocols/trojan) UUID əvəzinə parolla oxşar yanaşma tətbiq edir. Bizim [VLESS, VMess və Trojan](/blog/vless-vs-vmess-vs-trojan) müqayisəmiz təfərrüatlara girir.

## Doppler VMess-dən istifadə edirmi?

Xeyr. Doppler Reality ilə VLESS-dən istifadə edir. [Niyə VLESS](/vpn-protocols/why-vless) bələdçisi səbəbi izah edir.
