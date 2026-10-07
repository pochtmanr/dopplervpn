> **En resum.** AmneziaWG és una bifurcació de WireGuard que en conserva la velocitat i la criptografia, però canvia la forma dels paquets i les capçaleres que fan WireGuard fàcil de detectar. És una opció sòlida allà on el WireGuard tal qual està bloquejat, amb un límit: amb l'ofuscació activada ja no parla amb els servidors WireGuard estàndard.

## Què és AmneziaWG?

AmneziaWG el desenvolupa l'equip d'[Amnezia VPN](https://amnezia.org/), una aplicació de codi obert per fer funcionar el teu propi servidor VPN. La [implementació en Go](https://github.com/amnezia-vpn/amneziawg-go) del projecte es va començar el 2023. Agafa [WireGuard](/vpn-protocols/wireguard), que és ràpid i senzill però té un handshake fix i reconeixible, i hi afegeix una capa que el camufla.

## Què canvia?

La [documentació d'AmneziaWG](https://docs.amnezia.org/documentation/amnezia-wg/) descriu diversos mecanismes, cadascun controlat per paràmetres de configuració:

- **Capçaleres dinàmiques (H1–H4).** Els paquets estàndard de WireGuard comencen amb un tipus de missatge fix per a cadascun dels seus quatre formats de paquet. AmneziaWG substitueix aquests valors per nombres triats dins de rangs configurats, de manera que dues configuracions diferents no tenen les mateixes capçaleres i una sola regla de filtre no les encaixa totes.
- **Aleatorització de la longitud dels paquets (S1–S4).** A WireGuard, el paquet inicial del handshake fa sempre exactament 148 bytes. AmneziaWG afegeix prefixos aleatoris a cada tipus de paquet perquè les mides variïn.
- **Paquets brossa (Jc, Jmin, Jmax).** Abans del handshake, el client envia un nombre configurable de paquets pseudoaleatoris de longitud aleatòria, que difuminen l'inici de la sessió tant en el temps com en la mida.
- **Protecció de la capçalera.** Les versions més noves també poden xifrar el camp de tipus de missatge mateix.

Per sota, la criptografia i el disseny general continuen sent els de WireGuard.

## Com és de difícil bloquejar AmneziaWG?

Elimina les signatures senzilles que els filtres fan servir contra WireGuard: mides fixes i valors de capçalera fixos. Això el fa molt més resistent que el WireGuard tal qual a les xarxes que bloquegen les VPN.

Continua funcionant sobre UDP, de manera que les xarxes que alenteixen o bloquegen l'UDP de manera àmplia l'afecten, i el seu trànsit no imita cap aplicació concreta de la manera que [VLESS-Reality](/vpn-protocols/vless-reality) imita una visita TLS a un lloc web real. Un filtre que bloquegi directament l'UDP no reconeixible encara el pot enxampar.

## Quan has de fer servir AmneziaWG?

- **Allà on WireGuard està bloquejat** però l'UDP encara funciona, i vols una velocitat semblant a la de WireGuard.
- **Servidors propis**, amb l'aplicació Amnezia VPN per configurar-los.
- Tingues a mà una opció basada en TCP, com VLESS-Reality, per a les xarxes que filtren l'UDP. La nostra [guia per a Rússia](/vpn-for-russia) explica què hi funciona ara.

## Doppler fa servir AmneziaWG?

No. Doppler fa servir VLESS-Reality. Mira [per què VLESS](/vpn-protocols/why-vless).
