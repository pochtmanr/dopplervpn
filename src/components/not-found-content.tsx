import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

// Standalone, zero-dependency copy for the 404 page.
// Kept inline (not in messages/*.json) so the 404 renders even when
// next-intl's message resolution is unavailable — e.g. for locales
// outside `routing.locales` that hit this page via the root fallback.
type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  home: string;
  blog: string;
  missingTranslationTitle?: string;
  missingTranslationBody?: string;
  readInEnglish?: string;
};

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: "404",
    title: "Page not found",
    description:
      "The page you're looking for doesn't exist or has been moved.",
    home: "Back to home",
    blog: "Read our blog",
    missingTranslationTitle: "This article isn't available in your language yet",
    missingTranslationBody:
      "We haven't translated this post into your selected language. You can read the English version or browse other articles.",
    readInEnglish: "Read in English",
  },
  ru: {
    eyebrow: "404",
    title: "Страница не найдена",
    description:
      "Страница, которую вы ищете, не существует или была перемещена.",
    home: "На главную",
    blog: "Открыть блог",
    missingTranslationTitle: "Статья пока недоступна на вашем языке",
    missingTranslationBody:
      "Мы ещё не перевели этот пост на выбранный язык. Вы можете прочитать его на английском или посмотреть другие статьи.",
    readInEnglish: "Читать на английском",
  },
  es: {
    eyebrow: "404",
    title: "Página no encontrada",
    description:
      "La página que buscas no existe o ha sido movida.",
    home: "Volver al inicio",
    blog: "Leer el blog",
    missingTranslationTitle: "Este artículo aún no está disponible en tu idioma",
    missingTranslationBody:
      "Todavía no hemos traducido esta publicación a tu idioma. Puedes leer la versión en inglés o explorar otros artículos.",
    readInEnglish: "Leer en inglés",
  },
  pt: {
    eyebrow: "404",
    title: "Página não encontrada",
    description:
      "A página que você procura não existe ou foi movida.",
    home: "Voltar ao início",
    blog: "Ler o blog",
    missingTranslationTitle: "Este artigo ainda não está disponível no seu idioma",
    missingTranslationBody:
      "Ainda não traduzimos este post para o seu idioma. Você pode ler a versão em inglês ou navegar por outros artigos.",
    readInEnglish: "Ler em inglês",
  },
  fr: {
    eyebrow: "404",
    title: "Page introuvable",
    description:
      "La page que vous recherchez n'existe pas ou a été déplacée.",
    home: "Retour à l'accueil",
    blog: "Lire le blog",
    missingTranslationTitle: "Cet article n'est pas encore disponible dans votre langue",
    missingTranslationBody:
      "Nous n'avons pas encore traduit cet article dans votre langue. Vous pouvez lire la version anglaise ou parcourir d'autres articles.",
    readInEnglish: "Lire en anglais",
  },
  de: {
    eyebrow: "404",
    title: "Seite nicht gefunden",
    description:
      "Die gesuchte Seite existiert nicht oder wurde verschoben.",
    home: "Zur Startseite",
    blog: "Zum Blog",
    missingTranslationTitle: "Dieser Artikel ist in Ihrer Sprache noch nicht verfügbar",
    missingTranslationBody:
      "Wir haben diesen Beitrag noch nicht in Ihre Sprache übersetzt. Sie können die englische Version lesen oder andere Artikel entdecken.",
    readInEnglish: "Auf Englisch lesen",
  },
  zh: {
    eyebrow: "404",
    title: "页面未找到",
    description: "您查找的页面不存在或已被移动。",
    home: "返回首页",
    blog: "阅读博客",
    missingTranslationTitle: "这篇文章暂无您所选语言的版本",
    missingTranslationBody:
      "我们尚未将这篇文章翻译为您所选的语言。您可以阅读英文版或浏览其他文章。",
    readInEnglish: "阅读英文版",
  },
  ja: {
    eyebrow: "404",
    title: "ページが見つかりません",
    description: "お探しのページは存在しないか、移動されました。",
    home: "ホームへ戻る",
    blog: "ブログを読む",
    missingTranslationTitle: "この記事はお使いの言語ではまだご利用いただけません",
    missingTranslationBody:
      "この記事はまだお使いの言語に翻訳されていません。英語版をお読みいただくか、他の記事をご覧ください。",
    readInEnglish: "英語で読む",
  },
  ko: {
    eyebrow: "404",
    title: "페이지를 찾을 수 없습니다",
    description: "찾으시는 페이지가 존재하지 않거나 이동되었습니다.",
    home: "홈으로 돌아가기",
    blog: "블로그 읽기",
    missingTranslationTitle: "이 글은 아직 선택하신 언어로 제공되지 않습니다",
    missingTranslationBody:
      "이 게시물은 아직 선택하신 언어로 번역되지 않았습니다. 영어 버전을 읽거나 다른 글을 살펴보세요.",
    readInEnglish: "영어로 읽기",
  },
  ar: {
    eyebrow: "404",
    title: "الصفحة غير موجودة",
    description: "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
    home: "العودة إلى الرئيسية",
    blog: "قراءة المدونة",
    missingTranslationTitle: "هذه المقالة غير متوفرة بعد بلغتك",
    missingTranslationBody:
      "لم نقم بعد بترجمة هذه المقالة إلى لغتك. يمكنك قراءة النسخة الإنجليزية أو تصفح مقالات أخرى.",
    readInEnglish: "اقرأ بالإنجليزية",
  },
  he: {
    eyebrow: "404",
    title: "הדף לא נמצא",
    description: "הדף שאתה מחפש אינו קיים או הועבר.",
    home: "חזרה לדף הבית",
    blog: "לקריאת הבלוג",
    missingTranslationTitle: "המאמר הזה עדיין לא זמין בשפה שלך",
    missingTranslationBody:
      "עדיין לא תרגמנו את הפוסט הזה לשפה שבחרת. אפשר לקרוא את הגרסה באנגלית או לעיין במאמרים אחרים.",
    readInEnglish: "קרא באנגלית",
  },
  fa: {
    eyebrow: "404",
    title: "صفحه یافت نشد",
    description: "صفحه‌ای که دنبال آن هستید وجود ندارد یا جابجا شده است.",
    home: "بازگشت به خانه",
    blog: "خواندن وبلاگ",
    missingTranslationTitle: "این مقاله هنوز به زبان شما در دسترس نیست",
    missingTranslationBody:
      "ما هنوز این مطلب را به زبان انتخابی شما ترجمه نکرده‌ایم. می‌توانید نسخه انگلیسی را بخوانید یا مقالات دیگر را مرور کنید.",
    readInEnglish: "خواندن به انگلیسی",
  },
  tr: {
    eyebrow: "404",
    title: "Sayfa bulunamadı",
    description: "Aradığınız sayfa mevcut değil veya taşınmış.",
    home: "Ana sayfaya dön",
    blog: "Blogu oku",
    missingTranslationTitle: "Bu yazı henüz sizin dilinizde mevcut değil",
    missingTranslationBody:
      "Bu gönderiyi henüz seçtiğiniz dile çevirmedik. İngilizce sürümünü okuyabilir veya diğer yazılara göz atabilirsiniz.",
    readInEnglish: "İngilizce oku",
  },
  hi: {
    eyebrow: "404",
    title: "पेज नहीं मिला",
    description: "आप जो पेज खोज रहे हैं वह मौजूद नहीं है या हटा दिया गया है।",
    home: "होम पर लौटें",
    blog: "ब्लॉग पढ़ें",
    missingTranslationTitle: "यह लेख अभी आपकी भाषा में उपलब्ध नहीं है",
    missingTranslationBody:
      "हमने इस पोस्ट का अभी आपकी चुनी हुई भाषा में अनुवाद नहीं किया है। आप अंग्रेज़ी संस्करण पढ़ सकते हैं या अन्य लेख देख सकते हैं।",
    readInEnglish: "अंग्रेज़ी में पढ़ें",
  },
  id: {
    eyebrow: "404",
    title: "Halaman tidak ditemukan",
    description: "Halaman yang Anda cari tidak ada atau telah dipindahkan.",
    home: "Kembali ke beranda",
    blog: "Baca blog",
    missingTranslationTitle: "Artikel ini belum tersedia dalam bahasa Anda",
    missingTranslationBody:
      "Kami belum menerjemahkan postingan ini ke bahasa pilihan Anda. Anda bisa membaca versi bahasa Inggris atau menjelajahi artikel lain.",
    readInEnglish: "Baca dalam bahasa Inggris",
  },
  vi: {
    eyebrow: "404",
    title: "Không tìm thấy trang",
    description: "Trang bạn đang tìm không tồn tại hoặc đã được di chuyển.",
    home: "Về trang chủ",
    blog: "Đọc blog",
    missingTranslationTitle: "Bài viết này chưa có bản dịch cho ngôn ngữ của bạn",
    missingTranslationBody:
      "Chúng tôi chưa dịch bài viết này sang ngôn ngữ bạn chọn. Bạn có thể đọc bản tiếng Anh hoặc xem các bài viết khác.",
    readInEnglish: "Đọc bằng tiếng Anh",
  },
  uk: {
    eyebrow: "404",
    title: "Сторінку не знайдено",
    description: "Сторінка, яку ви шукаєте, не існує або була переміщена.",
    home: "На головну",
    blog: "Читати блог",
    missingTranslationTitle: "Цієї статті поки немає вашою мовою",
    missingTranslationBody:
      "Ми ще не переклали цей пост на обрану вами мову. Ви можете прочитати англійську версію або переглянути інші статті.",
    readInEnglish: "Читати англійською",
  },
  pl: {
    eyebrow: "404",
    title: "Nie znaleziono strony",
    description: "Strona, której szukasz, nie istnieje lub została przeniesiona.",
    home: "Powrót do strony głównej",
    blog: "Przeczytaj bloga",
    missingTranslationTitle: "Ten artykuł nie jest jeszcze dostępny w Twoim języku",
    missingTranslationBody:
      "Nie przetłumaczyliśmy jeszcze tego wpisu na wybrany język. Możesz przeczytać wersję angielską lub przejrzeć inne artykuły.",
    readInEnglish: "Przeczytaj po angielsku",
  },
  it: {
    eyebrow: "404",
    title: "Pagina non trovata",
    description: "La pagina che stai cercando non esiste o è stata spostata.",
    home: "Torna alla home",
    blog: "Leggi il blog",
    missingTranslationTitle: "Questo articolo non è ancora disponibile nella tua lingua",
    missingTranslationBody:
      "Non abbiamo ancora tradotto questo articolo nella lingua selezionata. Puoi leggere la versione inglese o sfogliare altri articoli.",
    readInEnglish: "Leggi in inglese",
  },
  nl: {
    eyebrow: "404",
    title: "Pagina niet gevonden",
    description: "De pagina die je zoekt bestaat niet of is verplaatst.",
    home: "Terug naar home",
    blog: "Lees de blog",
    missingTranslationTitle: "Dit artikel is nog niet beschikbaar in jouw taal",
    missingTranslationBody:
      "We hebben dit bericht nog niet vertaald naar je gekozen taal. Je kunt de Engelse versie lezen of andere artikelen bekijken.",
    readInEnglish: "Lees in het Engels",
  },
};

function getCopy(locale: string): Copy {
  return COPY[locale] ?? COPY.en;
}

type Variant = "generic" | "missing-translation";

interface NotFoundContentProps {
  locale: string;
  variant?: Variant;
  englishHref?: string;
}

export function NotFoundContent({
  locale,
  variant = "generic",
  englishHref,
}: NotFoundContentProps) {
  const copy = getCopy(locale);
  const isMissingTranslation = variant === "missing-translation";

  const title = isMissingTranslation
    ? copy.missingTranslationTitle ?? copy.title
    : copy.title;
  const description = isMissingTranslation
    ? copy.missingTranslationBody ?? copy.description
    : copy.description;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        <Section className="min-h-[70vh] flex items-center">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-7xl md:text-8xl font-semibold text-accent-gold mb-6 tracking-tight">
              {copy.eyebrow}
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-text-primary mb-4 leading-tight">
              {title}
            </h1>
            <p className="text-text-muted text-lg md:text-xl mb-10 max-w-xl mx-auto">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {isMissingTranslation && englishHref ? (
                <a
                  href={englishHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary bg-accent-gold text-bg-primary hover:bg-accent-gold/90 shadow-lg shadow-accent-gold/20 px-6 py-3 text-base"
                >
                  {copy.readInEnglish ?? "Read in English"}
                </a>
              ) : (
                <Button href="/" variant="primary">
                  {copy.home}
                </Button>
              )}
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary border-2 border-text-primary/20 text-text-primary hover:border-accent-gold hover:text-accent-gold bg-transparent px-6 py-3 text-base"
              >
                {copy.blog}
              </Link>
              {isMissingTranslation && (
                <Button href="/" variant="ghost">
                  {copy.home}
                </Button>
              )}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
