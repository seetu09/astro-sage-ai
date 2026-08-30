/**
 * Tarot Localization Dictionary
 * -----------------------------
 * Hindi translations for the 22 Major Arcana names + the upright/reversed
 * meanings of all 78 cards in `lib/tarot-data.ts`.
 *
 * Minor-arcana card *names* (e.g. "Three of Cups") are kept in their universal
 * English form — that is the standard convention across Indian tarot readers and
 * translating the suit names would invent non-recognizable terminology — while
 * their *meanings* are fully translated to Hindi.
 */
import type { Language } from "@/lib/i18n";

export type TarotLocale = Language;

/** Major Arcana English name → Hindi display name. */
export const TAROT_CARD_NAMES_HI: Record<string, string> = {
  "The Fool": "मूर्ख",
  "The Magician": "जादूगर",
  "The High Priestess": "हाई प्रिएस्टेस",
  "The Empress": "रानी",
  "The Emperor": "सम्राट",
  "The Hierophant": "हाईरोफांट",
  "The Lovers": "प्रेमीजन",
  "The Chariot": "रथ",
  "Strength": "शक्ति",
  "The Hermit": "विदूरी",
  "Wheel of Fortune": "भाग्य का चक्का",
  "Justice": "न्याय",
  "The Hanged Man": "लटका हुआ आदमी",
  "Death": "मृत्यु",
  "Temperance": "संतुलन",
  "The Devil": "शैतान",
  "The Tower": "मेढ़क",
  "The Star": "तारा",
  "The Moon": "चंद्रमा",
  "The Sun": "सूर्य",
  "Judgement": "निर्णय",
  "The World": "विश्व",
};

/** English card name → { upright, reversed } in Hindi. Covers all 78 cards. */
export const TAROT_MEANINGS_HI: Record<string, { upright: string; reversed: string }> = {
  "The Fool": { upright: "नई शुरुआत, उत्साह, जीवन पर विश्वास", reversed: "पीछे हटना, बदलाव से डर, बेपरवाही" },
  "The Magician": { upright: "संकल्पना, संसाधन क्षमता, शक्ति", reversed: "हेरफेराव, खराब योजना, अनप्रयुक्त प्रतिभा" },
  "The High Priestess": { upright: "अंतर्ज्ञान, पवित्र ज्ञान, दिव्य स्त्री शक्ति", reversed: "रहस्य, अंतर्ज्ञान से दूर, स्वैकृत विचलन" },
  "The Empress": { upright: "समृद्धि, परिचर्या, गर्भपात, रचनात्मकता", reversed: "रचनात्मक अवरोध, निर्भरता, दमन करना" },
  "The Emperor": { upright: "अधिकार, संरचना, स्थिरता, नियंत्रण", reversed: "प्रतिद्वंद्वी, कठोरता, अनुशासन की कमी" },
  "The Hierophant": { upright: "आध्यात्मिक ज्ञान, परंपरा, मार्गदर्शन", reversed: "विद्रोह, अपरम्परागतता, प्रतिबंध" },
  "The Lovers": { upright: "प्रेम, सामंजस्य, सार्थक संबंध", reversed: "असंतुलन, असंरेखण, असामंजस्य" },
  "The Chariot": { upright: "विजय, संकल्प शक्ति, दृढ़ संकल्प", reversed: "दिशा की कमी, आक्रमण, बाधाएँ" },
  "Strength": { upright: "धैर्य, भीतरी शक्ति, लचीलापन", reversed: "आत्म-संदेह, कमजोरी, असुरक्षा" },
  "The Hermit": { upright: "आन्तरिक चिंतन, एकावस्था, आन्तरिक मार्गदर्शन", reversed: "एकांतता, अकेलेपन, स्वैकृत विचलन" },
  "Wheel of Fortune": { upright: "बदलाव, चक्र, भाग्य, मोड़", reversed: "बुरा भाग्य, बदलाव से विरोध, बंधक" },
  "Justice": { upright: "न्याय, सत्य, कारण-परिणाम", reversed: "अन्याय, झूठ, असंतुलन" },
  "The Hanged Man": { upright: "समर्पण, नई दृष्टि, समय रहना", reversed: "टाल मटोल, प्रतिरोध, बेकार बलिदान" },
  "Death": { upright: "समापन, परिवर्तन, नई शुरुआत", reversed: "बदलाव से प्रतिरोध, स्थिरता, डर" },
  "Temperance": { upright: "संतुलन, धैर्य, मध्यस्थता", reversed: "असंतुलन, अत्यधिक, असामंजस्य" },
  "The Devil": { upright: "मुक्ति, छाया आत्मा, आलस्य", reversed: "मुक्ति, छोड़ना, श्रृंखला तोड़ना" },
  "The Tower": { upright: "अचानक बदलाव, जागरूकता, प्रकटीकरण", reversed: "बदलाव से डर, बचाव में बाधा" },
  "The Star": { upright: "आशा, उपचार, प्रेरणा, शांति", reversed: "विश्वास की कमी, निराशा, हताशा" },
  "The Moon": { upright: "रहस्य, अंतर्ज्ञान, छिपे सत्य", reversed: "भ्रमण, डर, गलतफहमी" },
  "The Sun": { upright: "सफलता, ऊर्जा, आनंद, सकारात्मकता", reversed: "अस्थायी बंधक, उत्साह की कमी" },
  "Judgement": { upright: "पुनर्जन्म, जागरूकता, आन्तरिक आवाज़", reversed: "आत्म-संदेह, आवाज़ की अनदेखी, अफ़साना" },
  "The World": { upright: "पूरा करना, पूर्ति, ब्रह्मांडीय सामंजस्य", reversed: "अधूरापन, समाप्ति की कमी" },
  "Ace of Wands": { upright: "प्रेरणा, नई प्रेम, रचनात्मक ज्वाला", reversed: "ऊर्जा की कमी, विलंबित योजना, रचनात्मक अवरोध" },
  "Two of Wands": { upright: "भविष्य की योजना, प्रगति, निर्णय", reversed: "बदलाव से डर, योजना की कमी" },
  "Three of Wands": { upright: "विस्तार, दूरदर्शिता, विदेशी अवसर", reversed: "विलंब, बाधाएँ, दूरदर्शिता की कमी" },
  "Four of Wands": { upright: "जश्न, सामंजस्य, घर की ओर लौट", reversed: "स्थिरता की कमी, पारिवारिक द्वंद्व" },
  "Five of Wands": { upright: "द्वंद्व, प्रतिद्वंद्विता, तनाव", reversed: "द्वंद्व से बचना, भीतरी उथल" },
  "Six of Wands": { upright: "विजय, मान्यता, सार्वजनिक सफलता", reversed: "मान्यता की कमी, असफलता, अहंकार" },
  "Seven of Wands": { upright: "धैर्य, रक्षा, जड़ पर खड़ा रहना", reversed: "छोड़ देना, ओवरव्हेल्म, रक्षाकवच" },
  "Eight of Wands": { upright: "गति, कार्रवाई, तेज़ प्रगति", reversed: "विलंब, असंतुष्टि, प्रतीक्षा" },
  "Nine of Wands": { upright: "लचीलापन, साहस, दृढ़ता", reversed: "थकान, रक्षाकवच, चिंता" },
  "Ten of Wands": { upright: "बोझ, ज़िम्मेदारी, मेहनत", reversed: "अवधारण, थकान, मुक्ति" },
  "Page of Wands": { upright: "उत्साह, अन्वेषण, खोज", reversed: "दिशा की कमी, टाल मटोल" },
  "Knight of Wands": { upright: "साहस, प्रेम, आक्रामकता", reversed: "बेपरवाही, जलवायु, असंतुष्टि" },
  "Queen of Wands": { upright: "आत्मविश्वास, साहस, दृढ़ संकल्प", reversed: "असुरक्षा, ईर्ष्या, आत्म-संदेह" },
  "King of Wands": { upright: "नेतृत्व, दृष्टि, उद्यमिता", reversed: "बेपरवाही, अभिमान, प्रतिद्वंद्विता" },
  "Ace of Cups": { upright: "प्रेम की नई शुरुआत, भावनात्मक जागरूकता, अंतर्ज्ञान", reversed: "भावनात्मक अवरोध, खालीपन, बेअसर" },
  "Two of Cups": { upright: "साझेदारी, परस्पर आकर्षण, एकता", reversed: "असंतुलन, विशालकरण, असामंजस्य" },
  "Three of Cups": { upright: "मित्रता, जश्न, समुदाय", reversed: "अत्यधिक उपयोग, अफवाहें, एकांतता" },
  "Four of Cups": { upright: "उदासीनता, विचार, छोड़े हुए अवसर", reversed: "नई दृष्टि, स्वीकृति, जागरूकता" },
  "Five of Cups": { upright: "नुकसान, पीड़ा, अफ़साना", reversed: "स्वीकृति, आगे बढ़ना, क्षमा" },
  "Six of Cups": { upright: "उत्साह, बचपन की यादें, निर्दोषता", reversed: "भूत में रहना, यादों में फंसना" },
  "Seven of Cups": { upright: "विकल्प, भ्रम, सपना", reversed: "स्पष्टता, ध्यान केंद्रित करना, निर्णय लेना" },
  "Eight of Cups": { upright: "चले जाना, गहरे अर्थ की खोज", reversed: "बदलाव से डर, प्रतिद्वंद्विता" },
  "Nine of Cups": { upright: "इच्छाएँ पूरी होती हैं, संतुष्टि, समृद्धि", reversed: "असंतुष्टि, लोभ, अत्यधिक उपयोग" },
  "Ten of Cups": { upright: "सामंजस्य, पारिवारिक आनंद, भावनात्मक पूर्ति", reversed: "टूटा हुआ परिवार, असामंजस्य, अवास्तविक सपने" },
  "Page of Cups": { upright: "रचनात्मक प्रेरणा, जिज्ञासा, नई भावनाएँ", reversed: "भावनात्मक अप्रौढ़ता, असुरक्षा" },
  "Knight of Cups": { upright: "प्रेम, आकर्षकता, आदर्शवाद", reversed: "उदासीनता, अवास्तविक अपेक्षाएँ" },
  "Queen of Cups": { upright: "दया, भावनात्मक बुद्धिमता, अंतर्ज्ञान", reversed: "भावनात्मक असुरक्षा, निर्भरता" },
  "King of Cups": { upright: "भावनात्मक संतुलन, राजनैतिक, बुद्धिमता", reversed: "भावनात्मक हेरफेराव, उदासीनता" },
  "Ace of Swords": { upright: "स्पष्टता, सत्य, मानसिक ब्रेकदार", reversed: "भ्रमण, मानसिक धुंध, असंवाद" },
  "Two of Swords": { upright: "कठिन निर्णय, टालमटोल, बचाव", reversed: "निर्णय न लेना, चिंता, सत्य का सामना" },
  "Three of Swords": { upright: "दिल का दर्द, ग़म, विश्वासघात", reversed: "उपचार, क्षमा, आगे बढ़ना" },
  "Four of Swords": { upright: "विश्राम, रीकवरी, विचार", reversed: "जलवायु असंतुष्टि, चलता रहना, थकान" },
  "Five of Swords": { upright: "द्वंद्व, पराजय, जितना भी लड़ो", reversed: "मिलन, आगे बढ़ना, छोड़ देना" },
  "Six of Swords": { upright: "परिवर्तन, आगे बढ़ना, उपचार", reversed: "भूत में रहना, परिवर्तन से विरोध" },
  "Seven of Swords": { upright: "धोखा, रणणीति, छिपकर", reversed: "स्वीकार, ईमानदारी, साफ़ करना" },
  "Eight of Swords": { upright: "स्वयं के द्वारा बनाए गए सीमाएँ, फंसा लगना", reversed: "मुक्ति, रिलीज़, नई दृष्टि" },
  "Nine of Swords": { upright: "चिंता, चिंता, सपने में डर", reversed: "आशा, रीकवरी, चिंता को छोड़ना" },
  "Ten of Swords": { upright: "विश्वासघात, नीचा स्तर, दर्दनाक समापन", reversed: "रीकवरी, उपचार, आगे बढ़ना" },
  "Page of Swords": { upright: "जिज्ञासा, नए विचार, जागरूकता", reversed: "अफवाहें, असंवाद, आक्रामक" },
  "Knight of Swords": { upright: "महत्वाकांक्षा, दृढ़ संकल्प, कार्रवाई", reversed: "बेपरवाही, जलवायम, हिंसा" },
  "Queen of Swords": { upright: "आत्मनिर्भरता, स्पष्टता, ईमानदारी", reversed: "ठंडा, कड़वाहट, कठोरता" },
  "King of Swords": { upright: "बौद्धिक, सत्य, अधिकार", reversed: "हेरफेराव, तानाशाही, शक्ति का दुरुपयोग" },
  "Ace of Pentacles": { upright: "नई अवसर, समृद्धि, समृद्धि", reversed: "छोड़े हुए अवसर, वित्तीय नुकसान" },
  "Two of Pentacles": { upright: "संतुलन, प्राथमिकताओं को संभालना, अनुकूलता", reversed: "अवधोरणा, असंतुलन, अव्यवस्था" },
  "Three of Pentacles": { upright: "टीमवर्क, सहयोग, शिल्पकारीगी", reversed: "टीमवर्क की कमी, खराब गुणवत्ता" },
  "Four of Pentacles": { upright: "सुरक्षा, नियंत्रण, स्थिरता", reversed: "लोभ, आलस्य, छोड़ना" },
  "Five of Pentacles": { upright: "वित्तीय कठिनाई, एकांतता, संघर्ष", reversed: "रीकवरी, आध्यात्मिक गरीबी, समर्थन" },
  "Six of Pentacles": { upright: "दान, दान, देना और प्राप्त करना", reversed: "ऋण, असमानता, स्वार्थ" },
  "Seven of Pentacles": { upright: "धैर्य, दीर्घकालिक निवेश, विकास", reversed: "अधैर्य, पुरस्कार की कमी, व्यर्थ प्रयास" },
  "Eight of Pentacles": { upright: "कौशल, शिल्पकारीगी, समर्पण", reversed: "अत्याचरणवाद, कौशल की कमी, औसतन" },
  "Nine of Pentacles": { upright: "आत्मनिर्भरता, विलासिता, स्व-पर्याप्ति", reversed: "वित्तीय निर्भरता, अत्यधिक उपयोग" },
  "Ten of Pentacles": { upright: "सम्पत्ति, विरासत, पारिवारिक स्थिरता", reversed: "वित्तीय नुकसान, पारिवारिक विवाद" },
  "Page of Pentacles": { upright: "सीखना, नई कौशल, महत्वाकांक्षा", reversed: "प्रगति की कमी, टाल मटोल" },
  "Knight of Pentacles": { upright: "विश्वसनीयता, मेहनत, धैर्य", reversed: "स्थिरता, उदासीनता, ज़िद" },
  "Queen of Pentacles": { upright: "दया, व्यवहार्यता, समृद्धि", reversed: "काम-जीवन असंतुलन, अनदेखा" },
  "King of Pentacles": { upright: "सम्पत्ति, नेतृत्व, सुरक्षा", reversed: "लोभ, ज़िद, वित्तीय असुरक्षा" },
};

/** Topic id → Hindi label + description. */
export const TAROT_TOPICS_HI: Record<string, { label: string; description: string }> = {
  love: { label: "प्रेम", description: "रोमांटिक संबंध और भावनात्मक जुड़ाव" },
  career: { label: "करियर", description: "काम, महत्वाकांक्षा और पेशेवर विकास" },
  general: { label: "सामान्य", description: "कुल जीवन मार्गदर्शन और आध्यात्मिक अंतर्दृष्टि" },
};

export type TarotCardHi = { name: string; upright: string; reversed: string };

/** Return the Hindi display name for a card (Major Arcana only); minors keep English. */
export function getTarotCardName(name: string, locale: TarotLocale): string {
  if (locale === "hi") return TAROT_CARD_NAMES_HI[name] ?? name;
  return name;
}

/** Return the localized upright/reversed meaning for a card. */
export function getTarotCardHiMeaning(name: string, reversed: boolean): string {
  const hi = TAROT_MEANINGS_HI[name];
  if (!hi) return "";
  return reversed ? hi.reversed : hi.upright;
}
