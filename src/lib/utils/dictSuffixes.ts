export const DICT_SUFFIXES = [
  { locale: "de", language: "deutsch", emoji: "🇩🇪", badgeColor: "purple" },
  {
    locale: "de-en",
    language: "deutsch - english",
    emoji: "🇩🇪🇬🇧",
    badgeColor: "purple",
  },
  {
    locale: "en-de",
    language: "english - deutsch",
    emoji: "🇬🇧🇩🇪",
    badgeColor: "purple",
  },
  { locale: "en", language: "english", emoji: "🇺🇸", badgeColor: "blue" },
  {
    locale: "en-es",
    language: "english - español",
    emoji: "🇺🇸🇪🇸",
    badgeColor: "yellow",
  },
  {
    locale: "en-fr",
    language: "english - français",
    emoji: "🇺🇸🇫🇷",
    badgeColor: "teal",
  },
  {
    locale: "en-it",
    language: "english - italiano",
    emoji: "🇺🇸🇮🇹",
    badgeColor: "red",
  },
  {
    locale: "en-ja",
    language: "english - 日本語（ジーニアス）",
    emoji: "🇺🇸🇯🇵",
    badgeColor: "pink",
  },
  {
    locale: "en-nl",
    language: "english - nederlands",
    emoji: "🇺🇸🇳🇱",
    badgeColor: "orange",
  },
  {
    locale: "en-pt",
    language: "english - português",
    emoji: "🇺🇸🇵🇹",
    badgeColor: "green",
  },
  {
    locale: "en-tr",
    language: "english - türkçe",
    emoji: "🇺🇸🇹🇷",
    badgeColor: "red",
  },
  {
    locale: "es-en",
    language: "español - english",
    emoji: "🇪🇸🇬🇧",
    badgeColor: "yellow",
  },
  { locale: "es", language: "español", emoji: "🇪🇸", badgeColor: "yellow" },
  {
    locale: "fr-en",
    language: "français - english",
    emoji: "🇫🇷🇬🇧",
    badgeColor: "teal",
  },
  { locale: "fr", language: "français", emoji: "🇫🇷", badgeColor: "teal" },
  {
    locale: "fr-nl",
    language: "français - nederlands",
    emoji: "🇫🇷🇳🇱",
    badgeColor: "orange",
  },
  {
    locale: "it-en",
    language: "italiano - english",
    emoji: "🇮🇹🇬🇧",
    badgeColor: "red",
  },
  { locale: "it", language: "italiano", emoji: "🇮🇹", badgeColor: "red" },
  { locale: "jaxxdjs", language: "日本語", emoji: "🇯🇵", badgeColor: "pink" },
  { locale: "nl", language: "nederlands", emoji: "🇳🇱", badgeColor: "orange" },
  {
    locale: "nl-en",
    language: "nederlands - english",
    emoji: "🇳🇱🇬🇧",
    badgeColor: "orange",
  },
  {
    locale: "nl-fr",
    language: "nederlands - français",
    emoji: "🇳🇱🇫🇷",
    badgeColor: "orange",
  },
  {
    locale: "pt-en",
    language: "português - english",
    emoji: "🇵🇹🇬🇧",
    badgeColor: "green",
  },
  { locale: "pt", language: "português", emoji: "🇵🇹", badgeColor: "green" },
  { locale: "sv", language: "svenska", emoji: "🇸🇪", badgeColor: "cyan" },
] as const;

export const dictSuffixLocales = DICT_SUFFIXES.map((s) => s.locale);

export const getDictSuffix = (suffix: string) => {
  return DICT_SUFFIXES.find((s) => s.locale === suffix);
};

export type DictSuffix = (typeof DICT_SUFFIXES)[number];
