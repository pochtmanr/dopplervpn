> **Pe scurt.** Shadowsocks este un proxy criptat și ușor, făcut în China ca să treacă de Marele Firewall. Ani de zile a funcționat pentru că nu arăta ca nimic. Din 2021, cercetarea arată că firewall-ul blochează exact acest fel de trafic, pentru că traficul real este rareori atât de aleatoriu.

## Ce este Shadowsocks?

Shadowsocks este un protocol proxy open-source, lansat pentru prima dată [în aprilie 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strict vorbind, nu este un VPN: este un proxy de tip SOCKS5, cu criptare, iar aplicațiile decid ce trafic trimit prin el. În practică, majoritatea clienților Shadowsocks oferă acum un mod la nivelul întregului sistem, care se comportă ca un VPN.

Este popular pentru că este simplu și rapid. Versiunile actuale folosesc [cifruri AEAD](https://shadowsocks.org/doc/aead.html), care oferă confidențialitate, integritate și autenticitate dintr-un singur pas, iar [ediția 2022](https://shadowsocks.org/doc/sip022.html) a protocolului a întărit protecția împotriva reluării.

## Cum funcționează?

Clientul și serverul împart o parolă, care este transformată într-o cheie de criptare. Tot ce trimite clientul, inclusiv adresa site-ului pe care îl vrea, este criptat încă de la primul octet. Nu există un handshake recognoscibil, nici certificat, nici antet în clar. Pentru un observator, o conexiune Shadowsocks este un flux de octeți cu aspect aleatoriu.

## Cum detectează Marele Firewall Shadowsocks?

Mai întâi, prin sondare activă. Cercetători de la GFW Report [au înregistrat](https://gfw.report/publications/imc20/en/) firewall-ul trimițând zeci de mii de sonde către servere Shadowsocks bănuite, reluând și modificând conexiuni reale ca să vadă cum reacționa serverul.

Apoi, din noiembrie 2021, printr-o metodă mai brută și mai largă. Un [studiu USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) a constatat că firewall-ul blochează în timp real traficul „complet criptat”. Se uită la primul pachet al unei conexiuni și lasă să treacă orice arată ca un protocol cunoscut sau conține destul text imprimabil. O regulă măsoară numărul mediu de biți setați pe octet: valorile de cel mult 3.4, sau de cel puțin 4.6, sunt lăsate să treacă, iar datele cu aspect aleatoriu dintre ele nu. Ce rămâne poate fi blocat.

Cercetătorii au mai constatat că firewall-ul aplica asta la aproximativ 26% din conexiuni și doar la intervale IP ale centrelor de date populare, probabil ca să limiteze daunele colaterale. Lecția pentru cei care proiectează protocoale a fost clară: a arăta aleatoriu este, în sine, o amprentă.

## Când să folosești Shadowsocks?

- **Proxy ușor și rapid**, în rețele care nu inspectează traficul îndeaproape.
- **Găzduire proprie**, cu unelte precum Outline, care fac configurarea directă.
- **Cu grijă, sub filtrare puternică.** În China și în alte locuri care blochează traficul complet criptat, Shadowsocks este mult mai puțin fiabil decât protocoalele care imită TLS real, cum este [VLESS-Reality](/vpn-protocols/vless-reality). A noastră [istorie a protocoalelor de cenzură](/blog/censorship-protocol-history) urmărește cum a mers domeniul mai departe.

## Folosește Doppler Shadowsocks?

Nu. Doppler folosește VLESS-Reality, din motivele din [de ce VLESS](/vpn-protocols/why-vless).
