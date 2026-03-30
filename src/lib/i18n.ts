export type Language = 'en' | 'rk' | 'rn';

export const languageNames: Record<Language, string> = {
  en: 'English',
  rk: 'Rukiga',
  rn: 'Runyankole',
};

/**
 * Translation dictionary for Kigezi Vet.
 *
 * Language notes
 * ──────────────
 * rk = Rukiga  – spoken in Kabale / Kigezi region (Kiga people)
 * rn = Runyankole – spoken in Mbarara / Ankole region (Nyankole people)
 *
 * The two languages share a large common vocabulary because they are both
 * Southwest Ugandan Bantu languages.  Where they genuinely differ the
 * differences are:
 *   • Rukiga tends to use "Ti-" for negation; Runyankole uses "Ti-" too but
 *     some verb stems and tonal patterns vary.
 *   • Some nouns differ: e.g. "Omulaamu" (healer, Runyankole) vs "Omushaaho"
 *     (Rukiga/shared); "Omushaho" is understood in both.
 *   • Days of the week: Only English / borrowed names are used universally in
 *     both speech communities – we avoid Swahili loan forms (Jumatatu etc.)
 *     which are NOT used by Rukiga or Runyankole speakers.
 */
const translations: Record<string, Record<Language, string>> = {

  // ── Global ──────────────────────────────────────────────────────────────────
  'app.title': {
    en: 'Kigezi Vet – Digital Veterinary Consultation Platform',
    rk: 'Kigezi Vet – Oruhuuto rw\'Enyagiiro ya Digitoli',
    rn: 'Kigezi Vet – Oruhuuto rw\'Obujanjabi bw\'Ente ya Digitoli',
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  'nav.home': {
    en: 'Home',
    rk: 'Eka',
    rn: 'Eka',
  },
  'nav.products': {
    en: 'Products',
    rk: 'Ebyokugurisha',
    rn: 'Ebyokutunda',
  },
  'nav.chat': {
    en: 'Consultation',
    rk: 'Okushabuurira',
    rn: 'Okubuuza Omulaamu',
  },
  'nav.contact': {
    en: 'Contact Us',
    rk: 'Tukorere',
    rn: 'Twombeire',
  },
  'nav.admin': {
    en: 'Admin Login',
    rk: 'Okwingira kw\'omukozi',
    rn: 'Okwingira kw\'omushomesa',
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  'hero.title': {
    en: 'DIGITAL VETERINARY CONSULTATION PLATFORM',
    rk: 'ORUHUUTO RW\'ENYAGIIRO YA DIGITOLI',
    rn: 'ORUHUUTO RW\'OBUJANJABI BW\'ENTE YA DIGITOLI',
  },
  'hero.subtitle': {
    en: 'Opposite All Saints Church, Plot 50 – Your Trusted Veterinary Partner',
    rk: 'Omu maiso ga All Saints Church, Plot 50 – Ab\'okwikiriza kwaawe',
    rn: 'Aha maaso ga All Saints Church, Plot 50 – Abeikirizibwa kwaawe',
  },
  'hero.cta': {
    en: 'Start Consultation',
    rk: 'Tandika okushabuurira',
    rn: 'Tandika okubuuza',
  },
  'hero.products': {
    en: 'View Products',
    rk: 'Reeba ebyokugurisha',
    rn: 'Rora ebyokutunda',
  },

  // ── Products ────────────────────────────────────────────────────────────────
  'products.title': {
    en: 'Our Products',
    rk: 'Ebyokugurisha byaitu',
    rn: 'Ebyokutunda byaitu',
  },
  'products.subtitle': {
    en: 'Quality veterinary medicines and supplies',
    rk: 'Eddagala y\'ente n\'ebintu by\'obweteezi',
    rn: 'Eddagala y\'ente n\'ebirabo by\'obweteezi',
  },
  'products.inStock': {
    en: 'In Stock',
    rk: 'Eriho',
    rn: 'Hariho',
  },
  'products.outOfStock': {
    en: 'Out of Stock',
    rk: 'Tirikuriho',
    rn: 'Tihariho',
  },
  'products.category': {
    en: 'Category',
    rk: 'Ekika',
    rn: 'Oruhanga',
  },
  'products.price': {
    en: 'Price',
    rk: 'Omuhendo',
    rn: 'Omushonjo',
  },
  'products.search': {
    en: 'Search products…',
    rk: 'Shaka ebyokugurisha…',
    rn: 'Shaka ebyokutunda…',
  },

  // ── Chat ────────────────────────────────────────────────────────────────────
  'chat.title': {
    en: 'Live Consultation',
    rk: 'Okushabuurira kw\'ebiro',
    rn: 'Okubuuza kw\'ebiro',
  },
  'chat.subtitle': {
    en: 'Chat with our veterinary expert',
    rk: 'Yogera n\'omushaho waitu',
    rn: 'Ganira n\'omulaamu waitu',
  },
  'chat.placeholder': {
    en: 'Type your message…',
    rk: 'Andika ebyo orikwenda okugamba…',
    rn: 'Handika ebyo orikwenda okugamba…',
  },
  'chat.send': {
    en: 'Send',
    rk: 'Sindika',
    rn: 'Tuma',
  },
  'chat.name': {
    en: 'Your Name',
    rk: 'Eizina ryaawe',
    rn: 'Eizina lyaawe',
  },
  'chat.phone': {
    en: 'Phone Number (optional)',
    rk: 'Enamba y\'esimu (si ya bwenganyize)',
    rn: 'Enamba y\'esimu (si ya ngamba)',
  },
  'chat.start': {
    en: 'Start Chat',
    rk: 'Tandika okuyogera',
    rn: 'Tandika okuganira',
  },
  'chat.welcome': {
    en: 'Welcome! How can we help your animals today?',
    rk: 'Tukusemereire! Nitwashobora kukuyamba tutye aha ente zawe ohubizooba?',
    rn: 'Tukusiimire! Nitwashobora kukuyamba tutye aha ente zawe erizooba?',
  },
  'chat.loginRequired': {
    en: 'You need to create an account or login to start a consultation.',
    rk: 'Oteekwa kwandikisa nari okwingira okutandika okushabuurira.',
    rn: 'Oteekwa kwandikisa nari okwingira okutandika okubuuza.',
  },
  'chat.loginToChat': {
    en: 'Login / Sign Up',
    rk: 'Yingira / Iyandikise',
    rn: 'Yingira / Iyandikise',
  },

  // ── Contact ─────────────────────────────────────────────────────────────────
  'contact.title': {
    en: 'Contact Us',
    rk: 'Tukorere',
    rn: 'Twombeire',
  },
  'contact.subtitle': {
    en: 'Reach us through any of these channels',
    rk: 'Tukorerere n\'enkora ezi zonna',
    rn: 'Twombeiremu n\'enkora ezi zonna',
  },
  'contact.location': {
    en: 'Location',
    rk: 'Ahantu',
    rn: 'Ohantu',
  },
  'contact.locationDetail': {
    en: 'Opposite All Saints Church, Plot 50, Kabale',
    rk: 'Omu maiso ga All Saints Church, Plot 50, Kabale',
    rn: 'Aha maaso ga All Saints Church, Plot 50, Kabale',
  },
  'contact.whatsapp': {
    en: 'WhatsApp',
    rk: 'WhatsApp',
    rn: 'WhatsApp',
  },
  'contact.hours': {
    en: 'Working Hours',
    rk: 'Essaawa z\'okukora',
    rn: 'Essaawa z\'okushoma',
  },
  // NOTE: Days of the week are used in English by both Rukiga and Runyankole
  // speakers; Swahili loanforms (Jumatatu, Jumamosi) are NOT used locally.
  'contact.hoursDetail': {
    en: 'Mon – Sat: 8:00 AM – 6:00 PM',
    rk: 'Mon – Sat: 8:00 AM – 6:00 PM',
    rn: 'Mon – Sat: 8:00 AM – 6:00 PM',
  },
  'contact.formTitle': {
    en: 'Send us a message',
    rk: 'Tuheereize obutumwa',
    rn: 'Tweretseze obutumwa',
  },
  'contact.formName': {
    en: 'Full Name',
    rk: 'Eizina ryaawe ryona',
    rn: 'Eizina lyaawe lyona',
  },
  'contact.formEmail': {
    en: 'Email Address',
    rk: 'Aderesi ya Email',
    rn: 'Aderesi ya Email',
  },
  'contact.formSubject': {
    en: 'Subject',
    rk: 'Omutwe gw\'eshonga',
    rn: 'Omutwe gw\'ebigambo',
  },
  'contact.formMessage': {
    en: 'Message',
    rk: 'Obutumwa',
    rn: 'Obutumwa',
  },
  'contact.formSubmit': {
    en: 'Send Message',
    rk: 'Sindika obutumwa',
    rn: 'Tuma obutumwa',
  },
  'contact.success': {
    en: 'Message sent successfully!',
    rk: 'Obutumwa bwatumibwa kandi bwagyenda!',
    rn: 'Obutumwa bwatumibwa kandi bwagenda!',
  },

  // ── Auth ────────────────────────────────────────────────────────────────────
  'auth.login': {
    en: 'Login',
    rk: 'Yingira',
    rn: 'Yingira',
  },
  'auth.signup': {
    en: 'Sign Up',
    rk: 'Iyandikise',
    rn: 'Iyandikise',
  },
  'auth.email': {
    en: 'Email',
    rk: 'Email',
    rn: 'Email',
  },
  'auth.password': {
    en: 'Password',
    rk: 'Ekigambo ky\'obuhiire',
    rn: 'Ekigambo ky\'obufubye',
  },
  'auth.fullName': {
    en: 'Full Name',
    rk: 'Eizina ryaawe ryona',
    rn: 'Eizina lyaawe lyona',
  },
  'auth.fullNamePlaceholder': {
    en: 'e.g. John Mugisha',
    rk: 'nka John Mugisha',
    rn: 'nka John Mugisha',
  },
  'auth.submit': {
    en: 'Login',
    rk: 'Yingira',
    rn: 'Yingira',
  },
  'auth.logout': {
    en: 'Logout',
    rk: 'Fuuka',
    rn: 'Fuuka',
  },
  'auth.farmer': {
    en: 'Farmer',
    rk: 'Omuhingi',
    rn: 'Omuhiisa',
  },
  'auth.admin': {
    en: 'Admin',
    rk: 'Omukozi',
    rn: 'Omushomesa',
  },
  'auth.selectRole': {
    en: 'Login or create an account',
    rk: 'Yingira nari wandikise',
    rn: 'Yingira nari iyandikise',
  },
  'auth.adminOnly': {
    en: 'Staff login only',
    rk: 'Ab\'okukora kwonka',
    rn: 'Ab\'okushoma kwonka',
  },
  'auth.nameRequired': {
    en: 'Full name is required',
    rk: 'Eizina niritekwa',
    rn: 'Eizina liriteekwa',
  },
  'auth.checkEmail': {
    en: 'Check your email',
    rk: 'Kebera email yaawe',
    rn: 'Rora email yaawe',
  },
  'auth.verifyEmail': {
    en: 'We sent you a verification link. Please check your inbox.',
    rk: 'Tukutumire omugereka gw\'okugenzaho. Kebera email yaawe.',
    rn: 'Tukutumire omugereka gw\'okugenzaho. Rora email yaawe.',
  },
  'auth.forgotPassword': {
    en: 'Forgot Password?',
    rk: 'Werekwa ekigambo ky\'obuhiire?',
    rn: 'Werekwa ekigambo ky\'obufubye?',
  },
  'auth.resetPassword': {
    en: 'Reset Password',
    rk: 'Hindura ekigambo',
    rn: 'Hindura ekigambo',
  },
  'auth.resetPasswordDesc': {
    en: 'Enter your email and we will send you a password reset link.',
    rk: 'Wandika email yaawe, nitwakutumira omugereka gw\'okuhinduura ekigambo.',
    rn: 'Handika email yaawe, nitwakutumira omugereka gw\'okuhinduura ekigambo.',
  },
  'auth.resetLinkSent': {
    en: 'Password reset link sent! Check your email.',
    rk: 'Omugereka gw\'okuhinduura ekigambo gutumibwa! Kebera email yaawe.',
    rn: 'Omugereka gw\'okuhinduura ekigambo gutumibwa! Rora email yaawe.',
  },
  'auth.newPassword': {
    en: 'New Password',
    rk: 'Ekigambo kiheru',
    rn: 'Ekigambo kiheru',
  },
  'auth.confirmPassword': {
    en: 'Confirm Password',
    rk: 'Emeza ekigambo',
    rn: 'Kakasa ekigambo',
  },
  'auth.updatePassword': {
    en: 'Update Password',
    rk: 'Vugurura ekigambo',
    rn: 'Hindura ekigambo',
  },
  'auth.passwordUpdated': {
    en: 'Password updated successfully!',
    rk: 'Ekigambo kivugururiwe kandi kirimu!',
    rn: 'Ekigambo kihinduriwe kandi kirimwo!',
  },
  'auth.passwordMismatch': {
    en: 'Passwords do not match',
    rk: 'Ebigambo tibiganana',
    rn: 'Ebigambo tibiganana',
  },
  'auth.adminSignup': {
    en: 'Admin Sign Up',
    rk: 'Yandikisa Omukozi',
    rn: 'Yandikisa Omushomesa',
  },
  'auth.adminSignupSuccess': {
    en: 'Admin account created! Please check your email to verify.',
    rk: 'Akaunti y\'omukozi yakorwa! Kebera email yaawe okuganizaho.',
    rn: 'Akaunti y\'omushomesa yakorwa! Rora email yaawe okuganizaho.',
  },
  'auth.backToLogin': {
    en: 'Back to Login',
    rk: 'Garuka Okwingira',
    rn: 'Garuka Okwingira',
  },

  // ── Admin panel ─────────────────────────────────────────────────────────────
  'admin.dashboard': {
    en: 'Admin Dashboard',
    rk: 'Dashboard y\'omukozi',
    rn: 'Dashboard y\'omushomesa',
  },
  'admin.conversations': {
    en: 'Conversations',
    rk: 'Emboozi',
    rn: 'Emiganiro',
  },
  'admin.manageProducts': {
    en: 'Manage Products',
    rk: 'Ebyokugurisha',
    rn: 'Ebyokutunda',
  },
  'admin.addProduct': {
    en: 'Add Product',
    rk: 'Ongeraho ekyokugurisha',
    rn: 'Ongeraho ekyokutunda',
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  'footer.rights': {
    en: '© 2026 Kigezi Vet – Digital Veterinary Consultation Platform. All rights reserved.',
    rk: '© 2026 Kigezi Vet. Oburenganzira bwona burikuwe.',
    rn: '© 2026 Kigezi Vet. Oburenganzira bwona buriwe.',
  },

  // ── Testimonials ─────────────────────────────────────────────────────────────
  'testimonials.title': {
    en: 'What Our Clients Say',
    rk: 'Ebi Abantu Bagamba',
    rn: 'Ebi Abantu Bagamba',
  },
  'testimonials.subtitle': {
    en: 'Trusted by farmers across the Kigezi region',
    rk: 'Abeikirizibwa abahiisa bona omu Kigezi',
    rn: 'Abeikirizibwa abahiisa bona omu Ankole n\'Kigezi',
  },
  'testimonials.1.text': {
    en: 'Kigezi Vet saved my herd during the last outbreak. Their staff are professional and the medicine is genuine.',
    rk: 'Kigezi Vet nibo bakijije ente zangye omu bwire bw\'oburwaire. Abakozi babo n\'abokwikirizibwa era eddagala niryawe.',
    rn: 'Kigezi Vet nibo bakijije ente zangye omu bwire bw\'oburwaire. Abakozi babo n\'abokwikirizibwa era eddagala niryawe.',
  },
  'testimonials.1.author': {
    en: 'Mugisha John',
    rk: 'Mugisha John',
    rn: 'Mugisha John',
  },
  'testimonials.1.location': {
    en: 'Dairy Farmer, Kabale',
    rk: 'Omuhiisa w\'ente, Kabale',
    rn: 'Omuhiisa w\'ente, Kabale',
  },
  'testimonials.2.text': {
    en: 'The best veterinary shop in the region! I always get my poultry vaccines here and they never disappoint.',
    rk: 'Ekibanda ky\'eddagala ky\'ente ekiruta omu Kigezi! Obwire bwona nshanga emibazi y\'enkoko ekaruhura.',
    rn: 'Ekibanda ky\'eddagala ky\'ente ekiruta omu karere! Obwire bwona nshanga emibazi y\'enkoko ekaruhura.',
  },
  'testimonials.2.author': {
    en: 'Ankunda Sarah',
    rk: 'Ankunda Sarah',
    rn: 'Ankunda Sarah',
  },
  'testimonials.2.location': {
    en: 'Poultry Farmer, Kisoro',
    rk: 'Omuhiisa w\'enkoko, Kisoro',
    rn: 'Omuhiisa w\'enkoko, Kisoro',
  },
  'testimonials.3.text': {
    en: 'I appreciate their advice as much as their medicine. They truly care about the local farmer.',
    rk: 'Ninkunda obuhabuzi bwabo n\'eddagala yabo obutio. Nibafa muno aha muhiisa w\'omu ishango.',
    rn: 'Ninkunda obuhabuzi bwabo n\'eddagala yabo obutio. Nibashwera muno aha muhiisa w\'omu ishango.',
  },
  'testimonials.3.author': {
    en: 'Byamugisha Frank',
    rk: 'Byamugisha Frank',
    rn: 'Byamugisha Frank',
  },
  'testimonials.3.location': {
    en: 'Cattle Farmer, Rukungiri',
    rk: 'Omuhiisa w\'ente, Rukungiri',
    rn: 'Omuhiisa w\'ente, Rukungiri',
  },

  // ── Error page ───────────────────────────────────────────────────────────────
  'error.title': {
    en: 'Something went wrong',
    rk: 'Harimu ekizibu',
    rn: 'Harimu ekizibu',
  },
  'error.subtitle': {
    en: 'We apologize for the inconvenience. Please try again or contact support.',
    rk: 'Tukusaasira ahabw\'ekizibu eki. Tandika kabaakari nari tuteere esimu.',
    rn: 'Tukusaasira ahabw\'ekizibu eki. Tandika kabaakari nari tuteere esimu.',
  },
  'error.refresh': {
    en: 'Refresh Page',
    rk: 'Garuka kabaakari',
    rn: 'Garuka kabaakari',
  },
  'error.backHome': {
    en: 'Back to Home',
    rk: 'Garuka Eka',
    rn: 'Garuka Eka',
  },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
}
