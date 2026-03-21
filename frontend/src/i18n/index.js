import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Navbar
            home: 'Home', aiAssistant: 'AI Assistant', about: 'Our Mission', contact: 'Support',
            signIn: 'Sign In', register: 'Register', dashboard: 'Dashboard',
            // Home
            heroTitle: 'Lifeline', heroSub: 'Saves Lives.',
            heroDesc: 'A unified, AI-powered hospital management platform built for the modern era.',
            launchConsole: 'Launch Console', learnMore: 'Learn More', registerNow: 'Register Now',
            // Dashboard
            overview: 'Overview', doctors: 'Doctors', patients: 'Patients', appointments: 'Appointments',
            settings: 'Settings', signOut: 'Sign Out',
            // Common
            loading: 'Loading...', save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',
            search: 'Search', filter: 'Filter', export: 'Export', print: 'Print',
            name: 'Name', email: 'Email', phone: 'Phone', address: 'Address', status: 'Status',
            actions: 'Actions', date: 'Date', time: 'Time', total: 'Total',
            active: 'Active', inactive: 'Inactive', pending: 'Pending', approved: 'Approved',
            // AI
            aiGreeting: 'Hello! I am Lifeline AI — your clinical intelligence assistant. How can I help you today?',
            aiPlaceholder: 'Initiate secure clinical screening: provide symptoms or query...',
            aiDisclaimer: 'AI provides guidance only — not a substitute for professional medical advice.',
            // Footer
            emergencyContact: 'Emergency: 911',
        }
    },
    ta: {
        translation: {
            home: 'முகப்பு', aiAssistant: 'AI உதவியாளர்', about: 'எங்கள் நோக்கம்', contact: 'ஆதரவு',
            signIn: 'உள்நுழை', register: 'பதிவு செய்', dashboard: 'டாஷ்போர்டு',
            heroTitle: 'லைஃப்லைன்', heroSub: 'உயிர்களை காக்கிறது.',
            heroDesc: 'நவீன சகாப்தத்திற்காக கட்டமைக்கப்பட்ட AI-ஆல் இயக்கப்படும் மருத்துவமனை மேலாண்மை தளம்.',
            launchConsole: 'கன்சோலை தொடங்கு', learnMore: 'மேலும் அறிக', registerNow: 'இப்போது பதிவு செய்க',
            overview: 'கண்ணோட்டம்', doctors: 'மருத்துவர்கள்', patients: 'நோயாளிகள்', appointments: 'சந்திப்புகள்',
            settings: 'அமைப்புகள்', signOut: 'வெளியேறு',
            loading: 'ஏற்றுகிறது...', save: 'சேமி', cancel: 'ரத்து', edit: 'திருத்து', delete: 'நீக்கு',
            aiGreeting: 'வணக்கம்! நான் Lifeline AI — உங்கள் மருத்துவ உதவியாளர். நான் எவ்வாறு உதவலாம்?',
            aiPlaceholder: 'பாதுகாப்பான பரிசோதனையைத் தொடங்கவும்: அறிகுறிகளை வழங்கவும்...',
            emergencyContact: 'அவசரநிலை: 108',
        }
    },
    hi: {
        translation: {
            home: 'होम', aiAssistant: 'AI सहायक', about: 'हमारा मिशन', contact: 'सहायता',
            signIn: 'साइन इन', register: 'रजिस्टर', dashboard: 'डैशबोर्ड',
            heroTitle: 'लाइफलाइन', heroSub: 'जीवन बचाता है।',
            heroDesc: 'आधुनिक युग के लिए निर्मित AI-संचालित अस्पताल प्रबंधन प्लेटफॉर्म।',
            launchConsole: 'कंसोल लॉन्च करें', learnMore: 'अधिक जानें', registerNow: 'अब पंजीकरण करें',
            overview: 'अवलोकन', doctors: 'डॉक्टर', patients: 'मरीज़', appointments: 'अपॉइंटमेंट',
            settings: 'सेटिंग्स', signOut: 'साइन आउट',
            loading: 'लोड हो रहा है...', save: 'सहेजें', cancel: 'रद्द करें', edit: 'संपादित करें', delete: 'हटाएं',
            aiGreeting: 'नमस्ते! मैं Lifeline AI हूँ — आपका नैदानिक सहायक। मैं आज आपकी कैसे सहायता कर सकता हूँ?',
            aiPlaceholder: 'सुरक्षित नैदानिक जांच शुरू करें: लक्षण या प्रश्न प्रदान करें...',
            emergencyContact: 'आपातकाल: 112',
        }
    },
    te: {
        translation: {
            home: 'హోమ్', aiAssistant: 'AI సహాయకుడు', about: 'మా మిషన్', contact: 'మద్దతు',
            signIn: 'సైన్ ఇన్', register: 'నమోదు', dashboard: 'డాష్‌బోర్డ్',
            heroTitle: 'లైఫ్‌లైన్', heroSub: 'జీవితాలను కాపాడుతుంది.',
            heroDesc: 'ఆధునిక యుగం కోసం నిర్మించిన AI-ఆధారిత ఆసుపత్రి నిర్వహణ వేదిక.',
            launchConsole: 'కన్సోల్ ప్రారంభించు', learnMore: 'మరింత తెలుసుకోండి', registerNow: 'ఇప్పుడే నమోదు చేసుకోండి',
            overview: 'అవలోకనం', doctors: 'వైద్యులు', patients: 'రోగులు', appointments: 'అపాయింట్‌మెంట్లు',
            settings: 'సెట్టింగులు', signOut: 'సైన్ అవుట్',
            loading: 'లోడ్ అవుతోంది...', save: 'సేవ్', cancel: 'రద్దు',
            aiGreeting: 'హలో! నేను Lifeline AI — మీ వైద్య సహాయకుడు. నేను ఈ రోజు మీకు ఎలా సహాయం చేయగలను?',
            aiPlaceholder: 'సురక్షితమైన క్లినికల్ స్క్రీనింగ్ ప్రారంభించండి...',
            emergencyContact: 'అత్యవసర: 108',
        }
    },
    ml: {
        translation: {
            home: 'ഹോം', aiAssistant: 'AI അസിസ്റ്റന്റ്', about: 'ഞങ്ങളുടെ ദൗത്യം', contact: 'സഹായം',
            signIn: 'സൈൻ ഇൻ', register: 'രജിസ്റ്റർ', dashboard: 'ഡാഷ്‌ബോർഡ്',
            heroTitle: 'ലൈഫ്‌ലൈൻ', heroSub: 'ജീവൻ രക്ഷിക്കുന്നു.',
            heroDesc: 'ആധുനിക കാലത്തേക്കായി നിർമ്മിച്ച AI-ഉദ്‌ഗ്രഥിത ആശുപത്രി മാനേജ്‌മെന്റ് പ്ലാറ്റ്‌ഫോം.',
            launchConsole: 'കൺസോൾ തുടങ്ങുക', learnMore: 'കൂടുതൽ അറിയുക', registerNow: 'ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക',
            overview: 'അവലോകനം', doctors: 'ഡോക്ടർമാർ', patients: 'രോഗികൾ', appointments: 'അപ്പോയിന്റ്‌മെന്റുകൾ',
            settings: 'ക്രമീകരണങ്ങൾ', signOut: 'സൈൻ ഔട്ട്',
            loading: 'ലോഡ് ചെയ്യുന്നു...', save: 'സേവ്', cancel: 'റദ്ദാക്കുക',
            aiGreeting: 'ഹലോ! ഞാൻ Lifeline AI ആണ് — നിങ്ങളുടെ ക്ലിനിക്കൽ അസിസ്റ്റന്റ്.',
            aiPlaceholder: 'സുരക്ഷിതമായ ക്ലിനിക്കൽ സ്ക്രീനിംഗ് ആരംഭിക്കുക...',
            emergencyContact: 'അടിയന്തരം: 108',
        }
    },
    kn: {
        translation: {
            home: 'ಮನೆ', aiAssistant: 'AI ಸಹಾಯಕ', about: 'ನಮ್ಮ ಮಿಷನ್', contact: 'ಬೆಂಬಲ',
            signIn: 'ಸೈನ್ ಇನ್', register: 'ನೋಂದಣಿ', dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            heroTitle: 'ಲೈಫ್‌ಲೈನ್', heroSub: 'ಜೀವನ ಉಳಿಸುತ್ತದೆ.',
            heroDesc: 'ಆಧುನಿಕ ಯುಗಕ್ಕಾಗಿ ನಿರ್ಮಿಸಲಾದ AI-ಚಾಲಿತ ಆಸ್ಪತ್ರೆ ನಿರ್ವಹಣಾ ವೇದಿಕೆ.',
            launchConsole: 'ಕನ್ಸೋಲ್ ಪ್ರಾರಂಭಿಸಿ', learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ', registerNow: 'ಈಗಲೇ ನೋಂದಾಯಿಸಿ',
            overview: 'ಅವಲೋಕನ', doctors: 'ವೈದ್ಯರು', patients: 'ರೋಗಿಗಳು', appointments: 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು',
            settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು', signOut: 'ಸೈನ್ ಔಟ್',
            loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', save: 'ಉಳಿಸಿ', cancel: 'ರದ್ದು',
            aiGreeting: 'ಹಲೋ! ನಾನು Lifeline AI — ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಸಹಾಯಕ.',
            aiPlaceholder: 'ಸುರಕ್ಷಿತ ಕ್ಲಿನಿಕಲ್ ಸ್ಕ್ರೀನಿಂಗ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸಿ...',
            emergencyContact: 'ತುರ್ತು: 108',
        }
    },
    bn: {
        translation: {
            home: 'হোম', aiAssistant: 'AI সহায়ক', about: 'আমাদের মিশন', contact: 'সহায়তা',
            signIn: 'সাইন ইন', register: 'নিবন্ধন', dashboard: 'ড্যাশবোর্ড',
            heroTitle: 'লাইফলাইন', heroSub: 'জীবন বাঁচায়।',
            heroDesc: 'আধুনিক যুগের জন্য নির্মিত AI-চালিত হাসপাতাল ব্যবস্থাপনা প্ল্যাটফর্ম।',
            launchConsole: 'কনসোল চালু করুন', learnMore: 'আরও জানুন', registerNow: 'এখনই নিবন্ধন করুন',
            overview: 'সংক্ষিপ্ত বিবরণ', doctors: 'ডাক্তার', patients: 'রোগী', appointments: 'অ্যাপয়েন্টমেন্ট',
            settings: 'সেটিংস', signOut: 'সাইন আউট',
            loading: 'লোড হচ্ছে...', save: 'সংরক্ষণ', cancel: 'বাতিল',
            aiGreeting: 'হ্যালো! আমি Lifeline AI — আপনার ক্লিনিক্যাল সহায়ক।',
            aiPlaceholder: 'সুরক্ষিত ক্লিনিক্যাল স্ক্রিনিং শুরু করুন: লক্ষণ প্রদান করুন...',
            emergencyContact: 'জরুরি: 112',
        }
    },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('lifeline-lang') || 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;

export const LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
];
