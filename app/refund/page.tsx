'use client';

import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function RefundPage() {
  const { language } = useLanguage();

  const content = {
    en: {
      title: 'Refund & Cancellation Policy',
      subtitle: 'How refunds and cancellations work for digital purchases and wallet top-ups.',
      lastUpdated: 'Last updated: August 2026',
      sections: [
        {
          heading: '1. Digital Goods Are Generally Non-Refundable',
          text: 'All products on AstroVeda are digital goods — astrology reports, AI chat credits, and similar content delivered instantly. Because these items are generated and delivered immediately, they are generally non-refundable once purchased, except where required by law or where a payment error has occurred.',
        },
        {
          heading: '2. Wallet Top-Ups',
          text: 'Wallet credits are used to pay for AI-powered features such as chat questions. Unused wallet balance may be refunded on request, reviewed case by case. If a charge was made in error or a top-up did not credit your wallet, contact us and we will make it right.',
        },
        {
          heading: '3. When We Do Refund',
          text: 'We will issue a refund where a payment was duplicated or charged incorrectly, where a purchased report or item could not be delivered due to a technical fault on our side, or where the law requires a refund. If the AI fails to deliver an answer, the charged credit is automatically returned to your wallet.',
        },
        {
          heading: '4. How to Request a Refund',
          text: 'To request a refund or cancellation, email support@astroveda.com from the email address used for the purchase, and include your payment id / order id. We typically respond within 5–7 business days. Approved refunds are processed back to the original payment method via Razorpay.',
        },
        {
          heading: '5. Cancellations',
          text: 'Because our products are digital and delivered instantly, you may not be able to cancel an order once it is completed. If you believe a charge was made by mistake, contact us as soon as possible and we will review your case.',
        },
      ],
    },
    hi: {
      title: 'रिफंड और रद्दीकरण नीति',
      subtitle: 'डिजिटल खरीदारी और वॉलेट टॉप-अप पर रिफंड और रद्दीकरण कैसे काम करते हैं।',
      lastUpdated: 'अंतिम अपडेट: अगस्त 2026',
      sections: [
        {
          heading: '1. डिजिटल सामग्री सामान्यतः गैर-रिफंडेबल है',
          text: 'AstroVeda पर सभी उत्पाद डिजिटल सामग्री हैं — ज्योतिष रिपोर्ट, AI चैट क्रेडिट और तुरंत डिलीवर होने वाली समान सामग्री। चूंकि ये आइटम तुरंत जनरेट और डिलीवर हो जाते हैं, इसलिए खरीद के बाद वे सामान्यतः रिफंडेबल नहीं होते, सिवाय जहां कानून इसकी अनुमति दे या भुगतान में त्रुटि हुई हो।',
        },
        {
          heading: '2. वॉलेट टॉप-अप',
          text: 'वॉलेट क्रेडिट का उपयोग AI-संचालित सुविधाओं जैसे चैट प्रश्नों के भुगतान के लिए किया जाता है। अप्रयुक्त वॉलेट शेष के लिए अनुरोध पर रिफंड किया जा सकता है, जिसकी समीक्षा मामले-दर-मामले की जाती है। यदि भुगतान गलती से हुआ है या टॉप-अप से आपका वॉलेट क्रेडिट नहीं हुआ, तो हमसे संपर्क करें — हम इसे ठीक करेंगे।',
        },
        {
          heading: '3. हम कब रिफंड करते हैं',
          text: 'हम तब रिफंड जारी करते हैं जब भुगतान दोहराया गया या गलत तरीके से लिया गया हो, जब खरीदी गई रिपोर्ट या आइटम हमारी ओर से तकनीकी खराबी के कारण डिलीवर नहीं हुआ हो, या जहां कानून रिफंड की अनुमति दे। यदि AI उत्तर देने में विफल रहता है, तो लिया गया क्रेडिट स्वचालित रूप से आपके वॉलेट में वापस कर दिया जाता है।',
        },
        {
          heading: '4. रिफंड कैसे अनुरोध करें',
          text: 'रिफंड या रद्दीकरण के लिए, उस ईमेल पते से support@astroveda.com पर ईमेल करें जिससे खरीद की गई थी, और अपना पेमेंट आईडी / ऑर्डर आईडी शामिल करें। हम आमतौर पर 5–7 कार्यदिवसों के भीतर जवाब देते हैं। स्वीकृत रिफंड Razorpay के माध्यम से मूल भुगतान विधि पर वापस किए जाते हैं।',
        },
        {
          heading: '5. रद्दीकरण',
          text: 'चूंकि हमारे उत्पाद डिजिटल हैं और तुरंत डिलीवर होते हैं, ऑर्डर पूरा होने के बाद आप इसे रद्द नहीं कर पाएंगे। यदि आपको लगता है कि भुगतान गलती से हुआ है, तो जल्द से जल्द हमसे संपर्क करें — हम आपके मामले की समीक्षा करेंगे।',
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
            <RotateCcw className="w-8 h-8 text-[var(--accent)]" />
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