> **Kort version.** AmneziaWG är en fork av WireGuard som behåller hastigheten och kryptografin men ändrar de paketformer och pakethuvuden som gör WireGuard lätt att känna igen. Det är ett starkt alternativ där vanligt WireGuard är blockerat, med en hake: det talar inte längre med vanliga WireGuard-servrar när obfuskeringen är på.

## Vad är AmneziaWG?

AmneziaWG utvecklas av teamet bakom [Amnezia VPN](https://amnezia.org/), en app med öppen källkod för att driva en egen VPN-server. Projektets [Go-implementation](https://github.com/amnezia-vpn/amneziawg-go) startade 2023. Det tar [WireGuard](/vpn-protocols/wireguard), som är snabbt och enkelt men har en fast, igenkännbar handskakning, och lägger till ett lager som förklär det.

## Vad ändrar det?

[AmneziaWG-dokumentationen](https://docs.amnezia.org/documentation/amnezia-wg/) beskriver flera mekanismer, var och en styrd av konfigurationsparametrar:

- **Dynamiska huvuden (H1–H4).** Vanliga WireGuard-paket börjar med en fast meddelandetyp för vart och ett av de fyra paketformaten. AmneziaWG ersätter de värdena med tal valda ur konfigurerade intervall, så att två olika uppsättningar inte delar pakethuvuden och ingen enskild filterregel träffar dem alla.
- **Slumpmässig paketlängd (S1–S4).** I WireGuard är det första handskakningspaketet alltid exakt 148 byte. AmneziaWG lägger till slumpmässiga prefix för varje pakettyp så att storlekarna varierar.
- **Skräppaket (Jc, Jmin, Jmax).** Före handskakningen skickar klienten ett konfigurerbart antal pseudoslumpmässiga paket av slumpmässig längd, vilket suddar ut sessionens början i både tid och storlek.
- **Skydd av huvudet.** Nyare versioner kan också kryptera själva fältet för meddelandetyp.

Under det ligger kryptografin och den övergripande konstruktionen kvar som WireGuards.

## Hur svårt är det att blockera AmneziaWG?

Det tar bort de enkla signaturer som filter använder mot WireGuard: fasta storlekar och fasta värden i huvudet. Det gör det betydligt mer motståndskraftigt än vanligt WireGuard i nät som blockerar VPN:er.

Det körs fortfarande över UDP, så nät som stryper eller blockerar UDP brett påverkar det, och trafiken imiterar inte något särskilt program på det sätt som [VLESS-Reality](/vpn-protocols/vless-reality) imiterar ett TLS-besök på en riktig webbplats. Ett filter som blockerar oigenkännlig UDP rakt av kan fortfarande fånga det.

## När ska du använda AmneziaWG?

- **Där WireGuard är blockerat** men UDP fortfarande fungerar, och du vill ha en hastighet i nivå med WireGuard.
- **Egna servrar**, med appen Amnezia VPN för att sätta upp dem.
- Behåll ett TCP-baserat alternativ, till exempel VLESS-Reality, för nät som filtrerar UDP. Vår [guide för Ryssland](/vpn-for-russia) tar upp vad som för närvarande tar sig igenom där.

## Använder Doppler AmneziaWG?

Nej. Doppler använder VLESS-Reality. Se [varför VLESS](/vpn-protocols/why-vless).
