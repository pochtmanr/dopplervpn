> **En bref.** IKEv2/IPsec est le VPN que votre téléphone et votre ordinateur portable savent déjà utiliser sans aucune application. Il est rapide et gère bien le passage du Wi-Fi aux données mobiles. Il fonctionne aussi sur des ports fixes et bien connus, ce qui en fait l'un des protocoles les plus simples à bloquer pour un censeur.

## Qu'est-ce qu'IKEv2/IPsec ?

« IKEv2 » désigne en réalité deux éléments qui travaillent ensemble. IPsec est la suite qui chiffre et authentifie les paquets IP. IKE, pour Internet Key Exchange, est le protocole que les deux parties utilisent pour s'authentifier mutuellement et convenir des clés IPsec. La version 2 d'IKE a été normalisée [en décembre 2005](https://en.wikipedia.org/wiki/Internet_Key_Exchange), et la spécification actuelle est la [RFC 7296](https://www.rfc-editor.org/rfc/rfc7296).

Comme il s'agit d'une norme de l'IETF, IKEv2 est intégré à iOS, macOS et Windows, et à Android depuis la version 11. De nombreuses passerelles VPN d'entreprise l'utilisent.

## Comment fonctionne-t-il ?

L'échange de clés se fait en UDP, [généralement sur le port 500](https://en.wikipedia.org/wiki/Internet_Key_Exchange). Une fois que les deux parties se sont accordées sur les clés, la pile IPsec du système d'exploitation chiffre votre trafic à l'aide de l'Encapsulating Security Payload (ESP). Lorsqu'un routeur NAT se trouve sur le chemin, comme sur presque tous les réseaux domestiques et mobiles, IKE et ESP sont tous deux encapsulés dans de l'UDP sur le port 4500.

IKEv2 dispose d'une extension standard appelée [MOBIKE](https://www.rfc-editor.org/rfc/rfc4555) qui permet à une connexion de survivre à un changement d'adresse IP. C'est pourquoi IKEv2 est agréable sur téléphone : vous quittez la portée du Wi-Fi pour passer aux données mobiles et le tunnel continue au lieu de se reconnecter à zéro.

## Pourquoi IKEv2 est-il facile à bloquer ?

IKEv2 ne cherche aucunement à ressembler à autre chose. Son trafic utilise des ports UDP bien connus et les formats IKE et ESP standard que n'importe quel outil réseau sait analyser. Le bloquer ne nécessite même pas d'inspection approfondie des paquets : un filtre peut simplement rejeter les ports UDP 500 et 4500, ou reconnaître directement l'échange IKE.

C'est un compromis raisonnable pour les réseaux d'entreprise et les voyages dans des pays ouverts, où être reconnu comme un VPN ne coûte rien. Sur les réseaux qui filtrent volontairement les VPN, c'est généralement la première chose qui cesse de fonctionner.

## Quand utiliser IKEv2 ?

- **Aucune application autorisée.** Sur un appareil géré où vous ne pouvez pas installer de logiciel, le client IKEv2 intégré peut être la seule option.
- **Itinérance mobile sur des réseaux ouverts.** MOBIKE rend la transition fluide lorsque vous changez de réseau.
- **Hors censure.** Sur les réseaux filtrés, choisissez un protocole conçu pour se fondre dans le trafic, comme [VLESS-Reality](/vpn-protocols/vless-reality). Notre [guide sur la censure](/bypass-censorship) explique comment fonctionne le blocage.

## Doppler utilise-t-il IKEv2 ?

Non. Doppler se connecte avec VLESS-Reality dans ses propres applications. Voir [pourquoi VLESS](/vpn-protocols/why-vless) pour les raisons.
