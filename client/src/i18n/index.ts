import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./en";

type Dict = typeof en;

function overlay(partial: Partial<Dict>): Dict {
  return { ...en, ...partial, sellerSteps: { ...en.sellerSteps, ...(partial.sellerSteps || {}) } };
}

const hi = overlay({
  tagline: "हाथ से बना, नाम के साथ, उचित दाम",
  demoBanner: "डेमो मोड: लिस्टिंग, आवाज़ और लेखन नमूना तर्क से चलते हैं। लाइव AI कुंजी की ज़रूरत नहीं।",
  chooseLanguage: "अपनी भाषा चुनें",
  speakLanguage: "अपनी भाषा बोलें",
  continue: "आगे बढ़ें",
  listening: "सुन रहे हैं…",
  whoAreYou: "KARIGAR का उपयोग कैसे करेंगे?",
  buyer: "खरीदार",
  seller: "विक्रेता / कारीगर",
  buyerHint: "शिल्प देखें, सीधे कारीगर से खरीदें।",
  sellerHint: "फ़ोटो लें, आवाज़ से बताएँ, प्रकाशित करें।",
  back: "पीछे",
  next: "आगे",
  search: "शिल्प, सामग्री, कारीगर खोजें",
  cart: "कार्ट",
  recommended: "आपके लिए सुझाव",
  popular: "लोकप्रिय शिल्प",
  categories: "श्रेणियाँ",
  featuredArtisans: "चयनित कारीगर",
  addToCart: "कार्ट में डालें",
  buyNow: "अभी खरीदें",
  artisan: "कारीगर",
  material: "सामग्री",
  craft: "शिल्प",
  description: "विवरण",
  reviews: "समीक्षाएँ",
  delivery: "डिलीवरी",
  checkout: "चेकआउट",
  placeOrder: "डेमो ऑर्डर दें",
  orderConfirmed: "ऑर्डर पुष्ट",
  photosTitle: "1 से 3 फ़ोटो जोड़ें",
  capture: "फ़ोटो लें",
  upload: "अपलोड",
  improvePhoto: "फ़ोटो सुधारें?",
  voiceTitle: "इस वस्तु के बारे में बताएँ",
  startTalking: "बोलना शुरू करें",
  generateDescription: "विवरण बनाएँ",
  priceTitle: "कीमत क्या हो?",
  publish: "लिस्टिंग प्रकाशित करें",
  sellerSteps: {
    photos: "फ़ोटो",
    voice: "आवाज़ विवरण",
    description: "एआई विवरण",
    price: "कीमत",
    promotion: "प्रचार",
    publish: "प्रकाशित"
  }
});

const bn = overlay({
  tagline: "হাতে তৈরি, নামসহ, ন্যায্য মূল্য",
  chooseLanguage: "আপনার ভাষা বেছে নিন",
  speakLanguage: "আপনার ভাষায় বলুন",
  whoAreYou: "KARIGAR কীভাবে ব্যবহার করবেন?",
  buyer: "ক্রেতা",
  seller: "বিক্রেতা / কারিগর",
  search: "শিল্প, উপকরণ, কারিগর খুঁজুন",
  addToCart: "কার্টে যোগ করুন",
  placeOrder: "ডেমো অর্ডার দিন",
  sellerSteps: { photos: "ছবি", voice: "কণ্ঠ", description: "বিবরণ", price: "দাম", promotion: "প্রচার", publish: "প্রকাশ" }
});

const mr = overlay({
  tagline: "हाताने बनवलेले, नावासह, योग्य किंमत",
  chooseLanguage: "आपली भाषा निवडा",
  speakLanguage: "आपली भाषा बोला",
  whoAreYou: "KARIGAR कसे वापराल?",
  buyer: "खरेदीदार",
  seller: "विक्रेता / कारागीर",
  search: "कला, साहित्य, कारागीर शोधा",
  addToCart: "कार्टमध्ये टाका",
  sellerSteps: { photos: "फोटो", voice: "आवाज", description: "वर्णन", price: "किंमत", promotion: "प्रचार", publish: "प्रकाशित" }
});

const te = overlay({
  tagline: "చేతితో తయారు, పేరుతో, న్యాయమైన ధర",
  chooseLanguage: "మీ భాషను ఎంచుకోండి",
  speakLanguage: "మీ భాషలో మాట్లాడండి",
  whoAreYou: "KARIGAR ను ఎలా ఉపయోగిస్తారు?",
  buyer: "కొనుగోలుదారు",
  seller: "విక్రేత / కళాకారుడు",
  search: "చేతిపని, పదార్థం, కళాకారులను వెతకండి",
  addToCart: "కార్ట్‌లో చేర్చండి",
  sellerSteps: { photos: "ఫోటోలు", voice: "వాయిస్", description: "వివరణ", price: "ధర", promotion: "ప్రచారం", publish: "ప్రచురించు" }
});

const ta = overlay({
  tagline: "கையால் செய்தது, பெயருடன், நியாயமான விலை",
  chooseLanguage: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
  speakLanguage: "உங்கள் மொழியில் பேசுங்கள்",
  whoAreYou: "KARIGAR ஐ எப்படிப் பயன்படுத்துவீர்கள்?",
  buyer: "வாங்குபவர்",
  seller: "விற்பனையாளர் / கைவினைஞர்",
  search: "கைவினை, பொருள், கலைஞர்களைத் தேடுங்கள்",
  addToCart: "கார்ட்டில் சேர்",
  sellerSteps: { photos: "புகைப்படம்", voice: "குரல்", description: "விளக்கம்", price: "விலை", promotion: "விளம்பரம்", publish: "வெளியிடு" }
});

const gu = overlay({
  tagline: "હાથથી બનાવેલું, નામ સાથે, ન્યાયી ભાવ",
  chooseLanguage: "તમારી ભાષા પસંદ કરો",
  speakLanguage: "તમારી ભાષામાં બોલો",
  whoAreYou: "KARIGAR કેવી રીતે વાપરશો?",
  buyer: "ખરીદનાર",
  seller: "વેચનાર / કારીગર",
  search: "હસ્તકલા, સામગ્રી, કારીગર શોધો",
  addToCart: "કાર્ટમાં ઉમેરો",
  sellerSteps: { photos: "ફોટો", voice: "અવાજ", description: "વર્ણન", price: "કિંમત", promotion: "પ્રચાર", publish: "પ્રકાશિત" }
});

const kn = overlay({
  tagline: "ಕೈಯಿಂದ ಮಾಡಿದ, ಹೆಸರಿನೊಂದಿಗೆ, ನ್ಯಾಯಯುತ ಬೆಲೆ",
  chooseLanguage: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
  speakLanguage: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ",
  whoAreYou: "KARIGAR ಅನ್ನು ಹೇಗೆ ಬಳಸುತ್ತೀರಿ?",
  buyer: "ಖರೀದಿದಾರ",
  seller: "ಮಾರಾಟಗಾರ / ಕುಶಲಕರ್ಮಿ",
  search: "ಕರಕುಶಲ, ವಸ್ತು, ಕಲಾವಿದರನ್ನು ಹುಡುಕಿ",
  addToCart: "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
  sellerSteps: { photos: "ಫೋಟೋ", voice: "ಧ್ವನಿ", description: "ವಿವರ", price: "ಬೆಲೆ", promotion: "ಪ್ರಚಾರ", publish: "ಪ್ರಕಟಿಸಿ" }
});

const ml = overlay({
  tagline: "കൈകൊണ്ട് നിർമ്മിച്ചത്, പേരോടെ, ന്യായവില",
  chooseLanguage: "നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക",
  speakLanguage: "നിങ്ങളുടെ ഭാഷയിൽ സംസാരിക്കുക",
  whoAreYou: "KARIGAR എങ്ങനെ ഉപയോഗിക്കും?",
  buyer: "വാങ്ങുന്നയാൾ",
  seller: "വിൽപ്പനക്കാരൻ / കരകൗശലക്കാരൻ",
  search: "കരകൗശലം, വസ്തു, കലാകാരന്മാരെ തിരയുക",
  addToCart: "കാർട്ടിലേക്ക് ചേർക്കുക",
  sellerSteps: { photos: "ഫോട്ടോ", voice: "ശബ്ദം", description: "വിവരണം", price: "വില", promotion: "പ്രചാരണം", publish: "പ്രസിദ്ധീകരിക്കുക" }
});

const pa = overlay({
  tagline: "ਹੱਥਾਂ ਨਾਲ ਬਣਿਆ, ਨਾਮ ਨਾਲ, ਇਨਸਾਫ਼ੀ ਕੀਮਤ",
  chooseLanguage: "ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ",
  speakLanguage: "ਆਪਣੀ ਭਾਸ਼ਾ ਬੋਲੋ",
  whoAreYou: "KARIGAR ਨੂੰ ਕਿਵੇਂ ਵਰਤੋਗੇ?",
  buyer: "ਖਰੀਦਦਾਰ",
  seller: "ਵਿਕਰੇਤਾ / ਕਾਰੀਗਰ",
  search: "ਦਸਤਕਾਰੀ, ਸਮੱਗਰੀ, ਕਾਰੀਗਰ ਲੱਭੋ",
  addToCart: "ਕਾਰਟ ਵਿੱਚ ਪਾਓ",
  sellerSteps: { photos: "ਫੋਟੋ", voice: "ਆਵਾਜ਼", description: "ਵੇਰਵਾ", price: "ਕੀਮਤ", promotion: "ਪ੍ਰਚਾਰ", publish: "ਪ੍ਰਕਾਸ਼ਿਤ" }
});

const or = overlay({
  tagline: "ହାତରେ ତିଆରି, ନାମ ସହିତ, ନ୍ୟାୟ ମୂଲ୍ୟ",
  chooseLanguage: "ଆପଣଙ୍କ ଭାଷା ବାଛନ୍ତୁ",
  speakLanguage: "ଆପଣଙ୍କ ଭାଷାରେ କୁହନ୍ତୁ",
  whoAreYou: "KARIGAR କିପରି ବ୍ୟବହାର କରିବେ?",
  buyer: "କ୍ରେତା",
  seller: "ବିକ୍ରେତା / କାରିଗର",
  search: "ହସ୍ତଶିଳ୍ପ, ସାମଗ୍ରୀ, କାରିଗର ଖୋଜନ୍ତୁ",
  addToCart: "କାର୍ଟରେ ଯୋଡନ୍ତୁ",
  sellerSteps: { photos: "ଫଟୋ", voice: "ସ୍ୱର", description: "ବିବରଣୀ", price: "ମୂଲ୍ୟ", promotion: "ପ୍ରଚାର", publish: "ପ୍ରକାଶ" }
});

const as = overlay({
  tagline: "হাতে সজা, নামৰ সৈতে, ন্যায্য দাম",
  chooseLanguage: "আপোনাৰ ভাষা বাছক",
  speakLanguage: "আপোনাৰ ভাষাত কওক",
  whoAreYou: "KARIGAR কেনেকৈ ব্যৱহাৰ কৰিব?",
  buyer: "ক্ৰেতা",
  seller: "বিক্ৰেতা / কাৰিগৰ",
  search: "শিল্প, সামগ্ৰী, কাৰিগৰ বিচাৰক",
  addToCart: "কাৰ্টত যোগ কৰক",
  sellerSteps: { photos: "ফটো", voice: "মাত", description: "বিৱৰণ", price: "দাম", promotion: "প্ৰচাৰ", publish: "প্ৰকাশ" }
});

const ur = overlay({
  tagline: "ہاتھ سے بنا، نام کے ساتھ، مناسب قیمت",
  chooseLanguage: "اپنی زبان منتخب کریں",
  speakLanguage: "اپنی زبان میں بولیں",
  whoAreYou: "KARIGAR کو کیسے استعمال کریں گے؟",
  buyer: "خریدار",
  seller: "فروخت کنندہ / کاریگر",
  search: "دستکاری، مواد، کاریگر تلاش کریں",
  addToCart: "کارٹ میں ڈالیں",
  sellerSteps: { photos: "تصاویر", voice: "آواز", description: "تفصیل", price: "قیمت", promotion: "تشہیر", publish: "شائع" }
});

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  mr: { translation: mr },
  te: { translation: te },
  ta: { translation: ta },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
  pa: { translation: pa },
  or: { translation: or },
  as: { translation: as },
  ur: { translation: ur }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem("karigar.lang") || "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
