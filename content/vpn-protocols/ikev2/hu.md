> **Röviden.** Az IKEv2/IPsec az a VPN, amelyet a telefonod és a laptopod alkalmazás nélkül is tud használni. Gyors, és jól kezeli a Wi-Fi és a mobiladat közötti váltást. Rögzített, közismert portokon fut, ezért a cenzor számára az egyik legegyszerűbben blokkolható protokoll.

## Mi az IKEv2/IPsec?

Az „IKEv2” valójában két együtt dolgozó rész. Az IPsec az a készlet, amely titkosítja és hitelesíti az IP-csomagokat. Az IKE, az Internet Key Exchange, az a protokoll, amellyel a két fél hitelesíti egymást, és IPsec-kulcsokban egyezik meg. Az IKE 2-es verzióját [2005 decemberében](https://en.wikipedia.org/wiki/Internet_Key_Exchange) szabványosították, a jelenlegi specifikáció az [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Mivel IETF-szabvány, az IKEv2 be van építve az iOS-be, a macOS-be és a Windowsba, Androidon pedig a 11-es verzió óta. Sok vállalati VPN-átjáró használja.

## Hogyan működik?

A kulcscsere UDP-n megy, [általában az 500-as porton](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Amikor a két fél megegyezett a kulcsokban, az operációs rendszer IPsec-verme az Encapsulating Security Payload (ESP) segítségével titkosítja a forgalmadat. Ha NAT-router van útközben, mint szinte minden otthoni és mobilhálózaton, az IKE és az ESP is UDP-be kerül a 4500-as porton.

Az IKEv2-nek van egy [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) nevű szabványos kiterjesztése, amely lehetővé teszi, hogy a kapcsolat túlélje az IP-cím változását. Ezért kellemes az IKEv2 telefonon: kilépsz a Wi-Fi hatósugarából a mobiladatra, és az alagút megy tovább, ahelyett hogy elölről csatlakozna újra.

## Miért könnyű blokkolni az IKEv2-t?

Az IKEv2 meg sem próbál másnak látszani. A forgalma közismert UDP-portokat használ, és a szabványos IKE- és ESP-formátumokkal rendelkezik, amelyeket bármely hálózati eszköz értelmezni tud. A blokkolásához még mélycsomag-vizsgálat sem kell: a szűrő eldobhatja az 500-as és a 4500-as UDP-portot, vagy közvetlenül felismerheti az IKE-cserét.

Ez ésszerű kompromisszum vállalati hálózatokon és nyílt országokban utazva, ahol semmibe sem kerül, ha VPN-ként ismerik fel. Azokon a hálózatokon, amelyek szándékosan szűrik a VPN-eket, általában ez áll le elsőként.

## Mikor érdemes az IKEv2-t használni?

- **Ha nem telepíthetsz alkalmazást.** Felügyelt eszközön, ahol nem telepíthetsz szoftvert, a beépített IKEv2-kliens lehet az egyetlen lehetőség.
- **Mobilváltás nyílt hálózatokon.** A MOBIKE simává teszi, amikor hálózatok között mozogsz.
- **Nem cenzúra alatt.** Szűrt hálózatokon olyan protokollt válassz, amelyet arra terveztek, hogy beleolvadjon a forgalomba, például a [VLESS-Reality](/vpn-protocols/vless-reality). A [cenzúraútmutatónk](/bypass-censorship) elmagyarázza, hogyan működik a blokkolás.

## Használ-e a Doppler IKEv2-t?

Nem. A Doppler a saját alkalmazásaiban VLESS-Reality-vel csatlakozik. Az indokokért lásd: [miért a VLESS](/vpn-protocols/why-vless).
