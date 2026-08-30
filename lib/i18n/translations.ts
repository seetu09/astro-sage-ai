"use client";

export type Language = 'en' | 'hi';

export interface Translations {
  // Common sections
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
    toggleMenu: string;
    toggleLanguage: string;
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
    clearChat: string;
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
    mission: { title: string; text: string };
    vision: { title: string; text: string };
    values: {
      title: string;
      authenticity: string;
      accessibility: string;
      innovation: string;
      privacy: string;
    };
    team: { title: string; description: string };
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
    info: { title: string; email: string; phone: string; address: string };
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
    followers: string;
    newsletter: { title: string; subtitle: string; placeholder: string; subscribe: string };
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
  installBanner: {
    title: string;
    subtitle: string;
    action: string;
    instructions: string;
  };
  auth: {
    titleLogin: string;
    titleRegister: string;
    titleProfile: string;
    titleForgot: string;
    titlePhone: string;
    titlePhoneVerify: string;
    labelBirthDate: string;
    labelBirthTime: string;
    labelBirthPlace: string;
    placeholderBirthPlace: string;
    labelPhoneNumber: string;
    placeholderPhone: string;
    labelOtp: string;
    placeholderOtp: string;
    placeholderFullName: string;
    placeholderEmail: string;
    placeholderPassword: string;
    ariaHidePassword: string;
    ariaShowPassword: string;
    ariaToggleMenu: string;
    buttonSaving: string;
    buttonSaveProfile: string;
    buttonSignOut: string;
    buttonContinueGoogle: string;
    buttonContinuePhone: string;
    buttonSending: string;
    buttonSendOtp: string;
    buttonVerifying: string;
    buttonVerifyAndSignIn: string;
    buttonSendResetLink: string;
    buttonPleaseWait: string;
    labelResendIn: string;
    buttonResendOtp: string;
    linkForgotPassword: string;
    linkBackToLogin: string;
    textNoAccount: string;
    linkSignUp: string;
    textHaveAccount: string;
    linkSignIn: string;
    dividerText: string;
    successPasswordReset: string;
    successOtpSent: string;
      successOtpResent: string;
      errorSomethingWentWrong: string;
    };
    birthDetails: {
      personalizing: string;
      revealReading: string;
      formSubtitle: string;
      calibrating: string;
      labelName: string;
      labelDob: string;
      labelTime: string;
      labelPlace: string;
      checkboxTimeUnknown: string;
      placeholderName: string;
      placeholderPlace: string;
      submitLoading: string;
      submitReveal: string;
      privacyNote: string;
      ariaClose: string;
    };
    common: {
      empty: string;
      emptyDesc: string;
      error: string;
      errorDesc: string;
      noResults: string;
      noResultsDesc: string;
      noMessages: string;
      noMessagesDesc: string;
      noData: string;
      noDataDesc: string;
      goBack: string;
      tryAgain: string;
      searching: string;
      notFound: string;
      vedicBirthChart: string;
      northIndianStyle: string;
      lagna: string;
      noPlanetsHere: string;
       notAvailable: string;
      orderId: string;
      paymentId: string;
      close: string;
      dismissNotification: string;
      logout: string;
      userProfileMenu: string;
      profileSections: string;
    };
    placeSearch: {
      placeholder: string;
      latitude: string;
      longitude: string;
      useTyped: string;
      countries: { code: string; en: string; hi: string }[];
    };
    pwa: {
      installTitle: string;
      addToHome: string;
      promptDesc: string;
      installButton: string;
    };
    report: {
      footerMark: string;
      period: string;
      event: string;
      outlook: string;
      page: string;
      of: string;
    };
    preview: {
    title: string;
    lagna: string;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    currentDasha: string;
    yogas: string;
    unlockButton: string;
    basicDetails: string;
    detailedInsights: string;
    teaser: { career: string; marriage: string; health: string };
    kundaliAwaitsTitle: string;
    kundaliAwaitsSubtitle: string;
    kundaliAwaitsCta: string;
    kundaliAwaitsHint: string;
    kundaliAwaitsBadge: string;
    kundaliAwaitsFeaturePlanets: string;
    kundaliAwaitsFeatureDasha: string;
    kundaliAwaitsFeatureYogas: string;
    kundaliAwaitsFeaturePdf: string;
  };
  kundali: {
    labels: {
      generateKundli: string;
      birthDetails: string;
      chart: string;
      predictions: string;
      planets: string;
      houses: string;
      yogas: string;
      dasha: string;
      report: string;
      premium: string;
      free: string;
    };
    planets: {
      jupiter: string;
      saturn: string;
      mars: string;
      mercury: string;
      venus: string;
      moon: string;
      sun: string;
      rahu: string;
      ketu: string;
    };
    signs: {
      aquarius: string;
      scorpio: string;
      pisces: string;
      aries: string;
      taurus: string;
      gemini: string;
      cancer: string;
      leo: string;
      virgo: string;
      libra: string;
      sagittarius: string;
      capricorn: string;
    };
    generatedFor: string;
    basicDetails: string;
    currentDasha: string;
    keyYogas: string;
    detailedInsights: string;
    basicKundliDetails: string;
    panchangSnapshot: string;
    generateTitle: string;
    subtitle: string;
    fullName: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    dateOfBirth: string;
    timeOfBirth: string;
    timeUnknown: string;
    noonReferenceBadge: string;
    placeOfBirth: string;
    placePlaceholder: string;
    generating: string;
    generateButton: string;
    dismissError: string;
    birthChart: string;
    coordinates: string;
    ascendant: string;
    moonSign: string;
    nakshatra: string;
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
    istTimezone: string;
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
    sections: {
      generatedFor: string;
      basicDetails: string;
      currentDasha: string;
      keyYogas: string;
      detailedInsights: string;
      panchangSnapshot: string;
      career: string;
      marriage: string;
      health: string;
      wealth: string;
      education: string;
      family: string;
      locked: string;
      previewSubtitle: string;
      unlockFullReport: string;
      downloadPdf: string;
      securePayment: string;
      oneTimePayment: string;
      premiumPredictions: string;
      availableInPremium: string;
      lagna: string;
      moonSign: string;
      sunSign: string;
      mahadasha: string;
      antardasha: string;
      period: string;
      active: string;
      yoga: string;
      dosha: string;
      nakshatra: string;
      ascendant: string;
      coordinates: string;
      place: string;
      dob: string;
      tob: string;
      tithi: string;
      vara: string;
      yogaPanchang: string;
      karana: string;
      dashaSequence: string;
      planetPositions: string;
      basicKundliDetails: string;
      previewAriaLabel: string;
      previewTitle: string;
      currentPlanetaryPeriod: string;
      dashaInFullReport: string;
      readingChart: string;
      noYogasDetected: string;
      planetaryYoga: string;
      freePreview: string;
      corePersonality: string;
      topCareers: string;
      wealthType: string;
      runningDasha: string;
      viewMode: string;
      tabbedView: string;
      fullA4Report: string;
      reportLockedHint: string;
      sectionLocked: string;
      gemstonesDailyMantras: string;
      careerTimings: string;
      marriageDynamics: string;
      wealthAllocation: string;
      dashaRoadmap: string;
      favorablePeriods: string;
      challengingPeriods: string;
      strengths: string;
      challenges: string;
      favorableTiming: string;
      southIndian: string;
      unlockReportDownload: string;
      planetaryPositions: string;
      houseCusps: string;
      dashaPeriods: string;
      yogas: string;
      remedies: string;
      domainInsights: string;
      scorecard: string;
      downloadFullKundli: string;
      pdfRendering: string;
      pdfRebuilding: string;
      pdfDownloadSuccess: string;
      pdfDownloadLocked: string;
      pdfServerFailed: string;
      pdfReportLocked: string;
      pdfNothingToExport: string;
      pdfRebuildFailed: string;
      pdfExportFailed: string;
      pdfPrintHint: string;
      printEnglish: string;
      printHindi: string;
      chooseLanguage: string;
      pdfLanguageAria: string;
      paywallTitle: string;
      paywallBody: string;
      paywallButton: string;
      paywallFootnote: string;
      paywallAria: string;
      kundliReport: string;
      language: string;
      selectLanguage: string;
      preview: string;
      lockedFeaturePlanets: string;
      lockedFeatureDosha: string;
      lockedFeatureRemedies: string;
      lockedFeatureMahadasha: string;
      unlockHint: string;
      pay: string;
    };
    tabs: {
      overview: string;
      charts: string;
      planets: string;
      dashas: string;
      predictions: string;
      remedies: string;
    };
    buttons: {
      downloadPdf: string;
      generate: string;
      regenerate: string;
      unlock: string;
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
  pdf: {
    headers: {
      kundliReport: string;
      birthDetails: string;
      planetaryPositions: string;
      houseCusps: string;
      dashaPeriods: string;
      yogas: string;
      remedies: string;
      domainInsights: string;
    };
    sections: {
      clientName: string;
      birthPlace: string;
      dateOfBirth: string;
      timeOfBirth: string;
      page: string;
      scorecard: string;
      paid: string;
      basic: string;
      title: string;
    };
    labels: {
      generatedOn: string;
      planet: string;
      house: string;
      degree: string;
      sign: string;
      nakshatra: string;
    };
    /** Localized strings consumed by the PDF HTML template (pdfHtmlTemplate.ts). */
    template: Record<string, string>;
  };
  profile: {
    titlePersonal: string;
    titleWallet: string;
    titleKundaliHistory: string;
    titleChatHistory: string;
    chartFor: string;
    noKundaliHistory: string;
    noKundaliHistoryDesc: string;
    noChatHistory: string;
    noChatHistoryDesc: string;
    noTransactions: string;
    noTransactionsDesc: string;
    startChat: string;
    generateKundali: string;
    regenerateOnKundali: string;
    messagesCount: string;
    closeProfile: string;
    fullName: string;
    birthDate: string;
    birthTime: string;
    placeOfBirth: string;
    placePlaceholder: string;
    saveChanges: string;
    savedSuccessfully: string;
    profileUpdated: string;
    avatarUpdated: string;
    uploadPicture: string;
    accountEmail: string;
    walletBalance: string;
    availableTokens: string;
    transactions: string;
    transactionsDesc: string;
    addFunds: string;
    downloadReceipt: string;
  };
  payment: {
    messages: {
      processing: string;
      success: string;
      error: string;
      cancelled: string;
      loadingSystem: string;
      enterEmail: string;
      verificationFailed: string;
      loadFailed: string;
      loading: string;
    };
    buttons: {
      payNow: string;
      unlockReport: string;
      verify: string;
    };
  };
  errors: {
    validation: {
      required: string;
      invalidEmail: string;
      invalidDate: string;
      invalidTime: string;
      invalidPlace: string;
    };
    api: {
      generic: string;
      network: string;
      notFound: string;
      unauthorized: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
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
      toggleMenu: 'Toggle menu',
      toggleLanguage: 'Toggle language',
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
      clearChat: 'Clear chat',
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
      followers: 'followers',
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
    installBanner: {
      title: 'Install AstroVeda App',
      subtitle: 'Get daily horoscopes & Kundali on your home screen',
      action: 'Add to Home Screen',
      instructions: 'Tap the menu (⋮) → "Add to Home Screen"',
    },
    auth: {
      titleLogin: 'Sign In',
      titleRegister: 'Create Account',
      titleProfile: 'Your Profile',
      titleForgot: 'Reset Password',
      titlePhone: 'Enter Phone Number',
      titlePhoneVerify: 'Verify OTP',
      labelBirthDate: 'Birth Date',
      labelBirthTime: 'Birth Time',
      labelBirthPlace: 'Birth Place',
      placeholderBirthPlace: 'City, Country',
      labelPhoneNumber: 'Phone Number',
      placeholderPhone: '98765 43210',
      labelOtp: 'Enter the 6-digit code sent to {phone}',
      placeholderOtp: '000000',
      placeholderFullName: 'Full Name',
      placeholderEmail: 'Email address',
      placeholderPassword: 'Password',
      ariaHidePassword: 'Hide password',
      ariaShowPassword: 'Show password',
      ariaToggleMenu: 'Toggle menu',
      buttonSaving: 'Saving...',
      buttonSaveProfile: 'Save Profile',
      buttonSignOut: 'Sign Out',
      buttonContinueGoogle: 'Continue with Google',
      buttonContinuePhone: 'Continue with phone',
      buttonSending: 'Sending...',
      buttonSendOtp: 'Send OTP',
      buttonVerifying: 'Verifying...',
      buttonVerifyAndSignIn: 'Verify & Sign In',
      buttonSendResetLink: 'Send Reset Link',
      buttonPleaseWait: 'Please wait...',
      labelResendIn: 'Resend in {seconds}s',
      buttonResendOtp: 'Resend OTP',
      linkForgotPassword: 'Forgot Password?',
      linkBackToLogin: 'Back to Login',
      textNoAccount: "Don't have an account?",
      linkSignUp: 'Sign up',
      textHaveAccount: 'Already have an account?',
      linkSignIn: 'Sign in',
      dividerText: 'or',
      successPasswordReset: 'Password reset link sent to your email',
      successOtpSent: 'OTP sent to your phone',
      successOtpResent: 'OTP resent to your phone',
      errorSomethingWentWrong: 'Something went wrong',
    },
    birthDetails: {
      personalizing: 'Personalize Your Reading',
      revealReading: 'Reveal My Reading',
      formSubtitle: 'We need your birth details to align the stars',
      calibrating: 'Calibrating your exact Nakshatra alignment...',
      labelName: 'Name',
      labelDob: 'Date of Birth',
      labelTime: 'Time of Birth',
      labelPlace: 'Place of Birth',
      checkboxTimeUnknown: 'Time Unknown (defaults to 12:00 PM / Moon Chart)',
      placeholderName: 'Enter your full name',
      placeholderPlace: 'City, State, Country',
      submitLoading: 'Aligning the stars...',
      submitReveal: 'Reveal My Reading →',
      privacyNote: '🔒 Your birth details are encrypted & never shared',
      ariaClose: 'Close',
    },
    common: {
      empty: 'Nothing here yet',
      emptyDesc: 'This section is currently empty. Check back later!',
      error: 'Something went wrong',
      errorDesc: 'We encountered an error while loading this content. Please try again.',
      noResults: 'No results found',
      noResultsDesc: "We couldn't find anything matching your search. Try different keywords.",
      noMessages: 'No messages yet',
      noMessagesDesc: 'Start a conversation by typing your first message below.',
      noData: 'No data available',
      noDataDesc: "There's no data to display at the moment.",
      goBack: 'Go Back',
      tryAgain: 'Try Again',
      searching: 'Searching locations...',
      notFound: 'No locations found',
      vedicBirthChart: 'Vedic Birth Chart',
      northIndianStyle: 'North Indian Style',
      lagna: 'Lagna',
      noPlanetsHere: 'No planets in this house',
      notAvailable: 'Not available',
      orderId: 'Order ID:',
      paymentId: 'Payment ID:',
      close: 'Close',
      dismissNotification: 'Dismiss notification',
      logout: 'Logout',
      userProfileMenu: 'User profile menu',
      profileSections: 'Profile sections',
    },
    placeSearch: {
      placeholder: 'Enter city, town, or PIN code...',
      latitude: 'Latitude',
      longitude: 'Longitude',
      useTyped: 'Use "{value}"',
      countries: [
        { code: '+91', en: 'India', hi: 'भारत' },
        { code: '+1', en: 'US/Canada', hi: 'US/कनाडा' },
        { code: '+44', en: 'UK', hi: 'यूके' },
        { code: '+61', en: 'Australia', hi: 'ऑस्ट्रेलिया' },
        { code: '+86', en: 'China', hi: 'चीन' },
        { code: '+81', en: 'Japan', hi: 'जापान' },
        { code: '+49', en: 'Germany', hi: 'जर्मनी' },
        { code: '+33', en: 'France', hi: 'फ्रांस' },
        { code: '+52', en: 'Mexico', hi: 'मैक्सिको' },
        { code: '+55', en: 'Brazil', hi: 'ब्राज़ील' },
      ],
    },
    pwa: {
      installTitle: 'Install AstroVeda',
      addToHome: 'Add AstroVeda to Home Screen',
      promptDesc: 'Get instant access to your cosmic guidance',
      installButton: 'Install App',
    },
    report: {
      footerMark: 'AstroVeda \u2022 Vedic Insight Report',
      period: 'Period',
      event: 'Event / Forecast',
      outlook: 'Outlook',
      page: 'Page',
      of: 'of',
    },
    preview: {
      title: 'Limited Free Preview',
      lagna: 'Lagna',
      moonSign: 'Moon Sign',
      sunSign: 'Sun Sign',
      nakshatra: 'Nakshatra',
      currentDasha: 'Current Dasha',
      yogas: 'Key Yogas',
      unlockButton: '🔓 Unlock Full Kundali with AI Predictions - ₹99',
      basicDetails: 'Basic Kundli Details',
      detailedInsights: 'Detailed Insights',
      teaser: {
        career: 'Planets influencing your 10th house point toward promising leadership opportunities...',
        marriage: 'The 7th house placement suggests a harmonious and supportive partnership ahead...',
        health: 'Your chart indicates natural resilience, with extra care advised during specific periods...',
      },
      kundaliAwaitsTitle: 'Your Kundali Awaits',
      kundaliAwaitsSubtitle: 'Discover your planetary positions, dasha periods, and auspicious yogas.',
      kundaliAwaitsCta: 'Generate Your Full Kundali',
      kundaliAwaitsHint: 'Free • Takes 30 seconds',
      kundaliAwaitsBadge: 'Kundali Generator',
      kundaliAwaitsFeaturePlanets: 'Planetary positions (Graha Sthiti)',
      kundaliAwaitsFeatureDasha: 'Dasha & Antardasha periods',
      kundaliAwaitsFeatureYogas: 'Auspicious yogas & doshas',
      kundaliAwaitsFeaturePdf: 'PDF download & share',
    },
    kundali: {
      labels: {
        generateKundli: 'Generate Kundli',
        birthDetails: 'Birth Details',
        chart: 'Chart',
        predictions: 'Predictions',
        planets: 'Planets',
        houses: 'Houses',
        yogas: 'Yogas',
        dasha: 'Dasha',
        report: 'Report',
        premium: 'Premium',
        free: 'Free',
      },
      planets: {
        jupiter: 'Jupiter',
        saturn: 'Saturn',
        mars: 'Mars',
        mercury: 'Mercury',
        venus: 'Venus',
        moon: 'Moon',
        sun: 'Sun',
        rahu: 'Rahu',
        ketu: 'Ketu',
      },
      signs: {
        aquarius: 'Aquarius',
        scorpio: 'Scorpio',
        pisces: 'Pisces',
        aries: 'Aries',
        taurus: 'Taurus',
        gemini: 'Gemini',
        cancer: 'Cancer',
        leo: 'Leo',
        virgo: 'Virgo',
        libra: 'Libra',
        sagittarius: 'Sagittarius',
        capricorn: 'Capricorn',
      },
      generatedFor: 'Generated for {name}',
      basicDetails: 'Basic Details',
      currentDasha: 'Current Dasha',
      keyYogas: 'Key Yogas',
      detailedInsights: 'Detailed Insights',
      basicKundliDetails: 'Basic Kundli Details',
      panchangSnapshot: 'Panchang Snapshot',
      generateTitle: 'Generate Your Kundli',
      subtitle: 'Enter your birth details to generate a personalized Vedic birth chart with planetary positions and insights.',
      fullName: 'Full Name',
      name: 'Name',
      namePlaceholder: 'Enter your full name',
      email: 'Email Address',
      emailPlaceholder: 'your@email.com',
      dateOfBirth: 'Date of Birth',
      timeOfBirth: 'Time of Birth',
      timeUnknown: 'Time of birth unknown',
      noonReferenceBadge: 'Estimated chart calculated using noon reference time',
      placeOfBirth: 'Place of Birth',
      placePlaceholder: 'Enter city, town, or PIN code...',
      generating: 'Generating your kundali...',
      generateButton: 'Generate Kundli',
      dismissError: 'Dismiss error',
      birthChart: 'Your Birth Chart',
      coordinates: 'Coordinates',
      ascendant: 'Ascendant',
      moonSign: 'Moon Sign',
      nakshatra: 'Nakshatra',
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
      istTimezone: 'IST (+05:30)',
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
      sections: {
        generatedFor: 'Generated for {name}',
        basicDetails: 'Basic Kundli Details',
        currentDasha: 'Current Dasha',
        keyYogas: 'Key Yogas',
        detailedInsights: 'Detailed Insights',
        panchangSnapshot: 'Panchang Snapshot',
        career: 'Career',
        marriage: 'Marriage',
        health: 'Health',
        wealth: 'Wealth',
        education: 'Education',
        family: 'Family',
        locked: 'Locked',
        previewSubtitle: 'Preview - Unlock for D9, D10, D60 charts',
        unlockFullReport: 'Unlock Full Report',
        downloadPdf: 'Download PDF',
        securePayment: 'Secure payment · Instant unlock',
        oneTimePayment: 'One-time payment · Instant unlock · PDF download included',
        premiumPredictions: 'Premium Predictions',
        availableInPremium: 'Available in Premium Report',
        lagna: 'Lagna',
        moonSign: 'Moon Sign',
        sunSign: 'Sun Sign',
        mahadasha: 'Mahadasha',
        antardasha: 'Antardasha',
        period: 'Period',
        active: 'Active',
        yoga: 'Yoga',
        dosha: 'Dosha',
        nakshatra: 'Nakshatra',
        ascendant: 'Ascendant',
        coordinates: 'Coordinates',
        place: 'Place',
        dob: 'Date of Birth',
        tob: 'Time of Birth',
        tithi: 'Tithi',
        vara: 'Vara (Day)',
        yogaPanchang: 'Yoga',
        karana: 'Karana',
        dashaSequence: 'Dasha Sequence',
        planetPositions: 'Planet Positions',
        basicKundliDetails: 'Basic Kundli Details',
        previewAriaLabel: 'Free Kundli Preview',
        previewTitle: 'Limited Free Preview',
        currentPlanetaryPeriod: 'Current planetary period',
        dashaInFullReport: 'The complete dasha timeline is available in the full report.',
        readingChart: 'Reading chart...',
        noYogasDetected: 'No major yogas detected.',
        planetaryYoga: 'Planetary Yoga',
        freePreview: 'Free Preview',
        corePersonality: 'Your Core Personality',
        topCareers: 'Top 3 Careers',
        wealthType: 'Wealth Type',
        runningDasha: 'Running Dasha',
        viewMode: 'View Mode',
        tabbedView: 'Tabbed View',
        fullA4Report: 'Full A4 Report',
        reportLockedHint: 'The full A4 report unlocks after payment.',
        sectionLocked: 'This section is locked',
        gemstonesDailyMantras: 'Gemstones & Daily Mantras',
        careerTimings: 'Career Timings',
        marriageDynamics: 'Marriage Dynamics',
        wealthAllocation: 'Wealth Allocation',
        dashaRoadmap: '10-Year Dasha Roadmap',
        favorablePeriods: 'Favorable Periods',
        challengingPeriods: 'Challenging Periods',
        strengths: 'Strengths',
        challenges: 'Challenges',
        favorableTiming: 'Favorable Timing',
        southIndian: 'South Indian',
        unlockReportDownload: 'Unlock Full 20-Page Report & Download PDF',
        planetaryPositions: 'Planetary Positions',
        houseCusps: 'House Cusps',
        dashaPeriods: 'Dasha Periods',
        yogas: 'Yogas',
        remedies: 'Remedies',
        domainInsights: 'Life Domain Insights',
        scorecard: 'Compatibility Scorecard',
        downloadFullKundli: 'Download Full 25-Page Kundli',
        pdfRendering: 'Rendering your 25-page PDF…',
        pdfRebuilding: 'Rebuilding your full chart…',
        pdfDownloadSuccess: 'Your full Kundli PDF has been downloaded! 🎉',
        pdfDownloadLocked: 'This download is locked — complete payment to unlock the full report.',
        pdfServerFailed: 'PDF server failed — opened the print fallback.',
        pdfReportLocked: 'This report is locked. Complete payment to unlock the full PDF.',
        pdfNothingToExport: 'Nothing to export yet — generate a kundali first.',
        pdfRebuildFailed: 'Could not rebuild this chart (missing coordinates?). Open it on the Kundali page and try again.',
        pdfExportFailed: 'Export failed. Please try again.',
        pdfPrintHint: 'No server needed — opens your browser print dialog (Save as PDF).',
        printEnglish: 'Print English',
        printHindi: 'Print Hindi',
        chooseLanguage: 'Choose Language',
        pdfLanguageAria: 'Download kundli in {lang}',
        paywallTitle: 'Unlock Full 20+ Page Premium Kundli Report',
        paywallBody: 'Career timings, marriage dynamics, wealth allocation, dasha roadmap, yogas, doshas and remedies — everything in one detailed report.',
        paywallButton: 'Pay ₹{price} — Unlock Full Report',
        paywallFootnote: 'One-time payment • Instant unlock • PDF download included',
        paywallAria: 'Unlock premium kundli report',
        kundliReport: 'Kundli Report',
        language: 'Language',
        selectLanguage: 'Select Language',
        preview: 'Preview',
        lockedFeaturePlanets: 'Complete planetary positions table',
        lockedFeatureDosha: 'Dosha analysis (Manglik & Sade Sati)',
        lockedFeatureRemedies: 'Personalized remedies & gemstones',
        lockedFeatureMahadasha: '120-year Dasha sequence',
        unlockHint: 'One-time payment • Instant unlock • PDF download included',
        pay: 'Pay',
      },
      tabs: {
        overview: 'Overview',
        charts: 'Charts',
        planets: 'Planets',
        dashas: 'Dashas',
        predictions: 'Predictions',
        remedies: 'Remedies',
      },
      buttons: {
        downloadPdf: 'Download PDF Report',
        generate: 'Generate',
        regenerate: 'Regenerate',
        unlock: 'Unlock Full Report',
      },
    },
    pdf: {
      headers: {
        kundliReport: 'Kundli Report',
        birthDetails: 'Birth Details',
        planetaryPositions: 'Planetary Positions',
        houseCusps: 'House Cusps',
        dashaPeriods: 'Dasha Periods',
        yogas: 'Yogas',
        remedies: 'Remedies',
        domainInsights: 'Life Domain Insights',
      },
      sections: {
        clientName: 'Client Name',
        birthPlace: 'Birth Place',
        dateOfBirth: 'Date of Birth',
        timeOfBirth: 'Time of Birth',
        page: 'Page',
        scorecard: 'Scorecard',
        paid: 'Paid',
        basic: 'Basic',
        title: '{name} - Kundli Report',
      },
      labels: {
        generatedOn: 'Generated on',
        planet: 'Planet',
        house: 'House',
        degree: 'Degree',
        sign: 'Sign',
        nakshatra: 'Nakshatra',
      },
      template: {
        title: 'Birth Chart Detailed Analysis',
        clientName: 'Client Name',
        chartType: 'Chart Type',
        birthDetails: 'Birth Details',
        birthDetailsShort: 'Birth Details',
        planetaryPositions: 'Planetary Positions',
        houseCusps: 'House Cusps',
        dashaPeriods: 'Dasha Periods',
        yogas: 'Yogas',
        remedies: 'Remedies',
        domainInsights: 'Domain Insights',
        scorecard: 'Scorecard',
        page: 'Page',
        northIndian: 'North Indian',
        southIndian: 'South Indian',
        paid: 'Premium Report',
        basic: 'Basic Report',
        latLong: 'Lat / Long',
        bodyCol: 'Body',
        signCol: 'Sign',
        degreeCol: 'Degree',
        houseCol: 'House',
        retroCol: 'Retro',
        mahaDashaCol: 'Maha Dasha',
        startCol: 'Start',
        endCol: 'End',
        subPeriodCol: 'Sub Period',
        panchang: 'Panchang at Birth',
        lagnaD1Chart: 'Lagna (D1) Chart',
        navamsaD9Chart: 'Navamsa (D9) Chart',
        sarvashtakavarga: 'Sarvashtakavarga Bindus',
        strongHouses: 'Strong houses',
        dashasYogasRemedies: 'Dashas, Yogas & Remedies',
        housesNavamsaAshtakavarga: 'Houses, Navamsa & Ashtakavarga',
        lifeDomains: 'Life Domains Analysis',
        references: 'References / Sources',
        parameter: 'Parameter',
        score: 'Score',
        period: 'Period',
        influence: 'Influence',
        event: 'Event',
        note: 'Note',
        notAvailable: 'Not available',
        generatedOn: 'Generated on {date}',
        appendix: 'Appendix — Life Pillars',
        milestones: 'Key Milestones',
        aiNote: 'This chapter is based on AI-assisted Vedic astrology guidance.',
        yogDoshTitle: 'Yogas & Doshas Analysis',
        doshaSection: 'Doshas',
        manglik: 'Manglik',
        manglikDosha: 'Manglik Dosha',
        manglikYes: 'Manglik Yes',
        manglikNo: 'Manglik No',
        doshaSeverity: 'Dosha Severity',
        severityHigh: 'High',
        severityMedium: 'Medium',
        severityMild: 'Mild',
        severityNone: 'None',
        sadeSati: 'Sade Sati',
        satiPhase1: 'Phase 1 (12th from Saturn)',
        satiPhase2: 'Phase 2 (same as Saturn)',
        satiPhase3: 'Phase 3 (2nd from Saturn)',
        noSadeSati: 'Sade Sati is not active at present',
        gemRudhSection: 'Gemstone & Rudraksha Prescription',
        primaryFortifyingPlanet: 'Primary fortifying planet',
        recommendedGemstone: 'Recommended Gemstone',
        recommendedRudraksha: 'Recommended Rudraksha',
        wearingDay: 'Wearing Day',
        gemMantra: 'Japa Mantra',
        gemmtGoal: 'Objective',
        planet: 'Planet',
        gemReason: 'Purpose',
        noRemedyData: 'Remedy details not available',
        mukhi: '{count} Mukhi',
        gemRuby: 'Ruby',
        gemPearl: 'Pearl',
        gemRedCoral: 'Red Coral',
        gemEmerald: 'Emerald',
        gemYellowSapphire: 'Yellow Sapphire',
        gemDiamond: 'Diamond',
        gemBlueSapphire: 'Blue Sapphire',
        gemHessonite: 'Hessonite (Gomed)',
        gemCatsEye: "Cat's Eye",
        daySunday: 'Sunday',
        dayMonday: 'Monday',
        dayTuesday: 'Tuesday',
        dayWednesday: 'Wednesday',
        dayThursday: 'Thursday',
        dayFriday: 'Friday',
        daySaturday: 'Saturday',
        goalConfidence: 'Confidence & authority',
        goalEmotional: 'Emotional peace',
        goalStrength: 'Strength & courage',
        goalIntellect: 'Intellect & speech',
        goalFortune: 'Fortune & wisdom',
        goalRelationships: 'Relationships & harmony',
        goalDiscipline: 'Discipline & karma',
        goalAmbition: 'Ambition & clarity',
        goalSpiritual: 'Spiritual intuition',
        currDashaTitle: 'Current Dasha — Deep Dive',
        currMahaDasha: 'Current Maha Dasha',
        currAntardasha: 'Current Antardasha',
        activeWindow: 'Active Window',
        currentRemark: 'The currently running dasha is active within the above window.',
        onDashaNow: 'Active now',
        upcomingNext: 'Upcoming',
        dashaCycle: 'Dasha Sequence',
        manglikSadeTitle: 'Mars & Sade Sati Tracker',
        manglikTracker: 'Manglik Tracker',
        satiTracker: 'Sade Sati Tracker',
        maleficKarm: 'Cause',
        activePhase: 'Active Phase',
        phaseStart: 'Start',
        phaseEnd: 'End',
        dashaMasterTitle: '120-Year Maha Dasha Master Table',
        vimshottari: 'Vimshottari',
        seqNo: 'No.',
        mahaYears: 'Years',
        fromYear: 'From',
        toYear: 'To',
        houseWord: 'House',
        lordWord: 'Lord',
        houseDataUnavailable: 'House data unavailable.',
        detailedPremiumAnalysis: 'Detailed {domain} analysis is included in the premium report.',
        domainCareer: 'Career',
        domainMarriage: 'Marriage',
        domainWealth: 'Wealth',
        domainHealth: 'Health',
        domainFinance: 'Finance',
        domainEducation: 'Education',
        domainFamily: 'Family',
        tz: 'Time Zone',
        varaWeekday: 'Vara (Weekday)',
        nakshatra: 'Nakshatra',
        nakshatraLord: 'Nakshatra Lord',
        moonSign: 'Moon Sign',
        sunSign: 'Sun Sign',
        lagna: 'Lagna',
        houseShort: 'House',
      },
    },
    profile: {
      titlePersonal: 'Personal Details',
      titleWallet: 'Wallet & Payments',
      titleKundaliHistory: 'Kundali History',
      titleChatHistory: 'Chat History',
      chartFor: 'Chart of {name}',
      noKundaliHistory: 'No Kundali history',
      noKundaliHistoryDesc: 'Charts generated while signed in will be saved here.',
      noChatHistory: 'No chat history',
      noChatHistoryDesc: 'Astrology conversations started while signed in will be saved here.',
      noTransactions: 'No transactions yet',
      noTransactionsDesc: 'Completed wallet top-ups will appear here with downloadable receipts.',
      startChat: 'Start a chat',
      generateKundali: 'Generate Kundali',
      regenerateOnKundali: 'Regenerate on Kundali page to enable PDF download',
      messagesCount: '{count} messages',
      closeProfile: 'Close profile',
      fullName: 'Full name',
      birthDate: 'Birth date',
      birthTime: 'Birth time',
      placeOfBirth: 'Place of birth',
      placePlaceholder: 'City, State, Country',
      saveChanges: 'Save changes',
      savedSuccessfully: 'Profile updated successfully.',
      profileUpdated: 'Profile updated successfully.',
      avatarUpdated: 'Avatar updated successfully.',
      uploadPicture: 'Upload profile picture',
      accountEmail: 'Account email cannot be changed here.',
      walletBalance: 'Wallet balance',
      availableTokens: 'Available tokens',
      transactions: 'Transactions',
      transactionsDesc: 'Completed wallet payments and receipts',
      addFunds: 'Add funds',
      downloadReceipt: 'Download Receipt',
    },
    payment: {
      messages: {
        processing: 'Processing payment...',
        success: 'Payment successful! Your report is unlocked.',
        error: 'Payment failed. Please try again.',
        cancelled: 'Payment was cancelled.',
        loadingSystem: 'Payment system is still loading. Please wait a moment and try again.',
        enterEmail: 'Please enter your email first.',
        verificationFailed: 'Payment verification failed',
        loadFailed: 'Failed to load payment system. Please refresh the page.',
        loading: 'Loading payment system...',
      },
      buttons: {
        payNow: 'Pay Now',
        unlockReport: 'Unlock Full Report',
        verify: 'Verify Payment',
      },
    },
    errors: {
      validation: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email',
        invalidDate: 'Please enter a valid date',
        invalidTime: 'Please enter a valid time',
        invalidPlace: 'Please select a valid place',
      },
      api: {
        generic: 'Something went wrong. Please try again.',
        network: 'Network error. Check your connection.',
        notFound: 'Resource not found',
        unauthorized: 'You are not authorized',
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
      toggleMenu: 'मेनू टॉगल करें',
      toggleLanguage: 'भाषा बदलें',
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
      clearChat: 'चैट साफ़ करें',
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
      error: 'संदेश भेजने में विथल। कृपया पुनः प्रयास करें।',
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
      followers: 'फॉलोअर्स',
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
    installBanner: {
      title: 'AstroVeda ऐप इंस्टॉल करें',
      subtitle: 'अपनी होम स्क्रीन पर दैनिक राशिफल और कुंडली प्राप्त करें',
      action: 'होम स्क्रीन में जोड़ें',
      instructions: 'मेनू (⋮) पर टैप करें → "होम स्क्रीन में जोड़ें"',
    },
    auth: {
      titleLogin: 'साइन इन',
      titleRegister: 'खाता बनाएं',
      titleProfile: 'आपकी प्रोफ़ाइल',
      titleForgot: 'पासवर्ड रीसेट करें',
      titlePhone: 'फ़ोन नंबर दर्ज करें',
      titlePhoneVerify: 'OTP सत्यापित करें',
      labelBirthDate: 'जन्म तिथि',
      labelBirthTime: 'जन्म समय',
      labelBirthPlace: 'जन्म स्थान',
      placeholderBirthPlace: 'शहर, देश',
      labelPhoneNumber: 'फ़ोन नंबर',
      placeholderPhone: '98765 43210',
      labelOtp: 'भेजा गया 6-अंकीय कोड दर्ज करें: {phone}',
      placeholderOtp: '000000',
      placeholderFullName: 'पूरा नाम',
      placeholderEmail: 'ईमेल पता',
      placeholderPassword: 'पासवर्ड',
      ariaHidePassword: 'पासवर्ड छुपाएँ',
      ariaShowPassword: 'पासवर्ड दिखाएँ',
      ariaToggleMenu: 'मेनू टॉगल करें',
      buttonSaving: 'सहेज रहा है...',
      buttonSaveProfile: 'प्रोफ़ाइल सहेजें',
      buttonSignOut: 'साइन आउट',
      buttonContinueGoogle: 'Google के साथ जारी रखें',
      buttonContinuePhone: 'फ़ोन के साथ जारी रखें',
      buttonSending: 'भेजा जा रहा है...',
      buttonSendOtp: 'OTP भेजें',
      buttonVerifying: 'सत्यापित हो रहा है...',
      buttonVerifyAndSignIn: 'सत्यापित करें और साइन इन करें',
      buttonSendResetLink: 'रीसेट लिंक भेजें',
      buttonPleaseWait: 'कृपया प्रतीक्षा करें...',
      labelResendIn: 'फिर से भेजें {seconds}s में',
      buttonResendOtp: 'OTP फिर से भेजें',
      linkForgotPassword: 'पासवर्ड भूल गए?',
      linkBackToLogin: 'लॉगिन पर वापस',
      textNoAccount: 'खाता नहीं है?',
      linkSignUp: 'साइन अप',
      textHaveAccount: 'पहले से खाता है?',
      linkSignIn: 'साइन इन',
      dividerText: 'या',
      successPasswordReset: 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया है',
      successOtpSent: 'OTP आपके फ़ोन पर भेजा गया है',
      successOtpResent: 'OTP फिर से आपके फ़ोन पर भेजा गया है',
      errorSomethingWentWrong: 'कुछ गलत हो गया',
    },
    birthDetails: {
      personalizing: 'अपनी रीडिंग को वैयक्तिगत बनाएं',
      revealReading: 'मेरी रीडिंग खोलें',
      formSubtitle: 'तारों को समायोजित करने के लिए हमें आपकी जन्म विवरण चाहिए',
      calibrating: 'आपका नक्शत्र समन्वय कैलिब्रेट कर रहा है...',
      labelName: 'नाम',
      labelDob: 'जन्म तिथि',
      labelTime: 'जन्म समय',
      labelPlace: 'जन्म स्थान',
      checkboxTimeUnknown: 'समय अज्ञात (डिफ़ॉल्ट 12:00 PM / चंद्रमा चार्ट)',
      placeholderName: 'अपना पूरा नाम दर्ज करें',
      placeholderPlace: 'शहर, राज्य, देश',
      submitLoading: 'तारों को समायोजित कर रहा है...',
      submitReveal: 'मेरी रीडिंग खोलें →',
      privacyNote: '🔒 आपका जन्म विवरण एन्क्रिप्टेड और कभी शेयर नहीं किया जाता',
      ariaClose: 'बंद करें',
    },
    common: {
      empty: 'यहाँ अभी तक कुछ नहीं है',
      emptyDesc: 'यह खंड वर्तमान में खाली है। बाद में जाँचें!',
      error: 'कुछ गलत हो गया',
      errorDesc: 'इस सामग्री को लोड करते समय हमें एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें।',
      noResults: 'कोई परिणाम नहीं मिला',
      noResultsDesc: 'हम आपकी खोज से मेल खाता हुआ कुछ नहीं ढूँढ पाए। अलग कीवर्ड आजमाएँ।',
      noMessages: 'अभी तक कोई संदेश नहीं',
      noMessagesDesc: 'नीचे अपना पहला संदेश टाइप करके एक बातचीत शुरू करें।',
      noData: 'कोई डेटा उपलब्ध नहीं',
      noDataDesc: 'अभी डिस्प्ले करने के लिए कोई डेटा नहीं है।',
      goBack: 'वापस जाएँ',
      tryAgain: 'फिर कोशिश करें',
      searching: 'स्थान खोज रहा है...',
      notFound: 'कोई स्थान नहीं मिला',
      vedicBirthChart: 'वैदिक जन्म कुंडली',
      northIndianStyle: 'नॉर्थ इंडियन स्टाइल',
      lagna: 'लग्न',
      noPlanetsHere: 'इस घर में कोई ग्रह नहीं',
      notAvailable: 'उपलब्ध नहीं',
      orderId: 'ऑर्डर आईडी:',
      paymentId: 'भुगतान आईडी:',
      close: 'बंद करें',
      dismissNotification: 'सूचना हटाएँ',
      logout: 'लॉग आउट',
      userProfileMenu: 'यूज़र प्रोफ़ाइल मेन्यू',
      profileSections: 'प्रोफ़ाइल सेक्शन',
    },
    placeSearch: {
      placeholder: 'शहर, टाउन या पिन कोड दर्शाने...',
      latitude: 'अक्षांश',
      longitude: 'द्राघिमांश',
      useTyped: '"{value}" का उपयोग करें',
      countries: [
        { code: '+91', en: 'India', hi: 'भारत' },
        { code: '+1', en: 'US/Canada', hi: 'US/कनाडा' },
        { code: '+44', en: 'UK', hi: 'यूके' },
        { code: '+61', en: 'Australia', hi: 'ऑस्ट्रेलिया' },
        { code: '+86', en: 'China', hi: 'चीन' },
        { code: '+81', en: 'Japan', hi: 'जापान' },
        { code: '+49', en: 'Germany', hi: 'जर्मनी' },
        { code: '+33', en: 'France', hi: 'फ्रांस' },
        { code: '+52', en: 'Mexico', hi: 'मैक्सिको' },
        { code: '+55', en: 'Brazil', hi: 'ब्राज़ील' },
      ],
    },
    pwa: {
      installTitle: 'AstroVeda इंस्टॉल करें',
      addToHome: 'होम स्क्रीन में AstroVeda जोड़ें',
      promptDesc: 'अपना कॉस्मिक मार्गदर्शन तुरंत प्राप्त करें',
      installButton: 'ऐप इंस्टॉल करें',
    },
    report: {
      footerMark: 'AstroVeda \u2022 वैदिक अंतर्दृष्टि रिपोर्ट',
      period: 'अवधि',
      event: 'घटना / भविष्यवाणी',
      outlook: 'दृष्टिकोण',
      page: 'पृष्ठ',
      of: 'की',
    },
    preview: {
      title: 'सीमित मुफ़्त पूर्वावलोकन',
      lagna: 'लग्न',
      moonSign: 'चंद्र राशि',
      sunSign: 'सूर्य राशि',
      nakshatra: 'नक्षत्र',
      currentDasha: 'वर्तमान दशा',
      yogas: 'प्रमुख योग',
      unlockButton: '🔓 पूरी कुंडली एआई भविष्यवाणी अनलॉक करें - ₹99',
      basicDetails: 'मूल कुंडली विवरण',
      detailedInsights: 'विस्तृत अंतर्दृष्टि',
      teaser: {
        career: 'आपके दशम भाव को प्रभावित करने वाले ग्रह नेतृत्व के उज्ज्वल अवसरों की ओर संकेत देते हैं...',
        marriage: 'सप्तम भाव की स्थिति एक सामंजस्यपूर्ण और सहयोगी जीवनसाथी का संकेत देती है...',
        health: 'आपकी कुंडली स्वाभाविक मजबूती दर्शाती है, विशेष अवधियों में अतिरिक्त ध्यान देने की सलाह है...',
      },
      kundaliAwaitsTitle: 'आपकी कुंडली इंतज़ार कर रही है',
      kundaliAwaitsSubtitle: 'अपनी ग्रहों की स्थिति, दशा काल और शुभ योगों की खोज करें।',
      kundaliAwaitsCta: 'अपनी पूरी कुंडली बनाएं',
      kundaliAwaitsHint: 'मुफ्त • 30 सेकंड लगते हैं',
      kundaliAwaitsBadge: 'कुंडली जनरेटर',
      kundaliAwaitsFeaturePlanets: 'ग्रहों की स्थिति (ग्रह स्थिति)',
      kundaliAwaitsFeatureDasha: 'दशा और अंतर्दशा काल',
      kundaliAwaitsFeatureYogas: 'शुभ योग और दोष',
      kundaliAwaitsFeaturePdf: 'PDF डाउनलोड और साझा करें',
    },
    kundali: {
      labels: {
        generateKundli: 'कुंडली बनाएं',
        birthDetails: 'जन्म विवरण',
        chart: 'चार्ट',
        predictions: 'भविष्यवाणियां',
        planets: 'ग्रह',
        houses: 'भाव',
        yogas: 'योग',
        dasha: 'दशा',
        report: 'रिपोर्ट',
        premium: 'प्रीमियम',
        free: 'निःशुल्क',
      },
      planets: {
        jupiter: 'गुरु',
        saturn: 'शनि',
        mars: 'मंगल',
        mercury: 'बुध',
        venus: 'शुक्र',
        moon: 'चंद्र',
        sun: 'सूर्य',
        rahu: 'राहु',
        ketu: 'केतु',
      },
      signs: {
        aquarius: 'कुंभ',
        scorpio: 'वृश्चिक',
        pisces: 'मीन',
        aries: 'मेष',
        taurus: 'वृषभ',
        gemini: 'मिथुन',
        cancer: 'कर्क',
        leo: 'सिंह',
        virgo: 'कन्या',
        libra: 'तुला',
        sagittarius: 'धनु',
        capricorn: 'मकर',
      },
      generatedFor: '{name} के लिए बनाई गई',
      basicDetails: 'मूल विवरण',
      currentDasha: 'वर्तमान दशा',
      keyYogas: 'प्रमुख योग',
      detailedInsights: 'विस्तृत अंतर्दृष्टि',
      basicKundliDetails: 'मूल कुंडली विवरण',
      panchangSnapshot: 'पंचांग स्नैपशॉट',
      generateTitle: 'अपनी कुंडली बनाएं',
      subtitle: 'आपका ब्रह्मांडीय ब्लूप्रिंट जानने के लिए अपनी जन्म जानकारी दर्ज करें।',
      fullName: 'पूरा नाम',
      name: 'नाम',
      namePlaceholder: 'अपना पूरा नाम दर्ज करें',
      email: 'ईमेल पता',
      emailPlaceholder: 'your@email.com',
      dateOfBirth: 'जन्म तिथि',
      timeOfBirth: 'जन्म समय',
      timeUnknown: 'जन्म समय अज्ञात है',
      noonReferenceBadge: 'दोपहर संदर्भ समय का उपयोग कर आकलित चार्ट',
      placeOfBirth: 'जन्म स्थान',
      placePlaceholder: 'शहर, कस्बा या पिन कोड दर्ज करें...',
      generating: 'कुंडली बनाई जा रही है...',
      generateButton: 'कुंडली बनाएं',
      dismissError: 'त्रुटि बंद करें',
      birthChart: 'आपकी जन्म कुंडली',
      coordinates: 'निर्देशांक',
      ascendant: 'लग्न',
      moonSign: 'चंद्र राशि',
      nakshatra: 'नक्षत्र',
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
      istTimezone: 'IST (+05:30)',
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
      sections: {
        generatedFor: '{name} के लिए बनाई गई',
        basicDetails: 'मूल कुंडली विवरण',
        currentDasha: 'वर्तमान दशा',
        keyYogas: 'प्रमुख योग',
        detailedInsights: 'विस्तृत अंतर्दृष्टि',
        panchangSnapshot: 'पंचांग स्नैपशॉट',
        career: 'करियर',
        marriage: 'विवाह',
        health: 'स्वास्थ्य',
        wealth: 'धन',
        education: 'शिक्षा',
        family: 'परिवार',
        locked: 'लॉक किया गया',
        previewSubtitle: 'पूर्वावलोकन - D9, D10, D60 चार्ट के लिए अनलॉक करें',
        unlockFullReport: 'पूरी रिपोर्ट अनलॉक करें',
        downloadPdf: 'पीडीएफ डाउनलोड करें',
        securePayment: 'सुरक्षित भुगतान · तत्काल अनलॉक',
        oneTimePayment: 'एक बार का भुगतान · तत्काल अनलॉक · पीडीएफ डाउनलोड शामिल',
        premiumPredictions: 'प्रीमियम भविष्यवाणियाँ',
        availableInPremium: 'प्रीमियम रिपोर्ट में उपलब्ध',
        lagna: 'लग्न',
        moonSign: 'चंद्र राशि',
        sunSign: 'सूर्य राशि',
        mahadasha: 'महादशा',
        antardasha: 'अंतर्दशा',
        period: 'अवधि',
        active: 'सक्रिय',
        yoga: 'योग',
        dosha: 'दोष',
        nakshatra: 'नक्षत्र',
        ascendant: 'लग्न',
        coordinates: 'निर्देशांक',
        place: 'स्थान',
        dob: 'जन्म तिथि',
        tob: 'जन्म समय',
        tithi: 'तिथि',
        vara: 'वार (दिन)',
        yogaPanchang: 'योग',
        karana: 'करण',
        dashaSequence: 'दशा क्रम',
        planetPositions: 'ग्रह स्थिति',
        basicKundliDetails: 'मूल कुंडली विवरण',
        previewAriaLabel: 'मुफ्त कुंडली पूर्वावलोकन',
        previewTitle: 'सीमित मुफ़्त पूर्वावलोकन',
        currentPlanetaryPeriod: 'वर्तमान ग्रह अवधि',
        dashaInFullReport: 'पूरी दशा समय-रेखा पूर्ण रिपोर्ट में उपलब्ध है।',
        readingChart: 'चार्ट पढ़ा जा रहा है...',
        noYogasDetected: 'कोई प्रमुख योग नहीं पाया गया।',
        planetaryYoga: 'ग्रह योग',
        freePreview: 'निःशुल्क अंश',
        corePersonality: 'आपका कोर व्यक्तित्व',
        topCareers: 'शीर्ष 3 करियर',
        wealthType: 'धन प्रकार',
        runningDasha: 'चल रही दशा',
        viewMode: 'दृश्य मोड',
        tabbedView: 'टैब दृश्य',
        fullA4Report: 'पूर्ण A4 रिपोर्ट',
        reportLockedHint: 'पूर्ण A4 रिपोर्ट केवल भुगतान के बाद अनलॉक होती है।',
        sectionLocked: 'यह सेक्शन लॉक है',
        gemstonesDailyMantras: 'रत्न एवं दैनिक मंत्र',
        careerTimings: 'करियर समय-रेखा',
        marriageDynamics: 'विवाह गतिशीलता',
        wealthAllocation: 'धन आवंटन',
        dashaRoadmap: '10-वर्षीय दशा रोडमैप',
        favorablePeriods: 'अनुकूल अवधि',
        challengingPeriods: 'चुनौतीपूर्ण अवधि',
        strengths: 'मज़बूती',
        challenges: 'चुनौतियाँ',
        favorableTiming: 'अनुकूल समय',
        southIndian: 'दक्षिण भारतीय',
        unlockReportDownload: 'पूरी 20-पेज रिपोर्ट अनलॉक करें और PDF डाउनलोड करें',
        planetaryPositions: 'ग्रहों की स्थिति',
        houseCusps: 'भाव कुंप',
        dashaPeriods: 'दशा अवधि',
        yogas: 'योग',
        remedies: 'उपाय',
        domainInsights: 'जीवन क्षेत्र अंतर्दृष्टि',
        scorecard: 'अनुकूलता स्कोरकार्ड',
        downloadFullKundli: 'पूरी 25 पेज कुंडली डाउनलोड करें',
        pdfRendering: 'आपकी 25 पेज PDF बनाई जा रही है…',
        pdfRebuilding: 'आपकी पूरी कुंडली तैयार हो रही है…',
        pdfDownloadSuccess: 'आपकी पूर्ण कुंडली PDF डाउनलोड हो गई है! 🎉',
        pdfDownloadLocked: 'यह डाउनलोड लॉक है — पूरी रिपोर्ट अनलॉक करने के लिए भुगतान पूर्ण करें।',
        pdfServerFailed: 'PDF सर्वर विफल — प्रिंट विकल्प खोला गया।',
        pdfReportLocked: 'यह रिपोर्ट लॉक है — पूर्ण PDF अनलॉक करने के लिए भुगतान करें।',
        pdfNothingToExport: 'निर्यात करने के लिए कुछ नहीं — पहले कुंडली बनाएं।',
        pdfRebuildFailed: 'यह कुंडली दोबारा नहीं बन सकी (निर्देशांक अनुपलब्ध?)। कुंडली पृष्ठ पर खोलकर पुनः प्रयास करें।',
        pdfExportFailed: 'निर्यात विफल। कृपया पुनः प्रयास करें।',
        pdfPrintHint: 'सर्वर आवश्यक नहीं — ब्राउज़र प्रिंट डायलॉग खुलेगा।',
        printEnglish: 'अंग्रेज़ी प्रिंट करें',
        printHindi: 'हिंदी प्रिंट करें',
        chooseLanguage: 'भाषा चुनें',
        pdfLanguageAria: '{lang} में कुंडली डाउनलोड करें',
        paywallTitle: 'पूरी 20+ पेज प्रीमियम कुंडली रिपोर्ट अनलॉक करें',
        paywallBody: 'कैरियर समय-रेखा, विवाह विश्लेषण, धन आवंटन, दशा रोडमैप, योग-दोष और उपाय — सब कुछ एक ही विस्तृत रिपोर्ट में।',
        paywallButton: '₹{price} का भुगतान करें — पूरी रिपोर्ट अनलॉक करें',
        paywallFootnote: 'एक बार भुगतान • तुरंत अनलॉक • PDF डाउनलोड शामिल',
        paywallAria: 'प्रीमियम कुंडली रिपोर्ट अनलॉक',
        kundliReport: 'कुंडली रिपोर्ट',
        language: 'भाषा',
        selectLanguage: 'भाषा चुनें',
        preview: 'पूर्वावलोकन',
        lockedFeaturePlanets: 'संपूर्ण ग्रह स्थिति तालिका',
        lockedFeatureDosha: 'दोष विश्लेषण (मांगलिक और साढ़े साती)',
        lockedFeatureRemedies: 'व्यक्तिगत उपाय और रत्न',
        lockedFeatureMahadasha: '120 वर्ष की दशा अनुक्रम',
        unlockHint: 'एक बार भुगतान • तुरंत अनलॉक • PDF डाउनलोड शामिल',
        pay: 'भुगतान',
      },
      tabs: {
        overview: 'अवलोकन',
        charts: 'चार्ट',
        planets: 'ग्रह',
        dashas: 'दशा',
        predictions: 'भविष्यवाणियां',
        remedies: 'उपाय',
      },
      buttons: {
        downloadPdf: 'PDF रिपोर्ट डाउनलोड करें',
        generate: 'बनाएं',
        regenerate: 'पुनः बनाएं',
        unlock: 'पूरी रिपोर्ट अनलॉक करें',
      },
    },
    pdf: {
      headers: {
        kundliReport: 'कुंडली रिपोर्ट',
        birthDetails: 'जन्म विवरण',
        planetaryPositions: 'ग्रह स्थिति',
        houseCusps: 'भाव कुंप',
        dashaPeriods: 'दशा अवधि',
        yogas: 'योग',
        remedies: 'उपाय',
        domainInsights: 'जीवन क्षेत्र अंतर्दृष्टि',
      },
      sections: {
        clientName: 'ग्राहक का नाम',
        birthPlace: 'जन्म स्थान',
        dateOfBirth: 'जन्म तिथि',
        timeOfBirth: 'जन्म समय',
        page: 'पृष्ठ',
        scorecard: 'स्कोरकार्ड',
        paid: 'सशुल्क',
        basic: 'मूल',
        title: '{name} - कुंडली रिपोर्ट',
      },
      labels: {
        generatedOn: 'निर्मित तिथि',
        planet: 'ग्रह',
        house: 'भाव',
        degree: 'अंश',
        sign: 'राशि',
        nakshatra: 'नक्षत्र',
      },
      template: {
        title: 'जन्म कुंडली विशद़ विश्लेषण',
        clientName: 'क्लाइंट नाम',
        chartType: 'चार्ट प्रकार',
        birthDetails: 'जन्म विवरण',
        birthDetailsShort: 'जन्म विवरण',
        planetaryPositions: 'ग्रह स्थिति',
        houseCusps: 'घर कस्स',
        dashaPeriods: 'दशा अवधि',
        yogas: 'योग',
        remedies: 'उपाय',
        domainInsights: 'डोमेन अंतर्दृष्टि',
        scorecard: 'स्कोरकार्ड',
        page: 'पृष्ठ',
        northIndian: 'उत्तर भारतीय',
        southIndian: 'दक्षिण भारतीय',
        paid: 'प्रीमियम रिपोर्ट',
        basic: 'मूलभूत रिपोर्ट',
        latLong: 'अक्षांश / द्राघिमांश',
        bodyCol: 'ग्रह',
        signCol: 'राशि',
        degreeCol: 'डिग्री',
        houseCol: 'घर',
        retroCol: 'रीत्रो',
        mahaDashaCol: 'महादशा',
        startCol: 'प्रारंभ',
        endCol: 'समाप्ति',
        subPeriodCol: 'उप-अवधि',
        panchang: 'जन्म पंचांग',
        lagnaD1Chart: 'लग्न कुंडली (D1)',
        navamsaD9Chart: 'नवांश (D9) चार्ट',
        sarvashtakavarga: 'सर्वाष्टकवर्ग बिंदु',
        strongHouses: 'प्रबल भाव',
        dashasYogasRemedies: 'दशा, योग एवं उपाय',
        housesNavamsaAshtakavarga: 'भाव, नवांश एवं अष्टकवर्ग',
        lifeDomains: 'जीवन क्षेत्र विश्लेषण',
        references: 'कल्पुरुश पुस्तक / स्रोत',
        parameter: 'पैरामीटर',
        score: 'स्कोर',
        period: 'अवधि',
        influence: 'प्रभाव',
        event: 'घटना',
        note: 'टिप्पणी',
        notAvailable: 'उपलब्ध नहीं',
        generatedOn: '{date} को जनरेट किया गया',
        appendix: 'परिशिष्ट — जीवन स्तंभ',
        milestones: 'प्रमुख मील के पत्थर',
        aiNote: 'यह अध्याय AI-सहायता प्राप्त वैदिक ज्योतिष मार्गदर्शन पर आधारित है।',
        yogDoshTitle: 'योग एवं दोष विश्लेषण',
        doshaSection: 'दोष विवरण',
        manglik: 'मांगलिक',
        manglikDosha: 'मांगलिक दोष',
        manglikYes: 'मांगलिक हाँ',
        manglikNo: 'मांगलिक नहीं',
        doshaSeverity: 'दोष गंभीरता',
        severityHigh: 'तीव्र',
        severityMedium: 'मध्यम',
        severityMild: 'हल्का',
        severityNone: 'कोई नहीं',
        sadeSati: 'साढ़े साती',
        satiPhase1: 'चरण 1 (शनि से 12वां)',
        satiPhase2: 'चरण 2 (शनि के समान)',
        satiPhase3: 'चरण 3 (शनि से 2वां)',
        noSadeSati: 'साढ़े साती वर्तमान में सक्रिय नहीं है',
        gemRudhSection: 'रत्न एवं रुद्राक्ष विधान',
        primaryFortifyingPlanet: 'प्राथमिक सुधार ग्रह',
        recommendedGemstone: 'अनुशंसित रत्न',
        recommendedRudraksha: 'अनुशंसित रुद्राक्ष',
        wearingDay: 'धारण का दिन',
        gemMantra: 'जप मंत्र',
        gemmtGoal: 'उद्देश्य',
        planet: 'ग्रह',
        gemReason: 'सुधार हेतु',
        noRemedyData: 'उपाय विवरण उपलब्ध नहीं',
        mukhi: '{count} मुखी',
        gemRuby: 'माणिक्य',
        gemPearl: 'मोती',
        gemRedCoral: 'लाल मूंगा',
        gemEmerald: 'पन्ना',
        gemYellowSapphire: 'पुखराज',
        gemDiamond: 'हीरा',
        gemBlueSapphire: 'नीलम',
        gemHessonite: 'गोमेद',
        gemCatsEye: 'लहसुनिया',
        daySunday: 'रविवार',
        dayMonday: 'सोमवार',
        dayTuesday: 'मंगलवार',
        dayWednesday: 'बुधवार',
        dayThursday: 'गुरुवार',
        dayFriday: 'शुक्रवार',
        daySaturday: 'शनिवार',
        goalConfidence: 'आत्मविश्वास और अधिकार',
        goalEmotional: 'मानसिक शांति',
        goalStrength: 'शक्ति और साहस',
        goalIntellect: 'बुद्धि और वाणी',
        goalFortune: 'भाग्य और ज्ञान',
        goalRelationships: 'रिश्ते और सामंजस्य',
        goalDiscipline: 'अनुशासन और कर्म',
        goalAmbition: 'महत्वाकांक्षा और स्पष्टता',
        goalSpiritual: 'आध्यात्मिक अंतर्ज्ञान',
        currDashaTitle: 'वर्तमान दशा — गहन अध्ययन',
        currMahaDasha: 'वर्तमान महादशा',
        currAntardasha: 'वर्तमान अंतर्दशा',
        activeWindow: 'सक्रिय विंडो',
        currentRemark: 'वर्तमान में चल रही दशा उपरोक्त विंडो के भीतर सक्रिय है।',
        onDashaNow: 'अभी सक्रिय',
        upcomingNext: 'आगामी',
        dashaCycle: 'दशा क्रम',
        manglikSadeTitle: 'मंगल एवं साढ़े साती ट्रैकर',
        manglikTracker: 'मांगलिक ट्रैकर',
        satiTracker: 'साढ़े साती ट्रैकर',
        maleficKarm: 'कोष',
        activePhase: 'सक्रिय चरण',
        phaseStart: 'प्रारंभ',
        phaseEnd: 'समाप्ति',
        dashaMasterTitle: '120 वर्ष महादशा तालिका',
        vimshottari: 'विमशोत्तरी',
        seqNo: 'अनु',
        mahaYears: 'वर्ष',
        fromYear: 'प्रारंभ',
        toYear: 'समाप्ति',
        houseWord: 'भाव',
        lordWord: 'स्वामी',
        houseDataUnavailable: 'भाव डेटा उपलब्ध नहीं।',
        detailedPremiumAnalysis: 'विस्तृत {domain} विश्लेषण प्रीमियम रिपोर्ट में शामिल है।',
        domainCareer: 'करियर',
        domainMarriage: 'विवाह',
        domainWealth: 'धन',
        domainHealth: 'स्वास्थ्य',
        domainFinance: 'वित्त',
        domainEducation: 'शिक्षा',
        domainFamily: 'परिवार',
        tz: 'समय क्षेत्र',
        varaWeekday: 'वार',
        nakshatra: 'नक्षत्र',
        nakshatraLord: 'नक्षत्र स्वामी',
        moonSign: 'चंद्र राशि',
        sunSign: 'सूर्य राशि',
        lagna: 'लग्न',
        houseShort: 'भाव',
      },
    },
    profile: {
      titlePersonal: 'व्यक्तिगत विवरण',
      titleWallet: 'वॉलेट और भुगतान',
      titleKundaliHistory: 'कुंडली इतिहास',
      titleChatHistory: 'चैट इतिहास',
      chartFor: '{name} की कुंडली',
      noKundaliHistory: 'कोई कुंडली इतिहास नहीं',
      noKundaliHistoryDesc: 'साइन इन करने पर बनाई गई कुंडलियाँ यहाँ सहेजी जाएंगी।',
      noChatHistory: 'कोई चैट इतिहास नहीं',
      noChatHistoryDesc: 'साइन इन करने पर शुरू की गई ज्योतिष बातचीत यहाँ सहेजी जाएगी।',
      noTransactions: 'अभी कोई लेन-देन नहीं',
      noTransactionsDesc: 'पूर्ण किए गए वॉलेट टॉप-अप यहाँ रसीदों के साथ दिखेंगे।',
      startChat: 'चैट शुरू करें',
      generateKundali: 'कुंडली बनाएं',
      regenerateOnKundali: 'PDF डाउनलोड सक्षम करने के लिए कुंडली पृष्ठ पर पुनः बनाएं',
      messagesCount: '{count} संदेश',
      closeProfile: 'प्रोफ़ाइल बंद करें',
      fullName: 'पूरा नाम',
      birthDate: 'जन्म तिथि',
      birthTime: 'जन्म समय',
      placeOfBirth: 'जन्म स्थान',
      placePlaceholder: 'शहर, राज्य, देश',
      saveChanges: 'बदलाव सहेजें',
      savedSuccessfully: 'प्रोफ़ाइल सफलतापूर्वक अद्यतन हो गई।',
      profileUpdated: 'प्रोफ़ाइल सफलतापूर्वक अद्यतन हो गई।',
      avatarUpdated: 'अवतार सफलतापूर्वक अपडेट हुआ।',
      uploadPicture: 'प्रोफ़ाइल तस्वीर अपलोड करें',
      accountEmail: 'यहाँ खाता ईमेल नहीं बदल सकते।',
      walletBalance: 'वॉलेट बैलेंस',
      availableTokens: 'उपलब्ध टोकन',
      transactions: 'लेन-देन',
      transactionsDesc: 'पूर्ण किए गए वॉलेट भुगतान और रसीदें',
      addFunds: 'फंड जोड़ें',
      downloadReceipt: 'रसीद डाउनलोड करें',
    },
    payment: {
      messages: {
        processing: 'भुगतान संसाधित हो रहा है...',
        success: 'भुगतान सफल! आपकी रिपोर्ट अनलॉक हो गई है।',
        error: 'भुगतान विफल। कृपया पुनः प्रयास करें।',
        cancelled: 'भुगतान रद्द कर दिया गया।',
        loadingSystem: 'भुगतान प्रणाली लोड हो रही है। कृपया कुछ क्षण प्रतीक्षा करें।',
        enterEmail: 'कृपया पहले अपना ईमेल दर्ज करें।',
        verificationFailed: 'भुगतान सत्यापन विफल',
        loadFailed: 'भुगतान प्रणाली लोड नहीं हुई। कृपया पृष्ठ ताज़ा करें।',
        loading: 'भुगतान प्रणाली लोड हो रही है...',
      },
      buttons: {
        payNow: 'अभी भुगतान करें',
        unlockReport: 'पूरी रिपोर्ट अनलॉक करें',
        verify: 'भुगतान सत्यापित करें',
      },
    },
    errors: {
      validation: {
        required: 'यह फ़ील्ड आवश्यक है',
        invalidEmail: 'कृपया मान्य ईमेल दर्ज करें',
        invalidDate: 'कृपया मान्य तिथि दर्ज करें',
        invalidTime: 'कृपया मान्य समय दर्ज करें',
        invalidPlace: 'कृपया मान्य स्थान चुनें',
      },
      api: {
        generic: 'कुछ गलत हो गया। कृपया पुनः प्रयास करें।',
        network: 'नेटवर्क त्रुटि। अपना कनेक्शन जांचें।',
        notFound: 'संसाधन नहीं मिला',
        unauthorized: 'आप अधिकृत नहीं हैं',
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
      loveCompatibility: 'श्रेष्ट प्रेम अनुकूलता',
      recommendations: 'व्यक्तिगत उपाय व अनुशंसाएँ',
      strengths: 'मजबूती',
      watchOut: 'ध्यान में रखें',
      luckyGemstone: 'भाग्यशाली रत्न',
    },
    tarot: {
      badge: 'मुफ्त 3-कार्ड टैरो रीडिंग',
      title: 'टैरो कार्ड रीडिंग',
      subtitle: 'अपने past, present और future के बारे में जानकारी प्राप्त करने के लिए तीन कार्ड खींचें। अपनी रीडिंग पर ध्यान केंद्रित करने के लिए एक विषय चुनें।',
      chooseTopic: 'अपना विषय चुनें',
      shuffle: 'शफल करें और कार्ड खींचें',
      shuffling: 'शफल हो रहा है...',
      shuffleAgain: 'फिर से शफल करें',
      past: 'past',
      present: 'present',
      future: 'future / परिणाम',
      reversed: 'टुला हुआ',
      upright: 'सीधा',
      tapToReveal: 'खुलाएँ देखने के लिए स्पर्श करें',
      getInterpretation: 'AI व्याख्या प्राप्त करें',
      consulting: 'तारों से परामर्श कर रहा है...',
      yourReading: 'आपकी रीडिंग',
      start: '"शफल करें और कार्ड खींचें" पर क्लिक करके अपनी रीडिंग शुरू करें',
    },
    horoscopePage: {
      title: 'दैनिक राशिफल',
      subtitle: "आज की वैदिक ज्योतिष भविष्यवाणी पढ़ने के लिए अपनी राशि चुनें।",
      readToday: 'आज पढ़ें',
      personalizedTitle: '✨ व्यक्तिगत मार्गदर्शन',
      personalizedText: 'हमारा AI गुरु करियर, प्रेम, मनोविद्या और स्वास्थ्य के लिए आपके विशिष्ट दैनिक सल्ले प्रदान करने के लिए ग्रहों की स्थिति का विश्लेषण करता है।',
      freeTitle: '🆓 100% मुफ्त',
      freeText: 'किसी भी सदस्यता के बिना हर दिन अपना भाग्यशाली रंग, संख्या और समय जांचें।',
      vedicTitle: '🕉️ वैदिक ज्ञान',
      vedicText: 'पारंपरिक भारतीय ज्योतिष सिद्धांत आधुनिक AI तकनीक से मिलकर सटीक मार्गदर्शन प्रदान करते हैं।',
    },
    horoscopeSign: {
      allSigns: 'सभी राशि',
      title: '{sign} का राशिफल',
      subtitle: '{sign} के लिए दैनिक वैदिक ज्योतिष मार्गदर्शन',
      prediction: '{period} भविष्यवाणी',
      luckyColor: 'भाग्यशाली रंग',
      luckyNumber: 'भाग्यशाली संख्या',
      luckyTime: 'भाग्यशाली समय',
      categoryScores: 'श्रेणी अंक',
      yesterday: 'पिछला दिन',
      today: 'आज',
      tomorrow: 'अगला दिन',
      career: 'करियर',
      love: 'प्रेम',
      money: 'धन',
      health: 'स्वास्थ्य',
      error: 'राशिफल लोड करने में असमर्थ। कृपया पुनः प्रयास करें।',
    },
  },
};

/**
 * Get translation for a key with optional parameters for interpolation.
 * Falls back to English, then to the key itself.
 */
export function getTranslation(
  lang: Language,
  key: string,
  params?: Record<string, any>
): string {
  const resolvedLang: Language = lang === 'hi' ? 'hi' : 'en';
  const lookup = (l: Language): string | undefined =>
    key.split('.').reduce((obj: any, segment: string) => {
      return obj && typeof obj === 'object' && segment in obj ? obj[segment] : undefined;
    }, translations[l]);
  const value = typeof lookup(resolvedLang) === 'string' ? lookup(resolvedLang) : lookup('en');
  if (typeof value === 'string') {
    if (params) {
      return value.replace(/\{([^}]+)\}/g, (_, placeholder) =>
        params[placeholder] !== undefined ? String(params[placeholder]) : `[${placeholder}]`
      );
    }
    return value;
  }
  return key;
}