> **De korte versie.** Shadowsocks is een lichte versleutelde proxy die in China is gebouwd om door de Great Firewall te komen. Jarenlang werkte het doordat het op niets leek. Sinds 2021 laat onderzoek zien dat de firewall precies dat soort verkeer blokkeert, omdat echt verkeer zelden zo willekeurig is.

## Wat is Shadowsocks?

Shadowsocks is een opensource-proxyprotocol dat voor het eerst uitkwam [in april 2012](https://en.wikipedia.org/wiki/Shadowsocks). Strikt genomen is het geen VPN: het is een proxy in de stijl van SOCKS5 met versleuteling, en apps bepalen welk verkeer erdoorheen gaat. In de praktijk bieden de meeste Shadowsocks-clients nu een systeembrede modus die zich als een VPN gedraagt.

Het is populair omdat het eenvoudig en snel is. De huidige versies gebruiken [AEAD-ciphers](https://shadowsocks.org/doc/aead.html), die vertrouwelijkheid, integriteit en authenticiteit in één stap bieden, en de [editie van 2022](https://shadowsocks.org/doc/sip022.html) van het protocol heeft de replaybescherming aangescherpt.

## Hoe werkt het?

Client en server delen een wachtwoord, dat wordt omgezet in een versleutelingssleutel. Alles wat de client stuurt, ook het adres van de gewenste website, is vanaf de allereerste byte versleuteld. Er is geen herkenbare handshake, geen certificaat en geen header in leesbare tekst. Voor een waarnemer is een Shadowsocks-verbinding een stroom willekeurig ogende bytes.

## Hoe detecteert de Great Firewall Shadowsocks?

Eerst via actieve probing. Onderzoekers van GFW Report [legden vast](https://gfw.report/publications/imc20/en/) dat de firewall tienduizenden probes naar verdachte Shadowsocks-servers stuurde, en echte verbindingen herhaalde en aanpaste om te zien hoe de server reageerde.

Daarna, vanaf november 2021, via een grovere en bredere methode. Een [studie op USENIX Security 2023](https://gfw.report/publications/usenixsecurity23/en/) vond dat de firewall "volledig versleuteld" verkeer in realtime blokkeert. De firewall kijkt naar het eerste pakket van een verbinding en stelt alles vrij dat op een bekend protocol lijkt of genoeg afdrukbare tekst bevat. Eén regel meet het gemiddelde aantal gezette bits per byte: waarden van 3.4 of lager, of van 4.6 of hoger, worden vrijgesteld, en willekeurig ogende data daartussen niet. Wat overblijft, kan worden geblokkeerd.

De onderzoekers zagen ook dat de firewall dit op ongeveer 26% van de verbindingen toepaste, en alleen op IP-bereiken van populaire datacenters, waarschijnlijk om nevenschade te beperken. De les voor ontwerpers van protocollen was duidelijk: willekeurig lijken is zelf een vingerafdruk.

## Wanneer gebruik je Shadowsocks?

- **Licht, snel proxyen** op netwerken die verkeer niet nauwkeurig inspecteren.
- **Zelf hosten** met hulpmiddelen zoals Outline, die de opzet eenvoudig maken.
- **Met zorg bij zware filtering.** In China en op andere plaatsen die volledig versleuteld verkeer blokkeren, is Shadowsocks veel minder betrouwbaar dan protocollen die echte TLS nabootsen, zoals [VLESS-Reality](/vpn-protocols/vless-reality). Onze [geschiedenis van censuurprotocollen](/blog/censorship-protocol-history) volgt hoe het vakgebied verderging.

## Gebruikt Doppler Shadowsocks?

Nee. Doppler gebruikt VLESS-Reality, om de redenen in [waarom VLESS](/vpn-protocols/why-vless).
