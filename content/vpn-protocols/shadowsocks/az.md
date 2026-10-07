> **Qısa xülasə.** Shadowsocks Çində Böyük Firewall-dan keçmək üçün hazırlanmış yüngül şifrəli proksidir. İllərlə o, heç nəyə bənzəmədiyi üçün işləyirdi. 2021-ci ildən tədqiqatlar göstərir ki, firewall məhz bu cür trafiki bloklayır, çünki real trafik nadir hallarda bu qədər təsadüfi olur.

## Shadowsocks nədir?

Shadowsocks ilk dəfə [2012-ci ilin aprelində](https://en.wikipedia.org/wiki/Shadowsocks) buraxılmış açıq mənbəli proksi protokoludur. Dəqiq desək, o, VPN deyil: şifrələməli SOCKS5 tipli proksidir və hansı trafikin ondan keçəcəyinə tətbiqlər qərar verir. Praktikada əksər Shadowsocks müştəriləri indi VPN kimi davranan sistem miqyasında rejim təklif edir.

O, sadə və sürətli olduğu üçün populyardır. Hazırkı versiyalar məxfiliyi, bütövlüyü və həqiqiliyi bir addımda təmin edən [AEAD şifrlərindən](https://shadowsocks.org/doc/aead.html) istifadə edir, protokolun [2022-ci il buraxılışı](https://shadowsocks.org/doc/sip022.html) isə təkrar oynatmaya qarşı qorumanı sərtləşdirib.

## O necə işləyir?

Müştəri və server ortaq parolu paylaşır və bu parol şifrələmə açarına çevrilir. Müştərinin göndərdiyi hər şey, o cümlədən getmək istədiyi saytın ünvanı, ilk baytdan şifrələnir. Tanınan əl sıxma, sertifikat və açıq mətn başlığı yoxdur. Müşahidəçi üçün Shadowsocks bağlantısı təsadüfi görünən bayt axınıdır.

## Böyük Firewall Shadowsocks-u necə aşkar edir?

Əvvəlcə aktiv zondlama ilə. GFW Report tədqiqatçıları firewall-un şübhəli Shadowsocks serverlərinə on minlərlə zond göndərdiyini, serverin reaksiyasına baxmaq üçün real bağlantıları təkrar oynadıb dəyişdirdiyini [qeydə alıblar](https://gfw.report/publications/imc20/en/).

Sonra, 2021-ci ilin noyabrından, daha kobud və daha geniş üsulla. [USENIX Security 2023 tədqiqatı](https://gfw.report/publications/usenixsecurity23/en/) firewall-un "tam şifrələnmiş" trafiki real vaxtda blokladığını müəyyən edib. O, bağlantının ilk paketinə baxır və məlum protokola bənzəyən və ya kifayət qədər çap edilə bilən mətn olan hər şeyi istisna edir. Qaydalardan biri hər baytda vahid bitlərin orta sayını ölçür: 3.4 və ya ondan aşağı, yaxud 4.6 və ya ondan yuxarı qiymətlər istisna olunur, aradakı təsadüfi görünən verilənlər isə yox. Qalanı bloklana bilər.

Tədqiqatçılar həmçinin firewall-un bunu bağlantıların təxminən 26%-inə və yalnız populyar məlumat mərkəzlərinin IP diapazonlarına tətbiq etdiyini müəyyən ediblər, yəqin ki, dolayı zərəri məhdudlaşdırmaq üçün. Protokolu hazırlayanlar üçün dərs aydın idi: təsadüfi görünmək özü də barmaq izidir.

## Shadowsocks-dan nə vaxt istifadə etməli?

- **Yüngül, sürətli proksiləmə** trafiki yaxından yoxlamayan şəbəkələrdə.
- **Öz server** üçün Outline kimi quraşdırmanı sadə edən alətlərlə.
- **Sərt süzgəc altında ehtiyatla.** Tam şifrələnmiş trafiki bloklayan Çində və başqa yerlərdə Shadowsocks real TLS-i təqlid edən protokollardan, məsələn, [VLESS-Reality](/vpn-protocols/vless-reality)-dən xeyli az etibarlıdır. Bizim [senzura protokollarının tarixi](/blog/censorship-protocol-history) bu sahənin necə irəlilədiyini izləyir.

## Doppler Shadowsocks-dan istifadə edirmi?

Xeyr. Doppler VLESS-Reality-dən istifadə edir; səbəblər [niyə VLESS](/vpn-protocols/why-vless) bələdçisindədir.
