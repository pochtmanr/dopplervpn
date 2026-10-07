> **Qısa xülasə.** OpenVPN açıq mənbəli VPN-lərin veteranıdır: çevik, geniş dəstəklənən və iyirmi ildən çox müddətdə yaxşı öyrənilmişdir. Eyni zamanda o, yeni protokollardan yavaşdır və dərc olunmuş tədqiqatlara görə, internet provayderinin barmaq izini çıxarması ən asan olan protokollardan biridir.

## OpenVPN nədir?

OpenVPN pulsuz, açıq mənbəli VPN proqramıdır və ilk dəfə James Yonan tərəfindən [2001-ci ilin mayında](https://en.wikipedia.org/wiki/OpenVPN) buraxılmışdır. 2000-ci və 2010-cu illərin böyük hissəsində o, kommersiya VPN xidmətləri və korporativ uzaqdan giriş üçün standart seçim idi və hələ də bir çox router və korporativ məhsulda mövcuddur.

O, əməliyyat sisteminin nüvəsində deyil, istifadəçi məkanında işləyir və açar mübadiləsi üçün OpenSSL kitabxanasına və TLS protokoluna əsaslanır. IANA tərəfindən təyin edilmiş port 1194-dür, lakin OpenVPN demək olar ki, istənilən portda UDP və ya TCP üzərindən işləyə bilər.

## O necə işləyir?

OpenVPN iki hissədən ibarət xüsusi protokoldan istifadə edir. İdarəetmə kanalı iki tərəfi, adətən sertifikatlarla, autentifikasiya etmək və açarları razılaşdırmaq üçün TLS-dən istifadə edir. Sonra verilənlər kanalı trafikinizi həmin açarlarla şifrələyərək UDP və ya TCP paketləri daxilində daşıyır.

Bu quruluş OpenVPN-i çox konfiqurasiya edilə bilən edir. Şifrləri, autentifikasiya üsullarını, portları və nəqliyyat protokollarını seçə, onu proksilər vasitəsilə işlədə bilərsiniz. Bu çevikliyin bahası mürəkkəblikdir: daha çox kod, daha çox ayar və zəif konfiqurasiya ilə nəticələnmək üçün daha çox yol.

## OpenVPN niyə bloklanır?

OpenVPN-in içindəki TLS saytın HTTPS ilə açılması ilə eyni deyil. OpenVPN öz TLS əl sıxmasını özünün paket çərçivələməsinə bürüyür, buna görə onun trafikinin adi veb trafikində olmayan bir forması var.

Tədqiqatçılar bunun nə qədər əhəmiyyətli olduğunu ölçüblər. Miçiqan Universitetindən və digərlərindən bir qrup [barmaq izi sistemi qurdu](https://www.usenix.org/conference/usenixsecurity22/presentation/xue-diwen) və onu təxminən bir milyon istifadəçiyə xidmət göstərən internet provayderinin daxilində işlətdi. Sistem **OpenVPN axınlarının 85%-dən çoxunu** çox az yanlış müsbət nəticə ilə müəyyən etdi, həmçinin sınaqdan keçirdikləri kommersiya "obfuskasiya olunmuş" OpenVPN quraşdırmalarının əksəriyyətini də tutdu.

Real dünyadakı süzgəcləmə tədqiqatlara uyğundur. 2023-cü ilin avqustunda Rusiyadakı istifadəçilər mobil operatorların OpenVPN bağlantılarını başladıqdan qısa müddət sonra kəsdiyini [bildirdilər](https://github.com/net4people/bbs/issues/274).

## OpenVPN-dən nə vaxt istifadə etməli?

- **Uyğunluq.** Köhnə routerlər, korporativ şlüzlər və bəzi korporativ şəbəkələr OpenVPN-i dəstəkləyir və ondan yeni heç nəyi dəstəkləmir.
- **Yalnız TCP olan şəbəkələr.** UDP bloklandıqda OpenVPN TCP üzərindən işləyə bilər, [WireGuard](/vpn-protocols/wireguard) isə köməksiz bunu bacarmır.
- **Süzgəcdən keçirilən şəbəkələrdə deyil.** VPN-lərin bloklandığı yerlərdə OpenVPN tez sıradan çıxır. [VLESS-Reality](/vpn-protocols/vless-reality) kimi adi veb trafikini təqlid edən protokol daha yaxşı vasitədir. Bizim [senzura bələdçisi](/bypass-censorship) süzgəcləmə sistemlərinin nəyi kəsəcəyinə necə qərar verdiyini izah edir.

## Doppler OpenVPN-dən istifadə edirmi?

Xeyr. Doppler bütün platformalarda VLESS-Reality-dən istifadə edir. [Niyə VLESS](/vpn-protocols/why-vless) bələdçisi onu necə seçdiyimizi izah edir.
