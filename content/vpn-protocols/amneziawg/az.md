> **Qısa xülasə.** AmneziaWG WireGuard-ın sürətini və kriptoqrafiyasını saxlayan, lakin WireGuard-ı tanımağı asanlaşdıran paket formalarını və başlıqları dəyişən forkdur. Adi WireGuard-ın bloklandığı yerdə o, güclü variantdır, bir şərtlə: maskalanma açıq olanda o, artıq standart WireGuard serverləri ilə danışmır.

## AmneziaWG nədir?

AmneziaWG-ni öz VPN serverinizi işə salmaq üçün açıq mənbəli tətbiq olan [Amnezia VPN](https://amnezia.org/)-in arxasındakı komanda hazırlayır. Layihənin [Go realizasiyası](https://github.com/amnezia-vpn/amneziawg-go) 2023-cü ildə başlanıb. O, sürətli və sadə, lakin sabit, tanınan əl sıxması olan [WireGuard](/vpn-protocols/wireguard)-ı götürür və onu maskalayan qat əlavə edir.

## O nəyi dəyişir?

[AmneziaWG sənədləri](https://docs.amnezia.org/documentation/amnezia-wg/) hər biri konfiqurasiya parametrləri ilə idarə olunan bir neçə mexanizmi təsvir edir:

- **Dinamik başlıqlar (H1–H4).** Standart WireGuard paketləri dörd paket formatının hər biri üçün sabit mesaj növü ilə başlayır. AmneziaWG bu qiymətləri konfiqurasiya edilmiş diapazonlardan seçilmiş ədədlərlə əvəz edir, ona görə iki fərqli quruluş başlıqları paylaşmır və heç bir tək süzgəc qaydası hamısına düşmür.
- **Paket uzunluğunun təsadüfiləşdirilməsi (S1–S4).** WireGuard-da ilkin əl sıxma paketi həmişə düz 148 baytdır. AmneziaWG hər paket növünə təsadüfi prefikslər əlavə edir ki, ölçülər dəyişsin.
- **Zibil paketlər (Jc, Jmin, Jmax).** Əl sıxmadan əvvəl müştəri təsadüfi uzunluqda konfiqurasiya edilə bilən sayda psevdotəsadüfi paket göndərir və bunlar sessiyanın başlanğıcını həm zamanda, həm də ölçüdə bulandırır.
- **Başlıq qorunması.** Daha yeni versiyalar mesaj növü sahəsinin özünü də şifrələyə bilər.

Altında kriptoqrafiya və ümumi dizayn WireGuard-ınkı olaraq qalır.

## AmneziaWG-ni bloklamaq nə qədər çətindir?

O, süzgəclərin WireGuard-a qarşı istifadə etdiyi sadə siqnaturları aradan qaldırır: sabit ölçülər və sabit başlıq qiymətləri. Bu, VPN-ləri bloklayan şəbəkələrdə onu adi WireGuard-dan xeyli daha davamlı edir.

O, yenə də UDP üzərində işləyir, ona görə UDP-ni geniş şəkildə məhdudlaşdıran və ya bloklayan şəbəkələr ona təsir edəcək və onun trafiki [VLESS-Reality](/vpn-protocols/vless-reality)-nin real sayta TLS girişini təqlid etdiyi kimi konkret bir tətbiqi təqlid etmir. Tanınmayan UDP-ni birbaşa bloklayan süzgəc onu yenə də tuta bilər.

## AmneziaWG-dan nə vaxt istifadə etməli?

- **WireGuard-ın bloklandığı yerdə**, UDP hələ işləyəndə və WireGuard-a bənzər sürət istəyəndə.
- **Öz serverlərinizdə**, onları qurmaq üçün Amnezia VPN tətbiqindən istifadə etməklə.
- UDP-ni süzgəcdən keçirən şəbəkələr üçün VLESS-Reality kimi TCP əsaslı variant saxlayın. Bizim [Rusiya üçün bələdçi](/vpn-for-russia) hazırda orada nəyin keçdiyini əhatə edir.

## Doppler AmneziaWG-dən istifadə edirmi?

Xeyr. Doppler VLESS-Reality-dən istifadə edir. Baxın: [niyə VLESS](/vpn-protocols/why-vless).
