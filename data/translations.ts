export type Language = 'en' | 'hi';

interface TranslationShape {
  nav: {
    home: string;
    dailyHoroscope: string;
    chat: string;
    about: string;
    contact: string;
    store: string;
    blog: string;
    social: string;
    kundali: string;
    matchmaking: string;
    horoscope: string;
    numerology: string;
    tarot: string;
    doshaChecker: string;
    more: string;
    signIn: string;
    askGuru: string;
  };
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    badge: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    ctaPrimary: string;
    ctaSecondary: string;
    matchmakingCta: string;
    trendingLabel: string;
    trending: { emoji: string; label: string }[];
  };
  chat: {
    title: string;
    subtitle: string;
    placeholder: string;
    send: string;
    loading: string;
    welcome: string;
    error: string;
    freeBanner: string;
    freeQuestionsLeft: string;
    walletBalance: string;
    addMoney: string;
    topUpTitle: string;
    topUpSubtitle: string;
    topUpQuickText: string;
    signInRequired: string;
    walletBalanceLabel: string;
    topUpNote: string;
    topUpMinAmount: string;
    topUpCustomLabel: string;
    topUpCustomPlaceholder: string;
    topUpPopular: string;
    topUpProceed: string;
    topUpQuestions: string;
    topUpInvalidAmount: string;
    pillRelationship: string;
    pillCommunication: string;
    pillPersonality: string;
  };
  horoscope: {
    title: string;
    subtitle: string;
    selectSign: string;
    reading: string;
    luckyNumber: string;
    luckyColor: string;
    luckyTime: string;
    mantra: string;
    rating: string;
    overall: string;
    career: string;
    love: string;
    health: string;
    finance: string;
  };
  about: {
    title: string;
    subtitle: string;
    mission: {
      title: string;
      text: string;
    };
    vision: {
      title: string;
      text: string;
    };
    values: {
      title: string;
      authenticity: string;
      accessibility: string;
      innovation: string;
      privacy: string;
    };
    team: {
      title: string;
      description: string;
    };
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    success: string;
    error: string;
    info: {
      title: string;
      email: string;
      phone: string;
      address: string;
    };
  };
  store: {
    title: string;
    subtitle: string;
    categories: {
      all: string;
      gemstones: string;
      yantras: string;
      books: string;
      rituals: string;
    };
    addToCart: string;
    outOfStock: string;
    price: string;
  };
  blog: {
    title: string;
    subtitle: string;
    readMore: string;
    publishedOn: string;
    by: string;
    categories: {
      career: string;
      love: string;
      health: string;
      spirituality: string;
      remedies: string;
    };
    relatedPosts: string;
    backToBlog: string;
  };
  social: {
    title: string;
    subtitle: string;
    followUs: string;
    joinCommunity: string;
    communityText: string;
    dailyUpdates: string;
    updatesText: string;
    newsletter: {
      title: string;
      subtitle: string;
      placeholder: string;
      subscribe: string;
    };
  };
  footer: {
    tagline: string;
    quickLinks: string;
    services: string;
    legal: string;
    privacy: string;
    terms: string;
    disclaimer: string;
    copyright: string;
    madeWith: string;
  };
  theme: {
    dark: string;
    golden: string;
    warm: string;
  };
  language: {
    en: string;
    hi: string;
  };
  kundali: {
    generateTitle: string;
    subtitle: string;
    fullName: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    dateOfBirth: string;
    timeOfBirth: string;
    timeUnknown: string;
    noonReferenceBadge: string;
    placeOfBirth: string;
    placePlaceholder: string;
    generateButton: string;
    backToForm: string;
    birthChart: string;
    generatedFor: string;
    coordinates: string;
    timeZone: string;
    ascendant: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    planetaryPositions: string;
    planet: string;
    sign: string;
    house: string;
    degree: string;
    status: string;
    retrograde: string;
    direct: string;
    downloadPDF: string;
    title: string;
    previewSection: string;
    tabs: {
      overview: string;
      charts: string;
      planets: string;
      dashas: string;
      predictions: string;
      remedies: string;
    };
    generating: string;
    dismissError: string;
    basicDetails: string;
    name: string;
    panchangSnapshot: string;
    tithi: string;
    vara: string;
    yoga: string;
    karana: string;
    unlockCharts: string;
    premiumPredictions: string;
    availableInPremium: string;
    career: string;
    marriage: string;
    wealth: string;
    health: string;
    education: string;
    family: string;
    dailyMantra: string;
    gemstoneSuggestion: string;
    northIndian: string;
    preview: {
      title: string;
      subtitle: string;
      lagna: string;
      moonSign: string;
      sunSign: string;
      nakshatra: string;
      currentDasha: string;
      yogas: string;
      yogaPlaceholder: string;
      lockedTitle: string;
      ctaUnlock: string;
      ctaProcessing: string;
    };
    errors: {
      selectDate: string;
      invalidDate: string;
      futureDate: string;
      selectTime: string;
      enterPlace: string;
      geocodePlace: string;
      network: string;
      generic: string;
      success: string;
    };
  };
  matchmaking: {
    badge: string;
    title: string;
    subtitle: string;
    boyDetails: string;
    girlDetails: string;
    namePlaceholder: string;
    dateOfBirth: string;
    timeOfBirth: string;
    timeUnknown: string;
    placeOfBirth: string;
    placePlaceholder: string;
    advancedToggle: string;
    advancedHide: string;
    moonSign: string;
    nakshatra: string;
    pada: string;
    checkCompatibility: string;
    calculating: string;
    gunas: string;
    checkAnother: string;
    breakdown: string;
    doshaAnalysis: string;
    remedy: string;
    excellent: string;
    good: string;
    average: string;
    challenging: string;
    knowYourPartner: string;
    affectionVenus: string;
    conflictMars: string;
    invitePartner: string;
    inviteSubtitle: string;
    copyLink: string;
    copied: string;
    shareWhatsApp: string;
  };
  loveMeter: {
    badge: string;
    title: string;
    subtitle: string;
    partnerOne: string;
    partnerTwo: string;
    namePlaceholder: string;
    birthDate: string;
    zodiacSign: string;
    selectSign: string;
    calculate: string;
    calculating: string;
    overall: string;
    compatibilityDetails: string;
    emotionalHarmony: string;
    communicationSynergy: string;
    physicalSpark: string;
    tryAnother: string;
  };
  dosha: {
    badge: string;
    title: string;
    subtitle: string;
    yourName: string;
    namePlaceholder: string;
    moonSign: string;
    marsSign: string;
    ascendant: string;
    checkButton: string;
    analyzing: string;
    doshasDetected: string;
    noMajorDoshas: string;
    remediesAvailable: string;
    chartClear: string;
    checkAnother: string;
    manglikTitle: string;
    sadeSatiTitle: string;
    affectedHouses: string;
    cancellationsApplied: string;
    remedies: string;
  };
  numerology: {
    badge: string;
    title: string;
    subtitle: string;
    fullName: string;
    namePlaceholder: string;
    dateOfBirth: string;
    day: string;
    month: string;
    year: string;
    calculate: string;
    calculating: string;
    profile: string;
    bornOn: string;
    luckyDay: string;
    luckyColors: string;
    luckyNumber: string;
    numberCompatibility: string;
    friendly: string;
    neutral: string;
    challenging: string;
    calculateAnother: string;
    destinyNumber: string;
    driverNumber: string;
    nameNumber: string;
    careerPaths: string;
    idealProfessions: string;
    loveCompatibility: string;
    recommendations: string;
    strengths: string;
    watchOut: string;
    luckyGemstone: string;
  };
  tarot: {
    badge: string;
    title: string;
    subtitle: string;
    chooseTopic: string;
    shuffle: string;
    shuffling: string;
    shuffleAgain: string;
    past: string;
    present: string;
    future: string;
    reversed: string;
    upright: string;
    tapToReveal: string;
    getInterpretation: string;
    consulting: string;
    yourReading: string;
    start: string;
  };
  horoscopePage: {
    title: string;
    subtitle: string;
    readToday: string;
    personalizedTitle: string;
    personalizedText: string;
    freeTitle: string;
    freeText: string;
    vedicTitle: string;
    vedicText: string;
  };
  horoscopeSign: {
    allSigns: string;
    title: string;
    subtitle: string;
    prediction: string;
    luckyColor: string;
    luckyNumber: string;
    luckyTime: string;
    categoryScores: string;
    yesterday: string;
    today: string;
    tomorrow: string;
    career: string;
    love: string;
    money: string;
    health: string;
    error: string;
  };
}

export const translations: Record<Language, TranslationShape> = {
  en: {
    nav: {
      home: 'Home',
      dailyHoroscope: 'Daily Horoscope',
      chat: 'AI Chat',
      about: 'About Us',
      contact: 'Contact',
      store: 'Store',
      blog: 'Blog',
      social: 'Social',
      kundali: 'Kundali',
      matchmaking: 'Matchmaking',
      horoscope: 'Horoscope',
      numerology: 'Numerology',
      tarot: 'Tarot',
      doshaChecker: 'Dosha Checker',
      more: 'More',
      signIn: 'Sign In',
      askGuru: 'Ask Guru',
    },
    hero: {
      title: 'Decode Your',
      titleHighlight: 'Cosmic Blueprint',
      subtitle: 'Ask about your career transits, relationship synergy, or Sade Sati in plain English.',
      badge: 'Ancient Vedic Math × Next-Gen AI',
      searchPlaceholder: 'e.g., When is my next career breakthrough? or Is 2026 good for job switch?',
      searchAriaLabel: 'Ask the AI Guru',
      ctaPrimary: 'Ask Guru',
      ctaSecondary: 'Talk to AI Guru',
      matchmakingCta: 'Check Couple Compatibility',
      trendingLabel: 'Trending:',
      trending: [
        { emoji: '💼', label: '2026 Job Switch Timing' },
        { emoji: '⚡', label: 'Sade Sati Impact' },
        { emoji: '❤️', label: 'Marriage & Mangal Dosha' },
        { emoji: '🔮', label: 'Current Mahadasha Meaning' },
      ],
    },
    chat: {
      title: 'AI Astrology Guru',
      subtitle: 'Ask anything about your stars, destiny, or spiritual journey',
      placeholder: 'Type your question about astrology, career, love, or life...',
      send: 'Send',
      loading: 'Consulting the stars...',
      welcome: 'Welcome! I am your AI Astrology Guru. Ask me about your horoscope, career, relationships, or any spiritual guidance you seek.',
      error: 'The cosmic connection is weak. Please try again.',
      freeBanner: '🎉 First 3 Kundali Questions Are 100% Free!',
      freeQuestionsLeft: 'Free Questions: {count}/3 Left',
      walletBalance: 'Wallet: ₹{amount}',
      addMoney: '+ Add Money',
      topUpTitle: 'Add Money to Wallet',
      topUpSubtitle: 'Each question costs ₹5. Choose an amount to top up your wallet.',
      topUpQuickText: 'Quick top-up amounts:',
      signInRequired: 'Please sign in to add money to your wallet.',
      walletBalanceLabel: 'Wallet Balance',
      topUpNote: '₹5 per question. Balance never expires.',
      topUpMinAmount: 'Minimum top-up is ₹20.',
      topUpCustomLabel: 'Custom Amount',
      topUpCustomPlaceholder: 'Enter amount (min ₹20)',
      topUpPopular: 'Most Popular',
      topUpProceed: 'Proceed to Pay',
      topUpQuestions: '{count} Questions',
      topUpInvalidAmount: 'Please enter a valid amount.',
      pillRelationship: '❤️ Relationship Future & Marriage',
      pillCommunication: '💬 Resolving Communication Issues',
      pillPersonality: '✨ Partner Personality & Love Style',
    },
    horoscope: {
      title: 'Daily Horoscope',
      subtitle: 'What do the stars have in store for you today?',
      selectSign: 'Select Your Zodiac Sign',
      reading: "Today's Reading",
      luckyNumber: 'Lucky Number',
      luckyColor: 'Lucky Color',
      luckyTime: 'Lucky Time',
      mantra: 'Mantra',
      rating: 'Rating',
      overall: 'Overall',
      career: 'Career',
      love: 'Love',
      health: 'Health',
      finance: 'Finance',
    },
    about: {
      title: 'About AstroVeda',
      subtitle: 'Bridging Ancient Wisdom with Modern Technology',
      mission: {
        title: 'Our Mission',
        text: 'To make authentic Vedic astrology accessible to everyone through the power of artificial intelligence and modern technology.',
      },
      vision: {
        title: 'Our Vision',
        text: 'A world where everyone can understand their cosmic blueprint and navigate life with confidence and clarity.',
      },
      values: {
        title: 'Our Values',
        authenticity: 'Authenticity in every reading',
        accessibility: 'Accessibility for all',
        innovation: 'Innovation with tradition',
        privacy: 'Privacy and trust',
      },
      team: {
        title: 'Our Team',
        description: 'A blend of experienced astrologers, data scientists, and spiritual guides.',
      },
    },
    contact: {
      title: 'Contact Us',
      subtitle: "We'd love to hear from you",
      name: 'Your Name',
      email: 'Email Address',
      subject: 'Subject',
      message: 'Your Message',
      send: 'Send Message',
      success: 'Message sent successfully!',
      error: 'Failed to send message. Please try again.',
      info: {
        title: 'Get in Touch',
        email: 'support@astroveda.com',
        phone: '+91 98765 43210',
        address: 'Mumbai, Maharashtra, India',
      },
    },
    store: {
      title: 'AstroVeda Store',
      subtitle: 'Spiritual products curated for your cosmic journey',
      categories: {
        all: 'All Products',
        gemstones: 'Gemstones',
        yantras: 'Yantras',
        books: 'Books',
        rituals: 'Ritual Items',
      },
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      price: 'Price',
    },
    blog: {
      title: 'Cosmic Insights',
      subtitle: 'Explore the mysteries of astrology and spirituality',
      readMore: 'Read More',
      publishedOn: 'Published on',
      by: 'by',
      categories: {
        career: 'Career',
        love: 'Love',
        health: 'Health',
        spirituality: 'Spirituality',
        remedies: 'Remedies',
      },
      relatedPosts: 'Related Posts',
      backToBlog: 'Back to Blog',
    },
    social: {
      title: 'Connect With Us',
      subtitle: 'Join our cosmic community across the universe',
      followUs: 'Follow Us',
      joinCommunity: 'Join Our Community',
      communityText: 'Connect with fellow astrology enthusiasts, share experiences, and learn together.',
      dailyUpdates: 'Daily Horoscope Updates',
      updatesText: 'Get your daily horoscope delivered to your favorite social platform.',
      newsletter: {
        title: 'Cosmic Newsletter',
        subtitle: 'Get weekly horoscope updates and spiritual insights',
        placeholder: 'Enter your email',
        subscribe: 'Subscribe',
      },
    },
    footer: {
      tagline: 'Guiding your cosmic journey with ancient wisdom and modern AI.',
      quickLinks: 'Quick Links',
      services: 'Services',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      disclaimer: 'Disclaimer',
      copyright: 'AstroVeda. All rights reserved.',
      madeWith: 'Made with',
    },
    theme: {
      dark: 'Dark',
      golden: 'Golden',
      warm: 'Warm',
    },
    language: {
      en: 'English',
      hi: 'हिन्दी',
    },
    kundali: {
      generateTitle: 'Generate Your Kundli',
      subtitle: 'Enter your birth details to generate a personalized Vedic birth chart with planetary positions and insights.',
      fullName: 'Full Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      dateOfBirth: 'Date of Birth',
      timeOfBirth: 'Time of Birth',
      timeUnknown: 'Time of birth unknown',
      noonReferenceBadge: 'Estimated chart calculated using noon reference time',
      placeOfBirth: 'Place of Birth',
      placePlaceholder: 'Enter city, town, or PIN code...',
      generateButton: 'Generate Kundli',
      backToForm: 'Back to Form',
      birthChart: 'Your Birth Chart',
      generatedFor: 'Generated for {name}',
      coordinates: 'Coordinates',
      timeZone: 'Time Zone',
      ascendant: 'Ascendant',
      moonSign: 'Moon Sign',
      sunSign: 'Sun Sign',
      nakshatra: 'Nakshatra',
      planetaryPositions: 'Planetary Positions',
      planet: 'Planet',
      sign: 'Sign',
      house: 'House',
      degree: 'Degree',
      status: 'Status',
      retrograde: 'Retrograde',
      direct: 'Direct',
      downloadPDF: 'Download PDF Report',
      title: 'Kundli',
      previewSection: 'Preview',
      tabs: {
        overview: 'Overview',
        charts: 'Charts',
        planets: 'Planets',
        dashas: 'Dashas',
        predictions: 'Predictions',
        remedies: 'Remedies',
      },
      generating: 'Generating your kundali...',
      dismissError: 'Dismiss error',
      basicDetails: 'Basic Kundli Details',
      name: 'Name',
      panchangSnapshot: 'Panchang Snapshot',
      tithi: 'Tithi',
      vara: 'Vara (Day)',
      yoga: 'Yoga',
      karana: 'Karana',
      unlockCharts: 'Preview - Unlock for D9, D10, D60 charts',
      premiumPredictions: 'Premium Predictions',
      availableInPremium: 'Available in Premium Report',
      career: 'Career',
      marriage: 'Marriage',
      wealth: 'Wealth',
      health: 'Health',
      education: 'Education',
      family: 'Family',
      dailyMantra: 'Daily Mantra',
      gemstoneSuggestion: 'Gemstone Suggestion',
            northIndian: 'North Indian',
      preview: {
        title: 'Limited Free Preview',
        subtitle: 'Key chart points and yogas — unlock full AI predictions',
        lagna: 'Lagna',
        moonSign: 'Moon Sign',
        sunSign: 'Sun Sign',
        nakshatra: 'Nakshatra',
        currentDasha: 'Current Dasha',
        yogas: 'Key Yogas',
        yogaPlaceholder: 'No major yogas detected.',
        lockedTitle: 'Unlock Full Prediction',
        ctaUnlock: '🔓 Unlock Full Kundali with AI Predictions - ₹99',
        ctaProcessing: 'Processing payment…',
      },
      errors: {
        selectDate: 'Please select your date of birth.',
        invalidDate: 'Please enter a valid date of birth.',
        futureDate: 'Date of birth cannot be in the future.',
        selectTime: 'Please select your time of birth, or tick "time unknown".',
        enterPlace: 'Please enter your place of birth.',
        geocodePlace: 'Please pick your birth place from the suggestions so we get accurate coordinates.',
        network: 'Network request failed. Please check your connection and try again.',
        generic: 'Failed to generate kundali. Please try again.',
        success: 'Your Kundli has been generated successfully! ✨',
      },
    },
    matchmaking: {
      badge: 'Kundali Milan · Ashtakoot Guna Milan',
      title: 'Kundali Matchmaking',
      subtitle: 'Compare two birth charts for marriage compatibility using the traditional Ashtakoot Guna Milan system (36 points).',
      boyDetails: "Boy's Details",
      girlDetails: "Girl's Details",
      namePlaceholder: 'Name (optional)',
      dateOfBirth: 'Date of Birth',
      timeOfBirth: 'Time of Birth',
      timeUnknown: 'Time of birth unknown',
      placeOfBirth: 'Place of Birth / City',
      placePlaceholder: 'e.g. New Delhi',
      advancedToggle: 'Advanced: I know my Rashi & Nakshatra',
      advancedHide: 'Hide Advanced Options',
      moonSign: 'Moon Sign (Rashi)',
      nakshatra: 'Nakshatra',
      pada: 'Pada (Quarter)',
      checkCompatibility: 'Check Compatibility',
      calculating: 'Calculating...',
      gunas: '/ 36 Gunas',
      checkAnother: 'Check Another Match',
      breakdown: 'Ashtakoot Guna Milan Breakdown',
      doshaAnalysis: 'Dosha Analysis',
      remedy: 'Remedy: ',
      excellent: 'Excellent Match',
      good: 'Good Match',
      average: 'Average Match',
      challenging: 'Challenging Match',
      knowYourPartner: 'Know Your Partner',
      affectionVenus: 'How They Express Affection',
      conflictMars: 'Conflict Resolution Tips',
      invitePartner: 'Invite Partner',
      inviteSubtitle: 'Share your matchmaking link with your partner on WhatsApp',
      copyLink: 'Copy Link',
      copied: 'Copied!',
      shareWhatsApp: 'Share on WhatsApp',
    },
    loveMeter: {
      badge: 'Cosmic Love Meter · Relationship Synergy',
      title: 'Cosmic Love Meter',
      subtitle: 'Discover your emotional, communication, and romantic chemistry with a personalized zodiac compatibility score.',
      partnerOne: 'Partner 1',
      partnerTwo: 'Partner 2',
      namePlaceholder: 'Name (optional)',
      birthDate: 'Birth Date (optional)',
      zodiacSign: 'Zodiac Sign',
      selectSign: 'Select a zodiac sign',
      calculate: 'Measure the Love',
      calculating: 'Reading the Stars...',
      overall: 'Overall Compatibility',
      compatibilityDetails: 'Compatibility Details',
      emotionalHarmony: 'Emotional Harmony',
      communicationSynergy: 'Communication Synergy',
      physicalSpark: 'Physical & Romantic Spark',
      tryAnother: 'Try Another Pair',
    },
    dosha: {
      badge: 'Manglik & Shani Sade Sati Checker',
      title: 'Dosha Checker',
      subtitle: 'Check for Mangal Dosha and Shani Sade Sati in your birth chart with detailed remedies.',
      yourName: 'Your Name (optional)',
      namePlaceholder: 'Enter your name',
      moonSign: 'Moon Sign (Rashi)',
      marsSign: 'Mars Sign (Placement)',
      ascendant: 'Ascendant (Lagna)',
      checkButton: 'Check My Doshas',
      analyzing: 'Analyzing Chart...',
      doshasDetected: 'Doshas Detected',
      noMajorDoshas: 'No Major Doshas',
      remediesAvailable: 'Remedies Available',
      chartClear: 'Your Chart is Clear',
      checkAnother: 'Check Another Chart',
      manglikTitle: 'Mangal Dosha (Manglik)',
      sadeSatiTitle: 'Shani Sade Sati',
      affectedHouses: 'Affected Houses:',
      cancellationsApplied: 'Cancellations Applied:',
      remedies: 'Remedies',
    },
    numerology: {
      badge: 'Vedic Numerology Calculator',
      title: 'Numerology',
      subtitle: 'Discover your Moolank, Bhagyank, and Namank — the sacred numbers revealed by your name and birth date.',
      fullName: 'Full Name (as per birth certificate)',
      namePlaceholder: 'e.g. Rahul Sharma',
      dateOfBirth: 'Date of Birth',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      calculate: 'Calculate My Numbers',
      calculating: 'Calculating...',
      profile: 'Your Numerology Profile',
      bornOn: 'Born on {date}',
      luckyDay: 'Lucky Day',
      luckyColors: 'Lucky Colors',
      luckyNumber: 'Lucky Number',
      numberCompatibility: 'Number Compatibility',
      friendly: 'Friendly',
      neutral: 'Neutral',
      challenging: 'Challenging',
      calculateAnother: 'Calculate Another',
      destinyNumber: 'Destiny Number',
      driverNumber: 'Birth / Driver Number',
      nameNumber: 'Name Number',
      careerPaths: 'Career Paths',
      idealProfessions: 'Ideal Professions',
      loveCompatibility: 'Best Love Compatibility',
      recommendations: 'Personalized Remedies & Recommendations',
      strengths: 'Strengths',
      watchOut: 'Watch Out',
      luckyGemstone: 'Lucky Gemstone',
    },
    tarot: {
      badge: 'Free 3-Card Tarot Reading',
      title: 'Tarot Card Reading',
      subtitle: 'Draw three cards to reveal insights about your past, present, and future. Choose a topic to focus your reading.',
      chooseTopic: 'Choose Your Topic',
      shuffle: 'Shuffle & Draw Cards',
      shuffling: 'Shuffling...',
      shuffleAgain: 'Shuffle Again',
      past: 'Past',
      present: 'Present',
      future: 'Future / Outcome',
      reversed: 'Reversed',
      upright: 'Upright',
      tapToReveal: 'Tap to reveal',
      getInterpretation: 'Get AI Interpretation',
      consulting: 'Consulting the Stars...',
      yourReading: 'Your Reading',
      start: 'Click "Shuffle & Draw Cards" to begin your reading',
    },
    horoscopePage: {
      title: 'Daily Horoscope',
      subtitle: "Select your zodiac sign to read today's Vedic astrology prediction with lucky attributes and category scores.",
      readToday: 'Read Today',
      personalizedTitle: '✨ Personalized Guidance',
      personalizedText: 'Our AI Guru analyzes planetary positions to give you specific daily advice for career, love, money, and health.',
      freeTitle: '🆓 100% Free',
      freeText: 'Check your lucky color, number, and time every day without any subscription.',
      vedicTitle: '🕉️ Vedic Wisdom',
      vedicText: 'Traditional Indian astrology principles meet modern AI technology for accurate guidance.',
    },
    horoscopeSign: {
      allSigns: 'All Signs',
      title: '{sign} Horoscope',
      subtitle: 'Daily Vedic astrology guidance for {sign}',
      prediction: '{period} Prediction',
      luckyColor: 'Lucky Color',
      luckyNumber: 'Lucky Number',
      luckyTime: 'Lucky Time',
      categoryScores: 'Category Scores',
      yesterday: 'Yesterday',
      today: 'Today',
      tomorrow: 'Tomorrow',
      career: 'Career',
      love: 'Love',
      money: 'Money',
      health: 'Health',
      error: 'Unable to load horoscope. Please try again.',
    },
  },
  hi: {
    nav: {
      home: 'होम',
      dailyHoroscope: 'दैनिक राशिफल',
      chat: 'AI चैट',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      store: 'स्टोर',
      blog: 'ब्लॉग',
      social: 'सोशल',
      kundali: 'कुंडली',
      matchmaking: 'कुंडली मिलान',
      horoscope: 'राशिफल',
      numerology: 'अंक ज्योतिष',
      tarot: 'टैरो',
      doshaChecker: 'दोष जांच',
      more: 'और',
      signIn: 'साइन इन',
      askGuru: 'गुरु से पूछें',
    },
    hero: {
      title: 'अपने ब्रह्मांडीय ब्लूप्रिंट को',
      titleHighlight: 'डिकोड करें',
      subtitle: 'अपने करियर ग्रहों, रिश्ते की संगति, या साढ़े साती के बारे में साधारण भाषा में पूछें।',
      badge: 'प्राचीन वैदिक गणित × अगली पीढ़ी का AI',
      searchPlaceholder: 'जैसे, मेरा अगला करियर ब्रेकट्रूढ़ कब है? या क्या 2026 में नौकरी बदलना उपयोगी रहेगा?',
      searchAriaLabel: 'AI गुरु से पूछें',
      ctaPrimary: 'गुरु से पूछें',
      ctaSecondary: 'AI गुरु से बात करें',
      matchmakingCta: 'कुंडली मिलान जांचें',
      trendingLabel: 'ट्रेंडिंग:',
      trending: [
        { emoji: '💼', label: '2026 में नौकरी बदलने का समय' },
        { emoji: '⚡', label: 'साढ़े साती का प्रभाव' },
        { emoji: '❤️', label: 'विवाह और मंगल दोष' },
        { emoji: '🔮', label: 'वर्तमान महादशा का अर्थ' },
      ],
    },
    chat: {
      title: 'AI ज्योतिष गुरु',
      subtitle: 'अपने सितारों, भाग्य या आध्यात्मिक यात्रा के बारे में कुछ भी पूछें',
      placeholder: 'ज्योतिष, करियर, प्रेम या जीवन के बारे में अपना प्रश्न टाइप करें...',
      send: 'भेजें',
      loading: 'सितारों से परामर्श कर रहा है...',
      welcome: 'स्वागत है! मैं आपका AI ज्योतिष गुरु हूँ। मुझसे अपने राशिफल, करियर, रिश्तों या किसी भी आध्यात्मिक मार्गदर्शन के बारे में पूछें।',
      error: 'ब्रह्मांडीय संबंध कमजोर है। कृपया पुनः प्रयास करें।',
      freeBanner: '🎉 पहले 3 कुंडली प्रश्न 100% मुफ्त हैं!',
      freeQuestionsLeft: 'मुफ्त प्रश्न: {count}/3 बाकी',
      walletBalance: 'वॉलेट: ₹{amount}',
      addMoney: '+ पैसे जोड़ें',
      topUpTitle: 'वॉलेट में पैसे जोड़ें',
      topUpSubtitle: 'प्रत्येक प्रश्न की कीमत ₹5 है। अपना वॉलेट टॉप-अप करने के लिए राशि चुनें।',
      topUpQuickText: 'त्वरित टॉप-अप राशियाँ:',
      signInRequired: 'वॉलेट में पैसे जोड़ने के लिए कृपया साइन इन करें।',
      walletBalanceLabel: 'वॉलेट बैलेंस',
      topUpNote: '₹5 प्रति प्रश्न। बैलेंस कभी समाप्त नहीं होता।',
      topUpMinAmount: 'न्यूनतम टॉप-अप ₹20 है।',
      topUpCustomLabel: 'अपनी राशि दर्ज करें',
      topUpCustomPlaceholder: 'राशि दर्ज करें (न्यूनतम ₹20)',
      topUpPopular: 'सबसे लोकप्रिय',
      topUpProceed: 'भुगतान के लिए आगे बढ़ें',
      topUpQuestions: '{count} प्रश्न',
      topUpInvalidAmount: 'कृपया मान्य राशि दर्ज करें।',
      pillRelationship: '❤️ रिश्ते का भविष्य और विवाह',
      pillCommunication: '💬 संचार समस्याओं का समाधान',
      pillPersonality: '✨ साथी का व्यक्तित्व और प्रेम शैली',
    },
    horoscope: {
      title: 'दैनिक राशिफल',
      subtitle: 'आज सितारे आपके लिए क्या लाए हैं?',
      selectSign: 'अपनी राशि चुनें',
      reading: 'आज की भविष्यवाणी',
      luckyNumber: 'भाग्यशाली संख्या',
      luckyColor: 'भाग्यशाली रंग',
      luckyTime: 'भाग्यशाली समय',
      mantra: 'मंत्र',
      rating: 'रेटिंग',
      overall: 'समग्र',
      career: 'करियर',
      love: 'प्रेम',
      health: 'स्वास्थ्य',
      finance: 'वित्त',
    },
    about: {
      title: 'AstroVeda के बारे में',
      subtitle: 'प्राचीन ज्ञान को आधुनिक तकनीक के साथ जोड़ना',
      mission: {
        title: 'हमारा मिशन',
        text: 'कृत्रिम बुद्धिमत्ता और आधुनिक तकनीक की शक्ति के माध्यम से प्रामाणिक वैदिक ज्योतिष को सभी के लिए सुलभ बनाना।',
      },
      vision: {
        title: 'हमारा दृष्टिकोण',
        text: 'एक ऐसी दुनिया जहाँ हर कोई अपने ब्रह्मांडीय ब्लूप्रिंट को समझ सके और आत्मविश्वास और स्पष्टता के साथ जीवन का नेतृत्व कर सके।',
      },
      values: {
        title: 'हमारे मूल्य',
        authenticity: 'हर रीडिंग में प्रामाणिकता',
        accessibility: 'सभी के लिए सुलभता',
        innovation: 'परंपरा के साथ नवीनता',
        privacy: 'गोपनीयता और विश्वास',
      },
      team: {
        title: 'हमारी टीम',
        description: 'अनुभवी ज्योतिषियों, डेटा वैज्ञानिकों और आध्यात्मिक मार्गदर्शकों का मिश्रण।',
      },
    },
    contact: {
      title: 'संपर्क करें',
      subtitle: 'हम आपसे सुनना पसंद करेंगे',
      name: 'आपका नाम',
      email: 'ईमेल पता',
      subject: 'विषय',
      message: 'आपका संदेश',
      send: 'संदेश भेजें',
      success: 'संदेश सफलतापूर्वक भेजा गया!',
      error: 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।',
      info: {
        title: 'संपर्क में रहें',
        email: 'support@astroveda.com',
        phone: '+91 98765 43210',
        address: 'मुंबई, महाराष्ट्र, भारत',
      },
    },
    store: {
      title: 'AstroVeda स्टोर',
      subtitle: 'आपकी ब्रह्मांडीय यात्रा के लिए क्यूरेटेड आध्यात्मिक उत्पाद',
      categories: {
        all: 'सभी उत्पाद',
        gemstones: 'रत्न',
        yantras: 'यंत्र',
        books: 'पुस्तकें',
        rituals: 'अनुष्ठान सामग्री',
      },
      addToCart: 'कार्ट में जोड़ें',
      outOfStock: 'स्टॉक में नहीं',
      price: 'मूल्य',
    },
    blog: {
      title: 'ब्रह्मांडीय अंतर्दृष्टि',
      subtitle: 'ज्योतिष और आध्यात्मिकता के रहस्यों का अन्वेषण करें',
      readMore: 'और पढ़ें',
      publishedOn: 'प्रकाशित तिथि',
      by: 'द्वारा',
      categories: {
        career: 'करियर',
        love: 'प्रेम',
        health: 'स्वास्थ्य',
        spirituality: 'आध्यात्मिकता',
        remedies: 'उपाय',
      },
      relatedPosts: 'संबंधित पोस्ट',
      backToBlog: 'ब्लॉग पर वापस जाएं',
    },
    social: {
      title: 'हमसे जुड़ें',
      subtitle: 'ब्रह्मांड में हमारी ब्रह्मांडीय समुदाय से जुड़ें',
      followUs: 'हमें फॉलो करें',
      joinCommunity: 'हमारी समुदाय में शामिल हों',
      communityText: 'साथी ज्योतिष उत्साहियों से जुड़ें, अनुभव साझा करें, और एक साथ सीखें।',
      dailyUpdates: 'दैनिक राशिफल अपडेट',
      updatesText: 'अपने पसंदीदा सोशल प्लेटफॉर्म पर अपना दैनिक राशिफल प्राप्त करें।',
      newsletter: {
        title: 'ब्रह्मांडीय न्यूज़लेटर',
        subtitle: 'साप्ताहिक राशिफल अपडेट और आध्यात्मिक अंतर्दृष्टि प्राप्त करें',
        placeholder: 'अपना ईमेल दर्ज करें',
        subscribe: 'सब्सक्राइब करें',
      },
    },
    footer: {
      tagline: 'प्राचीन ज्ञान और आधुनिक AI के साथ आपकी ब्रह्मांडीय यात्रा का मार्गदर्शन।',
      quickLinks: 'त्वरित लिंक',
      services: 'सेवाएं',
      legal: 'कानूनी',
      privacy: 'गोपनीयता नीति',
      terms: 'सेवा की शर्तें',
      disclaimer: 'अस्वीकरण',
      copyright: 'AstroVeda. सर्वाधिकार सुरक्षित।',
      madeWith: 'के साथ बनाया गया',
    },
    theme: {
      dark: 'डार्क',
      golden: 'गोल्डन',
      warm: 'वार्म',
    },
    language: {
      en: 'English',
      hi: 'हिन्दी',
    },
    kundali: {
      generateTitle: 'अपनी कुंडली बनाएं',
      subtitle: 'ग्रहों की स्थिति और अंतर्दृष्टि के साथ व्यक्तिगत वैदिक जन्म कुंडली बनाने के लिए अपनी जन्म जानकारी दर्ज करें।',
      fullName: 'पूरा नाम',
      namePlaceholder: 'अपना पूरा नाम दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'your@email.com',
      dateOfBirth: 'जन्म तिथि',
      timeOfBirth: 'जन्म समय',
      timeUnknown: 'जन्म समय अज्ञात है',
      noonReferenceBadge: 'दोपहर संदर्भ समय का उपयोग कर आकलित चार्ट',
      placeOfBirth: 'जन्म स्थान',
      placePlaceholder: 'शहर, कस्बा या पिन कोड दर्ज करें...',
      generateButton: 'कुंडली बनाएं',
      backToForm: 'फॉर्म पर वापस जाएं',
      birthChart: 'आपकी जन्म कुंडली',
      generatedFor: '{name} के लिए बनाई गई',
      coordinates: 'निर्देशांक',
      timeZone: 'समय क्षेत्र',
      ascendant: 'लग्न',
      moonSign: 'चंद्र राशि',
      sunSign: 'सूर्य राशि',
      nakshatra: 'नक्षत्र',
      planetaryPositions: 'ग्रहों की स्थिति',
      planet: 'ग्रह',
      sign: 'राशि',
      house: 'भाव',
      degree: 'अंश',
      status: 'स्थिति',
      retrograde: 'वक्री',
      direct: 'सीधा',
      downloadPDF: 'PDF रिपोर्ट डाउनलोड करें',
      title: 'कुंडली',
      previewSection: 'पूर्वावलोकन',
      tabs: {
        overview: 'अवलोकन',
        charts: 'चार्ट',
        planets: 'ग्रह',
        dashas: 'दशा',
        predictions: 'भविष्यवाणियां',
        remedies: 'उपाय',
      },
      generating: 'कुंडली बनाई जा रही है...',
      dismissError: 'त्रुटि बंद करें',
      basicDetails: 'मूल कुंडली विवरण',
      name: 'नाम',
      panchangSnapshot: 'पंचांग स्नैपशॉट',
      tithi: 'तिथि',
      vara: 'वार (दिन)',
      yoga: 'योग',
      karana: 'करण',
      unlockCharts: 'पूर्वावलोकन — D9, D10, D60 चार्ट के लिए अनलॉक करें',
      premiumPredictions: 'प्रीमियम भविष्यवाणियाँ',
      availableInPremium: 'प्रीमियम रिपोर्ट में उपलब्ध',
      career: 'करियर',
      marriage: 'विवाह',
      wealth: 'धन',
      health: 'स्वास्थ्य',
      education: 'शिक्षा',
      family: 'परिवार',
      dailyMantra: 'दैनिक मंत्र',
      gemstoneSuggestion: 'रत्न सुझाव',
            northIndian: 'उत्तर भारतीय',
      preview: {
        title: 'सीमित मुफ़्त पूर्वावलोकन',
        subtitle: 'मुख्य चार्ट बिंदु और योग — पूरी एआई भविष्यवाणी अनलॉक करें',
        lagna: 'लग्न',
        moonSign: 'चंद्र राशि',
        sunSign: 'सूर्य राशि',
        nakshatra: 'नक्षत्र',
        currentDasha: 'वर्तमान दशा',
        yogas: 'प्रमुख योग',
        yogaPlaceholder: 'कोई प्रमुख योग नहीं पाया गया।',
        lockedTitle: 'पूरी भविष्यवाणी अनलॉक करें',
        ctaUnlock: '🔓 पूरी कुंडली एआई भविष्यवाणी अनलॉक करें - ₹99',
        ctaProcessing: 'भुगतान संसाधित हो रहा है...',
      },
      errors: {
        selectDate: 'कृपया जन्म तिथि चुनें।',
        invalidDate: 'कृपया मान्य जन्म तिथि दर्ज करें।',
        futureDate: 'जन्म तिथि भविष्य में नहीं हो सकती।',
        selectTime: 'कृपया जन्म समय चुनें या "समय अज्ञात" चुनें।',
        enterPlace: 'कृपया जन्म स्थान दर्ज करें।',
        geocodePlace: 'कृपया सुझावों में से अपना जन्म स्थान चुनें ताकि सही निर्देशांक मिल सकें।',
        network: 'नेटवर्क कनेक्शन उपलब्ध नहीं है। कृपया अपना इंटरनेट जांचें और पुनः प्रयास करें।',
        generic: 'कुंडली बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।',
        success: 'आपकी कुंडली सफलतापूर्वक तैयार हो गई है! ✨',
      },
    },
    matchmaking: {
      badge: 'कुंडली मिलान · अष्टकूट गुण मिलान',
      title: 'कुंडली मिलान',
      subtitle: 'पारंपरिक अष्टकूट गुण मिलान प्रणाली (36 अंक) का उपयोग करके विवाह अनुकूलता के लिए दो जन्म कुंडलियों की तुलना करें।',
      boyDetails: "लड़के का विवरण",
      girlDetails: "लड़की का विवरण",
      namePlaceholder: 'नाम (वैकल्पिक)',
      dateOfBirth: 'जन्म तिथि',
      timeOfBirth: 'जन्म समय',
      timeUnknown: 'जन्म समय अज्ञात है',
      placeOfBirth: 'जन्म स्थान / शहर',
      placePlaceholder: 'जैसे नई दिल्ली',
      advancedToggle: 'उन्नत: मुझे अपनी राशि और नक्षत्र पता है',
      advancedHide: 'उन्नत विकल्प छिपाएं',
      moonSign: 'चंद्र राशि',
      nakshatra: 'नक्षत्र',
      pada: 'चरण (पाद)',
      checkCompatibility: 'अनुकूलता जांचें',
      calculating: 'गणना हो रही है...',
      gunas: '/ 36 गुण',
      checkAnother: 'दूसरा मिलान जांचें',
      breakdown: 'अष्टकूट गुण मिलान विवरण',
      doshaAnalysis: 'दोष विश्लेषण',
      remedy: 'उपाय: ',
      excellent: 'उत्कृष्ट मिलान',
      good: 'अच्छा मिलान',
      average: 'औसत मिलान',
      challenging: 'चुनौतीपूर्ण मिलान',
      knowYourPartner: 'अपने साथी को जानें',
      affectionVenus: 'वे स्नेह कैसे व्यक्त करते हैं',
      conflictMars: 'विवाद समाधान के उपाय',
      invitePartner: 'साथी को आमंत्रित करें',
      inviteSubtitle: 'अपना मिलान लिंक व्हाट्सएप पर साझा करें',
      copyLink: 'लिंक कॉपी करें',
      copied: 'कॉपी हो गया!',
      shareWhatsApp: 'व्हाट्सएप पर साझा करें',
    },
    loveMeter: {
      badge: 'कॉस्मिक लव मीटर · रिश्तों की संगति',
      title: 'कॉस्मिक लव मीटर',
      subtitle: 'व्यक्तिगत राशि अनुकूलता स्कोर के साथ अपनी भावनात्मक, संचार और रोमांटिक केमिस्ट्री खोजें।',
      partnerOne: 'पहला साथी',
      partnerTwo: 'दूसरा साथी',
      namePlaceholder: 'नाम (वैकल्पिक)',
      birthDate: 'जन्म तिथि (वैकल्पिक)',
      zodiacSign: 'राशि',
      selectSign: 'राशि चुनें',
      calculate: 'प्रेम मापें',
      calculating: 'सितारे पढ़ रहे हैं...',
      overall: 'कुल अनुकूलता',
      compatibilityDetails: 'अनुकूलता विवरण',
      emotionalHarmony: 'भावनात्मक सामंजस्य',
      communicationSynergy: 'संचार तालमेल',
      physicalSpark: 'शारीरिक और रोमांटिक चिंगारी',
      tryAnother: 'दूसरी जोड़ी आजमाएं',
    },
    dosha: {
      badge: 'मांगलिक और शनि साढ़े साती जांच',
      title: 'दोष जांच',
      subtitle: 'अपनी जन्म कुंडली में मांगल दोष और शनि साढ़े साती की जांच विस्तृत उपायों के साथ करें।',
      yourName: 'आपका नाम (वैकल्पिक)',
      namePlaceholder: 'अपना नाम दर्ज करें',
      moonSign: 'चंद्र राशि',
      marsSign: 'मंगल राशि (स्थिति)',
      ascendant: 'लग्न',
      checkButton: 'मेरे दोष जांचें',
      analyzing: 'कुंडली का विश्लेषण हो रहा है...',
      doshasDetected: 'दोष पाए गए',
      noMajorDoshas: 'कोई प्रमुख दोष नहीं',
      remediesAvailable: 'उपाय उपलब्ध हैं',
      chartClear: 'आपकी कुंडली स्पष्ट है',
      checkAnother: 'दूसरी कुंडली जांचें',
      manglikTitle: 'मांगल दोष (मांगलिक)',
      sadeSatiTitle: 'शनि साढ़े साती',
      affectedHouses: 'प्रभावित भाव:',
      cancellationsApplied: 'लागू निरस्तीकरण:',
      remedies: 'उपाय',
    },
    numerology: {
      badge: 'वैदिक अंक ज्योतिष कैलकुलेटर',
      title: 'अंक ज्योतिष',
      subtitle: 'अपने मूलांक, भाग्यांक और नामांक की खोज करें — आपके नाम और जन्म तिथि से प्रकट होने वाली पवित्र संख्याएं।',
      fullName: 'पूरा नाम (जन्म प्रमाण पत्र के अनुसार)',
      namePlaceholder: 'जैसे राहुल शर्मा',
      dateOfBirth: 'जन्म तिथि',
      day: 'दिन',
      month: 'महीना',
      year: 'वर्ष',
      calculate: 'मेरी संख्याएं निकालें',
      calculating: 'गणना हो रही है...',
      profile: 'आपकी अंक ज्योतिष प्रोफ़ाइल',
      bornOn: '{date} को जन्मे',
      luckyDay: 'भाग्यशाली दिन',
      luckyColors: 'भाग्यशाली रंग',
      luckyNumber: 'भाग्यशाली संख्या',
      numberCompatibility: 'संख्या अनुकूलता',
      friendly: 'अनुकूल',
      neutral: 'तटस्थ',
      challenging: 'चुनौतीपूर्ण',
      calculateAnother: 'दूसरी गणना करें',
      destinyNumber: 'भाग्यांक',
      driverNumber: 'जन्म / मूलांक',
      nameNumber: 'नामांक',
      careerPaths: 'करियर पथ',
      idealProfessions: 'आदर्श व्यवसाय',
      loveCompatibility: 'सर्वश्रेष्ठ प्रेम अनुकूलता',
      recommendations: 'व्यक्तिगत उपाय और सिफारिशें',
      strengths: 'ताकत',
      watchOut: 'सावधान रहें',
      luckyGemstone: 'भाग्यशाली रत्न',
    },
    tarot: {
      badge: 'मुफ्त 3-कार्ड टैरो रीडिंग',
      title: 'टैरो कार्ड रीडिंग',
      subtitle: 'अपने अतीत, वर्तमान और भविष्य के बारे में अंतर्दृष्टि प्रकट करने के लिए तीन कार्ड निकालें। अपनी रीडिंग केंद्रित करने के लिए एक विषय चुनें।',
      chooseTopic: 'अपना विषय चुनें',
      shuffle: 'कार्ड फेरें और निकालें',
      shuffling: 'कार्ड फेरा जा रहा है...',
      shuffleAgain: 'फिर से फेरें',
      past: 'अतीत',
      present: 'वर्तमान',
      future: 'भविष्य / परिणाम',
      reversed: 'उल्टा',
      upright: 'सीधा',
      tapToReveal: 'प्रकट करने के लिए दबाएं',
      getInterpretation: 'AI व्याख्या प्राप्त करें',
      consulting: 'सितारों से परामर्श...',
      yourReading: 'आपकी रीडिंग',
      start: 'अपनी रीडिंग शुरू करने के लिए "कार्ड फेरें और निकालें" पर क्लिक करें',
    },
    horoscopePage: {
      title: 'दैनिक राशिफल',
      subtitle: 'भाग्यशाली विशेषताओं और श्रेणी स्कोर के साथ आज का वैदिक ज्योतिष पूर्वानुमान पढ़ने के लिए अपनी राशि चुनें।',
      readToday: 'आज पढ़ें',
      personalizedTitle: '✨ व्यक्तिगत मार्गदर्शन',
      personalizedText: 'हमारा AI गुरु करियर, प्रेम, धन और स्वास्थ्य के लिए आपको विशिष्ट दैनिक सलाह देने के लिए ग्रहों की स्थिति का विश्लेषण करता है।',
      freeTitle: '🆓 100% मुफ्त',
      freeText: 'बिना किसी सदस्यता के हर दिन अपना भाग्यशाली रंग, संख्या और समय जांचें।',
      vedicTitle: '🕉️ वैदिक ज्ञान',
      vedicText: 'पारंपरिक भारतीय ज्योतिष सिद्धांत सटीक मार्गदर्शन के लिए आधुनिक AI तकनीक से मिलते हैं।',
    },
    horoscopeSign: {
      allSigns: 'सभी राशियां',
      title: '{sign} राशिफल',
      subtitle: '{sign} के लिए दैनिक वैदिक ज्योतिष मार्गदर्शन',
      prediction: '{period} भविष्यवाणी',
      luckyColor: 'भाग्यशाली रंग',
      luckyNumber: 'भाग्यशाली संख्या',
      luckyTime: 'भाग्यशाली समय',
      categoryScores: 'श्रेणी स्कोर',
      yesterday: 'कल',
      today: 'आज',
      tomorrow: 'कल',
      career: 'करियर',
      love: 'प्रेम',
      money: 'धन',
      health: 'स्वास्थ्य',
      error: 'राशिफल लोड करने में असमर्थ। कृपया पुनः प्रयास करें।',
    },
  },
};

export type Translations = TranslationShape;

export function getTranslation(lang: Language): Translations {
  return translations[lang];
}