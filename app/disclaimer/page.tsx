'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function DisclaimerPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Disclaimer',
      subtitle: 'Important information about the nature of our astrology services.',
      lastUpdated: 'Last updated: August 2026',
      sections: [
        {
          heading: '1. Entertainment & Informational Purposes',
          text: 'All astrology readings, horoscope predictions, kundali analyses, and matchmaking reports provided by AstroVeda are for entertainment and informational purposes only. They should not be considered as professional advice.',
        },
        {
          heading: '2. Not Professional Advice',
          text: 'Our services do not constitute medical, legal, financial, or psychological advice. Always consult qualified professionals for decisions regarding health, legal matters, investments, or major life choices.',
        },
        {
          heading: '3. No Guarantees',
          text: 'AstroVeda makes no guarantees regarding the accuracy, completeness, or reliability of any predictions or readings. Astrological interpretations are subjective and based on traditional practices.',
        },
        {
          heading: '4. Personal Responsibility',
          text: 'You are solely responsible for any decisions or actions you take based on the information provided through our services. AstroVeda and its team are not liable for any outcomes resulting from such decisions.',
        },
      ],
    },
    hi: {
      title: 'अस्वीकरण',
      subtitle: 'हमारी ज्योतिष सेवाओं की प्रकृति के बारे में महत्वपूर्ण जानकारी।',
      lastUpdated: 'अंतिम अपडेट: अगस्त 2026',
      sections: [
        {
          heading: '1. मनोरंजन और सूचनात्मक उद्देश्य',
          text: 'AstroVeda द्वारा प्रदान की गई सभी ज्योतिष रीडिंग, राशिफल भविष्यवाणी, कुंडली विश्लेषण और मिलान रिपोर्ट केवल मनोरंजन और सूचनात्मक उद्देश्यों के लिए हैं। इन्हें पेशेवर सलाह नहीं माना जाना चाहिए।',
        },
        {
          heading: '2. पेशेवर सलाह नहीं',
          text: 'हमारी सेवाएं चिकित्सा, कानूनी, वित्तीय या मनोवैज्ञानिक सलाह नहीं बनती हैं। स्वास्थ्य, कानूनी मामलों, निवेश या प्रमुख जीवन विकल्पों के बारे में निर्णयों के लिए हमेशा योग्य पेशेवरों से परामर्श करें।',
        },
        {
          heading: '3. कोई गारंटी नहीं',
          text: 'AstroVeda किसी भी भविष्यवाणी या रीडिंग की सटीकता, पूर्णता या विश्वसनीयता के बारे में कोई गारंटी नहीं देता है। ज्योतिषीय व्याख्याएं व्यक्तिपरक हैं और पारंपरिक प्रथाओं पर आधारित हैं।',
        },
        {
          heading: '4. व्यक्तिगत जिम्मेदारी',
          text: 'हमारी सेवाओं के माध्यम से प्रदान की गई जानकारी के आधार पर आपके द्वारा किए गए किसी भी निर्णय या कार्य के लिए आप पूरी तरह जिम्मेदार हैं। AstroVeda और इसकी टीम ऐसे निर्णयों से उत्पन्न किसी भी परिणाम के लिए उत्तरदायी नहीं है।',
        },
      ],
    },
  };

  const c = content[language];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent)]/10 mb-6">
            <AlertTriangle className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)] mb-4">{c.title}</h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">{c.subtitle}</p>
          <p className="text-sm text-[var(--text-muted)] mt-3">{c.lastUpdated}</p>
        </motion.div>

        <div className="space-y-6">
          {c.sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="astro-card"
            >
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{section.heading}</h2>
              <p className="text-[var(--text-secondary)] leading-relaxed">{section.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}