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
          text: 'We collect information you provide directly, such as your name, email address, and birth details (date, time, and place of birth) needed to generate your charts and readings. We also collect usage data to improve our platform.',
        },
        {
          heading: '2. Payment Information (via Razorpay)',
          text: 'Payments on AstroVeda are processed by Razorpay, a third-party payment gateway. We do not store your card number, CVV, UPI credentials, or bank account details on our servers. Razorpay collects and processes your payment information in accordance with its own privacy policy, and we receive only the payment id, order id, and status needed to confirm your purchase and unlock your content.',
        },
        {
          heading: '3. How We Use Your Information',
          text: 'Your information is used to provide astrology readings, process payments, personalize your experience, and communicate with you about our services. We never sell your personal data to third parties.',
        },
        {
          heading: '4. AI Processing (Google Gemini)',
          text: 'To generate horoscopes, kundli narratives, chat responses, and other readings, we send relevant inputs (such as your birth details and questions) to Google Gemini, an AI service. Your data is processed by Google to produce the response and is handled according to Google\'s applicable terms and privacy policy. AI-generated content may contain inaccuracies — please see our Disclaimer page.',
        },
        {
          heading: '5. Data Security',
          text: 'We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits.',
        },
        {
          heading: '6. Your Rights',
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
          text: 'हम आपके द्वारा सीधे प्रदान की गई जानकारी एकत्र करते हैं, जैसे आपका नाम, ईमेल पता और जन्म विवरण (जन्म तिथि, समय और स्थान) जो आपकी कुंडली और रीडिंग बनाने के लिए आवश्यक हैं। हम अपने प्लेटफॉर्म को बेहतर बनाने के लिए उपयोग डेटा भी एकत्र करते हैं।',
        },
        {
          heading: '2. भुगतान जानकारी (Razorpay के माध्यम से)',
          text: 'AstroVeda पर भुगतान Razorpay, एक तृतीय-पक्ष भुगतान गेटवे द्वारा संसाधित किए जाते हैं। हम आपके कार्ड नंबर, CVV, UPI क्रेडेंशियल या बैंक खाता विवरण को अपने सर्वर पर संग्रहीत नहीं करते। Razorpay अपनी स्वयं की गोपनीयता नीति के अनुसार आपकी भुगतान जानकारी एकत्र और संसाधित करता है, और हमें केवल पेमेंट आईडी, ऑर्डर आईडी और स्थिति प्राप्त होती है जो आपकी खरीद की पुष्टि करने और आपकी सामग्री अनलॉक करने के लिए आवश्यक है।',
        },
        {
          heading: '3. हम आपकी जानकारी का उपयोग कैसे करते हैं',
          text: 'आपकी जानकारी का उपयोग ज्योतिष रीडिंग प्रदान करने, भुगतान संसाधित करने, आपके अनुभव को व्यक्तिगत बनाने और हमारी सेवाओं के बारे में आपसे संवाद करने के लिए किया जाता है। हम आपका व्यक्तिगत डेटा कभी भी तीसरे पक्ष को नहीं बेचते।',
        },
        {
          heading: '4. AI प्रोसेसिंग (Google Gemini)',
          text: 'राशिफल, कुंडली विवरण, चैट उत्तर और अन्य रीडिंग जनरेट करने के लिए, हम प्रासंगिक इनपुट (जैसे आपके जन्म विवरण और प्रश्न) Google Gemini को भेजते हैं, एक AI सेवा। आपका डेटा प्रतिक्रिया उत्पन्न करने के लिए Google द्वारा संसाधित किया जाता है और Google की लागू शर्तों और गोपनीयता नीति के अनुसार नियंत्रित होता है। AI-जनरेट की गई सामग्री में त्रुटियां हो सकती हैं — कृपया हमारा अस्वीकरण पृष्ठ देखें।',
        },
        {
          heading: '5. डेटा सुरक्षा',
          text: 'हम आपकी व्यक्तिगत जानकारी की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपाय लागू करते हैं, जिसमें एन्क्रिप्शन, सुरक्षित सर्वर और नियमित सुरक्षा ऑडिट शामिल हैं।',
        },
        {
          heading: '6. आपके अधिकार',
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