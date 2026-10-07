> **Qısa xülasə.** WireGuard ən sürətli və ən sadə kütləvi VPN protokoludur, süzgəcsiz şəbəkədə isə əla seçimdir. Lakin o, VPN olduğunu gizlətmək üçün nəzərdə tutulmayıb və Rusiyada, İranda və Çində ilk bloklanan protokollar sırasındadır.

## WireGuard nədir?

WireGuard Jason A. Donenfeld tərəfindən yazılmış və ilk dəfə 2015-ci ildə buraxılmış VPN protokoludur. Məqsədi ondan əvvəlki böyük və çoxsaylı ayarları olan protokolları audit edilə biləcək qədər kiçik bir şeylə əvəz etmək idi. 2020-ci ilin martında o, [Linux 5.6 nüvəsinə daxil edildi](https://en.wikipedia.org/wiki/WireGuard), indi isə Windows, macOS, iOS, Android və Linux üçün rəsmi tətbiqlər mövcuddur.

WireGuard tərəflərə şifr dəstini razılaşdırmağa icazə vermək əvəzinə, müasir primitivlərdən ibarət bir dəsti sabit saxlayır. Onları [protokol səhifəsi](https://www.wireguard.com/protocol/) sadalayır: şifrələmə üçün Poly1305 ilə ChaCha20, açar mübadiləsi üçün Curve25519, heşləmə üçün BLAKE2s. Səhv konfiqurasiya ediləcək heç nə yoxdur, geri qayıdılacaq köhnə və daha zəif seçim də yoxdur.

## O necə işləyir?

Hər cihazın SSH-dakı kimi açar cütü var. Müştəri və server bir-birinin açıq açarlarını əvvəlcədən bilir, əl sıxma isə Noise protokol çərçivəsinə əsaslanır (protokol səhifəsi dəqiq konstruksiyanı göstərir: `Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s`). [Bütün paketlər UDP üzərindən göndərilir](https://www.wireguard.com/protocol/), yeni sessiya isə bir gediş-gəliş mübadiləsi ilə qurulur.

WireGuard-ın sürətli hiss olunmasının səbəbi bu quruluşdur. Razılaşdırılacaq şey azdır, Linux-da kod əməliyyat sisteminin nüvəsində işləyir, Wi-Fi ilə mobil data arasında keçid isə səssizcə həll olunur, çünki protokol uzunömürlü bağlantını açıq saxlamır.

## WireGuard niyə bloklanır?

WireGuard-ı audit etməyi asanlaşdıran eyni sadəlik onu tanımağı da asanlaşdırır. Onun [ağ kitabı](https://www.wireguard.com/papers/wireguard.pdf) əl sıxma mesajlarını bayt-bayt müəyyən edir, buna görə müştərinin ilk paketi həmişə 148 bayt, cavab isə həmişə 92 bayt olur və hər ikisi sabit mesaj növü sahəsi ilə başlayır. Dərin paket yoxlaması (DPI) sistemi bu şablonu UDP-də aşkar etmək üçün yalnız qısa bir qaydaya ehtiyac duyur.

Senzorlar məhz bunu ediblər. 2023-cü ilin avqustunda Rusiyadakı istifadəçilər iri mobil operatorların WireGuard sessiyalarını əl sıxmadan dərhal sonra kəsdiyini [bildirdilər](https://github.com/net4people/bbs/issues/274). Şifrələmə məzmunu yenə qoruyurdu, lakin bağlantının özü yox idi.

Bu, xəta deyil, dizayn güzəştidir. WireGuard-ın müəllifləri sabit, minimal protokol seçiblər, maskalanma isə məqsədlər sırasında olmayıb. [AmneziaWG](/vpn-protocols/amneziawg) kimi layihələr müəyyən örtük bərpa etmək üçün paketlərin formasını dəyişir.

## WireGuard-dan nə vaxt istifadə etməli?

- **Süzgəcsiz şəbəkələr.** Evdə, işdə və ya VPN-ləri bloklamayan ölkədə səyahət zamanı WireGuard-ı sürət və batareya ömrü baxımından ötmək çətindir.
- **Şəxsi server.** Öz serverinizi idarə edirsinizsə, WireGuard düzgün qurmaq üçün ən asan protokollardan biridir.
- **DPI süzgəci altında deyil.** Şəbəkəniz VPN-ləri bloklayırsa, adi veb trafikinə bənzəmək üçün hazırlanmış protokol, məsələn, [VLESS-Reality](/vpn-protocols/vless-reality) daha uyğundur. [VLESS-Reality və WireGuard](/blog/vless-reality-vs-wireguard) müqayisəmiz bu güzəşti daha ətraflı təsvir edir.

## Doppler WireGuard-dan istifadə edirmi?

Xeyr. Doppler tətbiqləri VLESS-Reality ilə qoşulur, çünki Doppler WireGuard-ın süzgəcdən keçirildiyi şəbəkələr üçün hazırlanıb. [Niyə VLESS](/vpn-protocols/why-vless) bələdçisi bunun səbəbini izah edir.
