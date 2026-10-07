> **Ve zkratce.** AmneziaWG je fork WireGuard, který si nechává jeho rychlost a kryptografii, ale mění tvar paketů a hlavičky, podle kterých se WireGuard snadno pozná. Je to silná volba tam, kde je prostý WireGuard zablokovaný, s jedním háčkem: se zapnutým maskováním už nemluví se standardními servery WireGuard.

## Co je AmneziaWG?

AmneziaWG vyvíjí tým za [Amnezia VPN](https://amnezia.org/), aplikací s otevřeným zdrojovým kódem pro provoz vlastního VPN serveru. [Implementace v Go](https://github.com/amnezia-vpn/amneziawg-go) tohoto projektu začala v roce 2023. Bere [WireGuard](/vpn-protocols/wireguard), který je rychlý a jednoduchý, ale má pevné, rozpoznatelné navázání spojení, a přidává vrstvu, která ho maskuje.

## Co mění?

[Dokumentace AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) popisuje několik mechanismů, každý řízený parametry konfigurace:

- **Dynamické hlavičky (H1–H4).** Standardní pakety WireGuard začínají pevným typem zprávy pro každý ze čtyř formátů paketů. AmneziaWG tato čísla nahrazuje hodnotami zvolenými z nastavených rozsahů, takže dvě různá nastavení nesdílejí hlavičky a jedno pravidlo filtru na všechny nestačí.
- **Náhodná délka paketů (S1–S4).** Ve WireGuard má úvodní paket navázání spojení vždy přesně 148 bajtů. AmneziaWG přidává ke každému typu paketu náhodné prefixy, takže se velikosti liší.
- **Odpadní pakety (Jc, Jmin, Jmax).** Před navázáním spojení klient odešle nastavitelný počet pseudonáhodných paketů náhodné délky, které rozostří začátek relace v čase i ve velikosti.
- **Ochrana hlaviček.** Novější verze umí také šifrovat samotné pole typu zprávy.

Uvnitř zůstávají kryptografie i celková stavba WireGuard.

## Jak těžké je AmneziaWG zablokovat?

Odstraňuje jednoduché signatury, které filtry používají proti WireGuard: pevné velikosti a pevné hodnoty hlaviček. Proto je v sítích, které VPN blokují, mnohem odolnější než prostý WireGuard.

Pořád běží po UDP, takže sítě, které UDP plošně omezují nebo blokují, se ho dotknou, a jeho provoz nenapodobuje žádnou konkrétní aplikaci tak, jak [VLESS-Reality](/vpn-protocols/vless-reality) napodobuje návštěvu TLS skutečného webu. Filtr, který neznámé UDP blokuje rovnou, ho pořád může chytit.

## Kdy použít AmneziaWG?

- **Tam, kde je WireGuard zablokovaný**, ale UDP pořád funguje a chcete rychlost podobnou WireGuard.
- **Vlastní servery**, nastavené aplikací Amnezia VPN.
- Mějte po ruce variantu na TCP, například VLESS-Reality, pro sítě, které filtrují UDP. Náš [průvodce pro Rusko](/vpn-for-russia) popisuje, co tam teď prochází.

## Používá Doppler AmneziaWG?

Ne. Doppler používá VLESS-Reality. Viz [proč VLESS](/vpn-protocols/why-vless).
