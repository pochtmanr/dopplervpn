> **Qısa xülasə.** IKEv2/IPsec telefonunuzun və noutbukunuzun heç bir tətbiq olmadan artıq işlədə bildiyi VPN-dir. O, sürətlidir və Wi-Fi ilə mobil data arasında keçidi yaxşı idarə edir. Eyni zamanda sabit, hamıya məlum portlarda işləyir və bu, senzor üçün bloklamaq ən sadə protokollardan biridir.

## IKEv2/IPsec nədir?

"IKEv2" əslində birlikdə işləyən iki hissədir. IPsec IP paketlərini şifrələyən və autentifikasiya edən dəstdir. IKE, yəni Internet Key Exchange, iki tərəfin bir-birini autentifikasiya etmək və IPsec açarlarını razılaşdırmaq üçün istifadə etdiyi protokoldur. IKE-nin 2-ci versiyası [2005-ci ilin dekabrında](https://en.wikipedia.org/wiki/Internet_Key_Exchange) standartlaşdırılıb, hazırkı spesifikasiya isə [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296)-dır.

O, IETF standartı olduğu üçün IKEv2 iOS, macOS və Windows-a, Android-ə isə 11-ci versiyadan etibarən quraşdırılıb. Bir çox korporativ VPN şlüzü ondan istifadə edir.

## O necə işləyir?

Açar mübadiləsi UDP üzərindən, [adətən 500-cü portda](https://en.wikipedia.org/wiki/Internet_Key_Exchange) gedir. İki tərəf açarları razılaşdırdıqdan sonra əməliyyat sisteminin IPsec yığını trafikinizi Encapsulating Security Payload (ESP) ilə şifrələyir. Arada NAT router olanda, demək olar ki, hər ev və mobil şəbəkədə olduğu kimi, həm IKE, həm də ESP 4500-cü portda UDP-yə bükülür.

IKEv2-nin [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) adlı standart genişlənməsi var ki, bu da bağlantının IP ünvanının dəyişməsinə tab gətirməsinə imkan verir. IKEv2-nin telefonlarda rahat olmasının səbəbi budur: Wi-Fi zonasından çıxıb mobil dataya keçəndə tunel sıfırdan yenidən qoşulmaq əvəzinə davam edir.

## IKEv2-ni bloklamaq niyə asandır?

IKEv2 başqa bir şeyə bənzəməyə cəhd etmir. Onun trafiki hamıya məlum UDP portlarından istifadə edir və istənilən şəbəkə alətinin oxuya bildiyi standart IKE və ESP formatlarına malikdir. Onu bloklamaq üçün dərin paket yoxlaması belə lazım deyil: süzgəc 500 və 4500 UDP portlarını ata bilər və ya IKE mübadiləsini birbaşa tanıya bilər.

Korporativ şəbəkələr və açıq ölkələrdə səyahət üçün bu, ağlabatan güzəştdir: orada VPN kimi tanınmaq heç nəyə başa gəlmir. VPN-ləri məqsədli süzgəcdən keçirən şəbəkələrdə o, adətən ilk işləməyi dayandıran olur.

## IKEv2-dən nə vaxt istifadə etməli?

- **Tətbiqə icazə yoxdur.** Proqram quraşdıra bilmədiyiniz idarə olunan cihazda quraşdırılmış IKEv2 müştərisi yeganə variant ola bilər.
- **Açıq şəbəkələrdə mobil rouminq.** MOBIKE şəbəkələr arasında keçidi rəvan edir.
- **Senzura altında deyil.** Süzgəcdən keçirilən şəbəkələrdə adi trafikə qarışmaq üçün hazırlanmış protokol seçin, məsələn, [VLESS-Reality](/vpn-protocols/vless-reality). Bizim [senzura bələdçisi](/bypass-censorship) bloklamanın necə işlədiyini izah edir.

## Doppler IKEv2-dən istifadə edirmi?

Xeyr. Doppler öz tətbiqlərinin içində VLESS-Reality ilə qoşulur. Səbəblər [niyə VLESS](/vpn-protocols/why-vless) bələdçisindədir.
