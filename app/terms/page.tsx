'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function TermsPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Terms of Service',
      subtitle: 'Please read these terms carefully before using our services.',
      lastUpdated: 'Last updated: August 2026',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          text: 'By accessing or using AstroVeda, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
        },
        {
          heading: '2. Services Provided',
          text: 'AstroVeda provides AI-powered astrology readings, horoscope predictions, kundali generation, matchmaking analysis, and related spiritual guidance services. All readings are for entertainment and informational purposes only.',
        },
        {
          heading: '3. User Responsibilities',
          text: 'You agree to provide accurate information, use the services for lawful purposes only, and not attempt to disrupt or interfere with the platform\'s operation.',
        },
        {
          heading: '4. Payments and Refunds',
          text: 'Payments for premium services are processed securely. Refunds may be issued at our discretion for unused wallet credits. Please contact support@astroveda.com for any billing inquiries.',
        },
        {
          heading: '5. Limitation of Liability',
          text: 'AstroVeda is not liable for any decisions made based on astrology readings. All content is provided "as is" without warranties of any kind.',
        },
      ],
    },
    hi: {
      title: 'सेवा की शर्तें',
      subtitle: 'हमारी सेवाओं का उपयोग करने से पहले कृपया इन शर्तों को ध्यान से पढ़ें।',
      lastUpdated: 'अंतिम अपडेट: अगस्त 2026',
      sections: [
        {
          heading: '1. शर्तों की स्वीकृति',
          text: 'AstroVeda तक पहुंचकर या उपयोग करके, आप इन सेवा शर्तों से बंधे होने के लिए सहमत होते हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया हमारी सेवाओं का उपयोग न करें।',
        },
        {
          heading: '2. प्रदान की गई सेवाएं',
          text: 'AstroVeda AI-संचालित ज्योतिष रीडिंग, राशिफल भविष्यवाणी, कुंडली निर्माण, मिलान विश्लेषण और संबंधित आध्यात्मिक मार्गदर्शन सेवाएं प्रदान करता है। सभी रीडिंग केवल मनोरंजन और सूचनात्मक उद्देश्यों के लिए हैं।',
        },
        {
          heading: '3. उपयोगकर्ता जिम्मेदारियां',
          text: 'आप सटीक जानकारी प्रदान करने, सेवाओं का उपयोग केवल कानूनी उद्देश्यों के लिए करने और प्लेटफॉर्म के संचालन में बाधा डालने या हस्तक्षेप करने का प्रयास न करने के लिए सहमत हैं।',
        },
        {
          heading: '4. भुगतान और धनवापसी',
          text: 'प्रीमियम सेवाओं के लिए भुगतान सुरक्षित रूप से संसाधित किए जाते हैं। अप्रयुक्त वॉलेट क्रेडिट के लिए हमारे विवेक पर धनवापसी जारी की जा सकती है। किसी भी बिलिंग पूछताछ के लिए support@astroveda.com पर संपर्क करें।',
        },
        {
          heading: '5. दायित्व की सीमा',
          text: 'AstroVeda ज्योतिष रीडिंग के आधार पर किए गए किसी भी निर्णय के लिए उत्तरदायी नहीं है। सभी सामग्री बिना किसी वारंटी के "जैसा है" प्रदान की जाती है।',
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
            <FileText className="w-8 h-8 text-[var(--accent)]" />
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