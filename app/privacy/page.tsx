'use client';

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function PrivacyPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Privacy Policy',
      subtitle: 'How we collect, use, and protect your personal information.',
      lastUpdated: 'Last updated: August 2026',
      sections: [
        {
          heading: '1. Information We Collect',
          text: 'We collect information you provide directly, such as your name, email address, birth details, and payment information when you use our services. We also collect usage data to improve our platform.',
        },
        {
          heading: '2. How We Use Your Information',
          text: 'Your information is used to provide astrology readings, process payments, personalize your experience, and communicate with you about our services. We never sell your personal data to third parties.',
        },
        {
          heading: '3. Data Security',
          text: 'We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits.',
        },
        {
          heading: '4. Your Rights',
          text: 'You have the right to access, correct, or delete your personal information at any time. Contact us at support@astroveda.com for any privacy-related requests.',
        },
      ],
    },
    hi: {
      title: 'गोपनीयता नीति',
      subtitle: 'हम आपकी व्यक्तिगत जानकारी कैसे एकत्र, उपयोग और सुरक्षा करते हैं।',
      lastUpdated: 'अंतिम अपडेट: अगस्त 2026',
      sections: [
        {
          heading: '1. हम कौन सी जानकारी एकत्र करते हैं',
          text: 'हम आपके द्वारा सीधे प्रदान की गई जानकारी एकत्र करते हैं, जैसे आपका नाम, ईमेल पता, जन्म विवरण, और भुगतान जानकारी जब आप हमारी सेवाओं का उपयोग करते हैं। हम अपने प्लेटफॉर्म को बेहतर बनाने के लिए उपयोग डेटा भी एकत्र करते हैं।',
        },
        {
          heading: '2. हम आपकी जानकारी का उपयोग कैसे करते हैं',
          text: 'आपकी जानकारी का उपयोग ज्योतिष रीडिंग प्रदान करने, भुगतान संसाधित करने, आपके अनुभव को व्यक्तिगत बनाने और हमारी सेवाओं के बारे में आपसे संवाद करने के लिए किया जाता है। हम आपका व्यक्तिगत डेटा कभी भी तीसरे पक्ष को नहीं बेचते।',
        },
        {
          heading: '3. डेटा सुरक्षा',
          text: 'हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपाय लागू करते हैं, जिसमें एन्क्रिप्शन, सुरक्षित सर्वर और नियमित सुरक्षा ऑडिट शामिल हैं।',
        },
        {
          heading: '4. आपके अधिकार',
          text: 'आपको किसी भी समय अपनी व्यक्तिगत जानकारी तक पहुंचने, सही करने या हटाने का अधिकार है। किसी भी गोपनीयता संबंधी अनुरोध के लिए support@astroveda.com पर संपर्क करें।',
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
            <Shield className="w-8 h-8 text-[var(--accent)]" />
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