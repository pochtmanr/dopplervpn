#!/usr/bin/env node
/**
 * One-shot SEO honesty sync for homepage FAQ + speedComparison across all
 * message locales. Re-runnable; only rewrites the keys listed below.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "../messages");

const NO_LOGS = {
  en: "Yes for VPN traffic: we don't log browsing activity, DNS queries, traffic destinations, or session duration. Signing in leaves a short authentication record (including the API request IP), kept up to 90 days to stop abuse — it shows a device connected, never where you went. See our Privacy Policy for the full details.",
  ru: "Да для VPN-трафика: мы не логируем активность в интернете, DNS-запросы, назначения трафика и длительность сессий. Вход оставляет короткую запись аутентификации (включая IP API-запроса) до 90 дней против злоупотреблений — она показывает, что устройство подключилось, но не куда вы ходили. Подробности — в Политике конфиденциальности.",
  de: "Ja für VPN-Traffic: Wir protokollieren keine Surfaktivitäten, DNS-Abfragen, Traffic-Ziele oder Sitzungsdauern. Die Anmeldung hinterlässt einen kurzen Authentifizierungsdatensatz (inkl. API-Anfrage-IP), maximal 90 Tage zur Missbrauchsabwehr — er zeigt, dass ein Gerät verbunden war, nicht wohin. Details stehen in der Datenschutzerklärung.",
  zh: "就 VPN 流量而言可以：我们不记录浏览活动、DNS 查询、流量目的地或会话时长。登录会留下短暂的认证记录（含 API 请求 IP），最多保留 90 天用于防滥用——只说明有设备连接过，不会显示你访问了哪里。完整说明见隐私政策。",
  "zh-Hant": "就 VPN 流量而言可以：我們不記錄瀏覽活動、DNS 查詢、流量目的地或工作階段時長。登入會留下短暫的驗證紀錄（含 API 請求 IP），最多保留 90 天用於防濫用——只說明有裝置連線過，不會顯示你造訪了哪裡。完整說明見隱私權政策。",
  ar: "نعم بالنسبة لحركة VPN: لا نسجل نشاط التصفح أو استعلامات DNS أو وجهات الحركة أو مدة الجلسات. يترك تسجيل الدخول سجلاً قصيراً للمصادقة (يشمل عنوان IP لطلب واجهة البرمجة)، يُحفظ حتى 90 يوماً لمنع الإساءة — يوضح أن جهازاً اتصل، لا إلى أين ذهبت. التفاصيل في سياسة الخصوصية.",
  tr: "VPN trafiği için evet: gezinme etkinliğini, DNS sorgularını, trafik hedeflerini veya oturum sürelerini kaydetmiyoruz. Oturum açma, kötüye kullanımı önlemek için en fazla 90 gün saklanan kısa bir kimlik doğrulama kaydı bırakır (API istek IP’si dahil) — bir cihazın bağlandığını gösterir, nereye gittiğinizi değil. Ayrıntılar Gizlilik Politikası’nda.",
  fa: "برای ترافیک VPN بله: فعالیت مرور، پرس‌وجوهای DNS، مقصد ترافیک یا مدت نشست را ثبت نمی‌کنیم. ورود یک رکورد احراز هویت کوتاه (شامل IP درخواست API) می‌گذارد که تا ۹۰ روز برای جلوگیری از سوءاستفاده نگه داشته می‌شود — فقط نشان می‌دهد دستگاهی وصل شده، نه اینکه کجا رفته‌اید. جزئیات در سیاست حفظ حریم خصوصی.",
  es: "Sí para el tráfico VPN: no registramos actividad de navegación, consultas DNS, destinos del tráfico ni duración de sesión. El inicio de sesión deja un breve registro de autenticación (incluida la IP de la solicitud a la API), guardado hasta 90 días contra abusos: muestra que un dispositivo se conectó, no a dónde fue. Detalles en la Política de privacidad.",
  fr: "Oui pour le trafic VPN : nous n’enregistrons pas l’activité de navigation, les requêtes DNS, les destinations du trafic ni la durée des sessions. La connexion laisse un court enregistrement d’authentification (dont l’IP de la requête API), conservé jusqu’à 90 jours contre les abus — il montre qu’un appareil s’est connecté, pas où vous êtes allé. Détails dans la Politique de confidentialité.",
  pt: "Sim para o tráfego VPN: não registamos atividade de navegação, consultas DNS, destinos do tráfego nem duração da sessão. O início de sessão deixa um breve registo de autenticação (incluindo o IP do pedido à API), guardado até 90 dias contra abusos — mostra que um dispositivo ligou, não para onde foi. Detalhes na Política de privacidade.",
  it: "Sì per il traffico VPN: non registriamo attività di navigazione, query DNS, destinazioni del traffico o durata delle sessioni. L’accesso lascia un breve record di autenticazione (incluso l’IP della richiesta API), conservato fino a 90 giorni contro abusi — mostra che un dispositivo si è connesso, non dove sei andato. Dettagli nell’Informativa sulla privacy.",
  uk: "Так для VPN-трафіку: ми не логуємо активність у мережі, DNS-запити, призначення трафіку чи тривалість сесій. Вхід залишає короткий запис автентифікації (включно з IP API-запиту) до 90 днів проти зловживань — він показує, що пристрій підключився, але не куди ви ходили. Подробиці — у Політиці конфіденційності.",
  pl: "Tak dla ruchu VPN: nie logujemy aktywności przeglądania, zapytań DNS, celów ruchu ani czasu sesji. Logowanie zostawia krótki rekord uwierzytelnienia (w tym IP żądania API), przechowywany do 90 dni przeciw nadużyciom — pokazuje, że urządzenie się połączyło, nie dokąd poszło. Szczegóły w Polityce prywatności.",
  ja: "VPNトラフィックについてははい。閲覧活動、DNSクエリ、通信先、セッション時間は記録しません。サインインは不正防止のため最大90日保持する短い認証記録（APIリクエストのIPを含む）を残します。接続したことだけが分かり、どこへ行ったかは分かりません。詳細はプライバシーポリシーをご覧ください。",
  ko: "VPN 트래픽에 대해서는 그렇습니다. 브라우징 활동, DNS 쿼리, 트래픽 목적지, 세션 시간은 기록하지 않습니다. 로그인은 남용 방지를 위해 최대 90일 보관되는 짧은 인증 기록(API 요청 IP 포함)을 남깁니다. 기기가 연결됐다는 사실만 알 수 있고, 어디로 갔는지는 알 수 없습니다. 자세한 내용은 개인정보 처리방침을 보세요.",
};

const PLATFORMS = {
  en: "Doppler VPN is available on iOS (iPhone & iPad), Android, macOS, and Windows.",
  ru: "Doppler VPN доступен на iOS (iPhone и iPad), Android, macOS и Windows.",
  de: "Doppler VPN ist verfügbar für iOS (iPhone und iPad), Android, macOS und Windows.",
  zh: "Doppler VPN 支持 iOS（iPhone 和 iPad）、Android、macOS 和 Windows。",
  "zh-Hant": "Doppler VPN 支援 iOS（iPhone 與 iPad）、Android、macOS 與 Windows。",
  ar: "Doppler VPN متوفر على iOS (آيفون وآيباد) وAndroid وmacOS وWindows.",
  tr: "Doppler VPN; iOS (iPhone ve iPad), Android, macOS ve Windows’ta kullanılabilir.",
  fa: "Doppler VPN روی iOS (آیفون و آیپد)، Android، macOS و Windows در دسترس است.",
  es: "Doppler VPN está disponible en iOS (iPhone y iPad), Android, macOS y Windows.",
  fr: "Doppler VPN est disponible sur iOS (iPhone et iPad), Android, macOS et Windows.",
  pt: "O Doppler VPN está disponível em iOS (iPhone e iPad), Android, macOS e Windows.",
  it: "Doppler VPN è disponibile su iOS (iPhone e iPad), Android, macOS e Windows.",
  uk: "Doppler VPN доступний на iOS (iPhone та iPad), Android, macOS і Windows.",
  pl: "Doppler VPN jest dostępny na iOS (iPhone i iPad), Android, macOS i Windows.",
  ja: "Doppler VPNはiOS（iPhone・iPad）、Android、macOS、Windowsで利用できます。",
  ko: "Doppler VPN은 iOS(iPhone 및 iPad), Android, macOS, Windows에서 사용할 수 있습니다.",
  nl: "Doppler VPN is beschikbaar op iOS (iPhone & iPad), Android, macOS en Windows.",
  sv: "Doppler VPN finns för iOS (iPhone och iPad), Android, macOS och Windows.",
  nb: "Doppler VPN er tilgjengelig på iOS (iPhone og iPad), Android, macOS og Windows.",
  da: "Doppler VPN er tilgængelig på iOS (iPhone og iPad), Android, macOS og Windows.",
  fi: "Doppler VPN on saatavilla iOS:lle (iPhone ja iPad), Androidille, macOS:lle ja Windowsille.",
  cs: "Doppler VPN je dostupný na iOS (iPhone a iPad), Android, macOS a Windows.",
  sk: "Doppler VPN je dostupný na iOS (iPhone a iPad), Android, macOS a Windows.",
  hu: "A Doppler VPN elérhető iOS-en (iPhone és iPad), Androidon, macOS-en és Windowson.",
  ro: "Doppler VPN este disponibil pe iOS (iPhone și iPad), Android, macOS și Windows.",
  bg: "Doppler VPN е достъпен на iOS (iPhone и iPad), Android, macOS и Windows.",
  el: "Το Doppler VPN είναι διαθέσιμο σε iOS (iPhone και iPad), Android, macOS και Windows.",
  he: "Doppler VPN זמין ב‑iOS (iPhone ו‑iPad), Android, macOS ו‑Windows.",
  hi: "Doppler VPN iOS (iPhone और iPad), Android, macOS और Windows पर उपलब्ध है।",
  id: "Doppler VPN tersedia di iOS (iPhone & iPad), Android, macOS, dan Windows.",
  ms: "Doppler VPN tersedia pada iOS (iPhone & iPad), Android, macOS dan Windows.",
  vi: "Doppler VPN có trên iOS (iPhone & iPad), Android, macOS và Windows.",
  th: "Doppler VPN ใช้ได้บน iOS (iPhone และ iPad), Android, macOS และ Windows",
  tl: "Available ang Doppler VPN sa iOS (iPhone at iPad), Android, macOS, at Windows.",
  az: "Doppler VPN iOS (iPhone və iPad), Android, macOS və Windows-da əlçatandır.",
  bn: "Doppler VPN iOS (iPhone ও iPad), Android, macOS এবং Windows-এ পাওয়া যায়।",
  ca: "Doppler VPN està disponible a iOS (iPhone i iPad), Android, macOS i Windows.",
  et: "Doppler VPN on saadaval iOS-is (iPhone ja iPad), Androidis, macOS-is ja Windowsis.",
  hr: "Doppler VPN dostupan je na iOS-u (iPhone i iPad), Androidu, macOS-u i Windowsu.",
  lt: "Doppler VPN pasiekiamas iOS (iPhone ir iPad), Android, macOS ir Windows.",
  lv: "Doppler VPN ir pieejams iOS (iPhone un iPad), Android, macOS un Windows.",
  sl: "Doppler VPN je na voljo za iOS (iPhone in iPad), Android, macOS in Windows.",
  sw: "Doppler VPN inapatikana kwenye iOS (iPhone na iPad), Android, macOS na Windows.",
  ur: "Doppler VPN iOS (iPhone اور iPad)، Android، macOS اور Windows پر دستیاب ہے۔",
};

const METHODOLOGY_CTA = {
  en: "See our protocol ratings and sources",
  ru: "Смотреть рейтинги протоколов и источники",
  de: "Protokollbewertungen und Quellen ansehen",
  zh: "查看协议评分与来源",
  "zh-Hant": "查看協定評分與來源",
  ar: "اطّلع على تقييمات البروتوكولات والمصادر",
  tr: "Protokol puanlarını ve kaynakları gör",
  fa: "رتبه‌بندی پروتکل‌ها و منابع را ببینید",
  es: "Ver valoraciones de protocolos y fuentes",
  fr: "Voir les notes des protocoles et les sources",
  pt: "Ver classificações de protocolos e fontes",
  it: "Vedi le valutazioni dei protocolli e le fonti",
  uk: "Дивитися рейтинги протоколів і джерела",
  pl: "Zobacz oceny protokołów i źródła",
  ja: "プロトコル評価と出典を見る",
  ko: "프로토콜 평가와 출처 보기",
};

const SPEED_NOTE = {
  en: "Illustrative relative ordering from internal EU lab checks on a 100 Mbps baseline (March 2026)—not a third-party benchmark. Protocol ratings and sources:",
  ru: "Наглядное относительное сравнение по внутренним проверкам в ЕС на базе 100 Мбит/с (март 2026) — не сторонний бенчмарк. Рейтинги протоколов и источники:",
  de: "Veranschaulichende relative Einordnung aus internen EU-Labortests bei 100 Mbps (März 2026) — kein Drittanbieter-Benchmark. Protokollbewertungen und Quellen:",
  zh: "基于内部欧盟实验室在 100 Mbps 基线下的相对示意排序（2026 年 3 月）——非第三方基准测试。协议评分与来源：",
  "zh-Hant": "基於內部歐盟實驗室在 100 Mbps 基線下的相對示意排序（2026 年 3 月）——非第三方基準測試。協定評分與來源：",
  ar: "ترتيب نسبي توضيحي من فحوصات مختبر داخلية في الاتحاد الأوروبي على أساس 100 ميغابت/ث (مارس 2026)—وليس معياراً من طرف ثالث. تقييمات البروتوكولات والمصادر:",
};

const DETECTION = {
  en: { value: "Low", label: "DPI risk profile" },
  ru: { value: "Низк.", label: "Риск обнаружения DPI" },
  de: { value: "Niedrig", label: "DPI-Risikoprofil" },
  zh: { value: "低", label: "DPI 风险特征" },
  "zh-Hant": { value: "低", label: "DPI 風險特徵" },
  ar: { value: "منخفض", label: "ملف مخاطر DPI" },
};

const STICKY = {
  en: "Protect your browsing. Doppler VPN needs no registration. VPN traffic stays unlogged; a short auth record may be kept up to 90 days. Try free for 3 days on the App Store and Google Play.",
  ru: "Защитите свой трафик. Doppler VPN без регистрации. VPN-трафик не логируется; короткая запись аутентификации может храниться до 90 дней. 3 дня бесплатно в App Store и Google Play.",
  de: "Schütze dein Surfen. Doppler VPN ohne Registrierung. VPN-Traffic bleibt unprotokolliert; ein kurzer Auth-Eintrag kann bis zu 90 Tage bleiben. 3 Tage gratis im App Store und bei Google Play.",
};

const INLINE_SUB = {
  en: "3-day free trial on stores. No registration. VPN traffic unlogged.",
  ru: "3 дня бесплатно в магазинах. Без регистрации. VPN-трафик без логов.",
  de: "3 Tage gratis in den Stores. Keine Registrierung. VPN-Traffic ohne Logs.",
};

function pick(map, locale, fallback = "en") {
  return map[locale] ?? map[fallback];
}

function patchTrial(answer, locale, refundAnswer) {
  // Drop any trailing clause that still promises a blanket 30-day refund on every plan.
  const parts = answer
    .split(/(?<=[.!?。！？])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      if (!/30/.test(part)) return true;
      return !/(all plan|allen tarif|всем|всех тариф|جميع|所有|Tüm plan|todos los|todas as|tous les|tutti i|alle abonnement|wszystk|Minden csomag|на всі|Bütün plan|semua paket|semua pelan|모든 요금|すべてのプラン|para iade|geld-terug|pengene-tilbake|uang kembali|wang dikembalikan|pul qaytar|pénzvissza|返金保証|환불 보장|zwrotu pieniędzy|garanzia|garantía de devolución|Geld-zurück)/i.test(
        part,
      );
    });

  // Also strip a leftover English bridge from a prior partial patch.
  const cleaned = parts
    .filter((part) => !/^Refunds follow our Refund Policy\.?$/i.test(part))
    .join(" ")
    .replace(/\s+Refunds follow our Refund Policy\.?/gi, "")
    .trim();

  const bridge = {
    en: "Refunds follow our Refund Policy: EU/EEA and UK customers have a 14-day right to cancel; elsewhere the goodwill refund is 30 days on the first purchase only, and promotional purchases are excluded.",
    ru: "Условия возврата — в Политике возврата.",
    de: "Erstattungen richten sich nach unserer Rückerstattungsrichtlinie.",
    zh: "退款规则见退款政策。",
    "zh-Hant": "退款規則見退款政策。",
    ar: "تخضع عمليات الاسترداد لسياسة الاسترداد.",
    tr: "İadeler İade Politikamıza göredir.",
    es: "Los reembolsos siguen nuestra Política de reembolso.",
    fr: "Les remboursements suivent notre Politique de remboursement.",
    pt: "Os reembolsos seguem a nossa Política de reembolso.",
    it: "I rimborsi seguono la nostra Politica di rimborso.",
    uk: "Умови повернення — у Політиці повернення.",
    pl: "Zwroty reguluje nasza Polityka zwrotów.",
    ja: "返金は返金ポリシーに従います。",
    ko: "환불은 환불 정책을 따릅니다.",
    nl: "Terugbetalingen volgen ons Restitutiebeleid.",
    sv: "Återbetalningar följer vår Återbetalningspolicy.",
    nb: "Refusjoner følger vår refusjonspolicy.",
    da: "Refusioner følger vores refusionspolitik.",
    fi: "Hyvitykset noudattavat hyvityskäytäntöämme.",
    cs: "Vrácení peněz se řídí našimi zásadami pro refundace.",
    hu: "A visszatérítések a Visszatérítési szabályzatunk szerint történnek.",
    id: "Pengembalian dana mengikuti Kebijakan Pengembalian Dana kami.",
    ms: "Bayaran balik mengikut Dasar Bayaran Balik kami.",
    az: "Geri ödənişlər Geri ödəniş Siyasətimizə uyğundur.",
  };

  const tip = bridge[locale] ?? bridge.en;
  if (locale === "en" && refundAnswer) {
    return `${cleaned} ${tip}`.trim();
  }
  return `${cleaned} ${tip}`.trim();
}

let changed = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
  const locale = file.replace(/\.json$/, "");
  const path = join(DIR, file);
  const data = JSON.parse(readFileSync(path, "utf8"));

  data.faq.items.noLogs.answer = pick(NO_LOGS, locale);
  data.faq.items.platforms.answer = pick(PLATFORMS, locale);
  data.faq.items.trial.answer = patchTrial(
    data.faq.items.trial.answer,
    locale,
    data.faq.items.refund?.answer,
  );

  data.speedComparison.note = pick(SPEED_NOTE, locale);
  data.speedComparison.methodologyCta = pick(METHODOLOGY_CTA, locale);
  data.speedComparison.stats.detection = pick(DETECTION, locale);

  if (data.blog?.stickyBar) {
    data.blog.stickyBar.message = pick(STICKY, locale);
  }
  if (data.blog?.inlineCta) {
    data.blog.inlineCta.subtext = pick(INLINE_SUB, locale);
  }

  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  changed++;
}

console.log(`Patched ${changed} locale files`);
