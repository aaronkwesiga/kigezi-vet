export type Language = 'en' | 'rk' | 'rn';

export const languageNames: Record<Language, string> = {
  en: 'English',
  rk: 'Rukiga',
  rn: 'Runyankole',
};

const translations: Record<string, Record<Language, string>> = {
  // Global
  'app.title': { en: 'Kigezi Vet Drugshop', rk: 'Kigezi Vet Drugshop', rn: 'Kigezi Vet Drugshop' },

  // Navigation
  'nav.home': { en: 'Home', rk: 'Eka', rn: 'Eka' },
  'nav.products': { en: 'Products', rk: 'Ebyokugurisha', rn: 'Ebyokugurisha' },
  'nav.chat': { en: 'Consultation', rk: 'Okushabuurira', rn: 'Okushabuurira' },
  'nav.contact': { en: 'Contact Us', rk: 'Tukorere ahabw\'enzi', rn: 'Tukorere ahabw\'enzi' },
  'nav.admin': { en: 'Admin Login', rk: 'Okwingira kw\'omukozi', rn: 'Okwingira kw\'omukozi' },

  // Hero
  'hero.title': {
    en: 'KIGEZI VET DRUGSHOP',
    rk: 'KIGEZI VET DRUGSHOP',
    rn: 'KIGEZI VET DRUGSHOP'
  },
  'hero.subtitle': {
    en: 'OPPOSITE ALL SAINTS CHURCH, PLOT 50 - YOUR TRUSTED VETERINARY PARTNER',
    rk: 'OMU MAISO GA ALL SAINTS CHURCH, PLOT 50 - AB\'OKWIKIRIZA KWAAWE',
    rn: 'OMU MAISO GA ALL SAINTS CHURCH, PLOT 50 - AB\'OKWIKIRIZA KWAAWE'
  },
  'hero.cta': { en: 'Start Consultation', rk: 'Tandika okushabuurira', rn: 'Tandika okushabuurira' },
  'hero.products': { en: 'View Products', rk: 'Reeba ebyokugurisha', rn: 'Reeba ebyokugurisha' },

  // Products
  'products.title': { en: 'Our Products', rk: 'Ebyokugurisha byaitu', rn: 'Ebyokugurisha byaitu' },
  'products.subtitle': { en: 'Quality veterinary medicines and supplies', rk: 'Eddagara y\'ente n\'ebintu', rn: 'Eddagara y\'ente n\'ebintu' },
  'products.inStock': { en: 'In Stock', rk: 'Eriho', rn: 'Eriho' },
  'products.outOfStock': { en: 'Out of Stock', rk: 'Tirikuriho', rn: 'Tirikuriho' },
  'products.category': { en: 'Category', rk: 'Ekika', rn: 'Ekika' },
  'products.price': { en: 'Price', rk: 'Omuhendo', rn: 'Omuhendo' },
  'products.search': { en: 'Search products...', rk: 'Shaka ebyokugurisha...', rn: 'Shaka ebyokugurisha...' },

  // Chat
  'chat.title': { en: 'Live Consultation', rk: 'Okushabuurira', rn: 'Okushabuurira' },
  'chat.subtitle': { en: 'Chat with our veterinary expert', rk: 'Yogera n\'omushaho waitu', rn: 'Yogera n\'omushaho waitu' },
  'chat.placeholder': { en: 'Type your message...', rk: 'Andika ebyo orikwenda okugamba...', rn: 'Andika ebyo orikwenda okugamba...' },
  'chat.send': { en: 'Send', rk: 'Sindika', rn: 'Sindika' },
  'chat.name': { en: 'Your Name', rk: 'Eizina ryaawe', rn: 'Eizina ryaawe' },
  'chat.phone': { en: 'Phone Number (optional)', rk: 'Enamba y\'esimu (ti ya bwenganyize)', rn: 'Enamba y\'esimu (ti ya bwenganyize)' },
  'chat.start': { en: 'Start Chat', rk: 'Tandika okuyogera', rn: 'Tandika okuyogera' },
  'chat.welcome': { en: 'Welcome! How can we help your animals today?', rk: 'Tukusemereire! Nitwashobora kukuyamba tutye enju?', rn: 'Tukusemereire! Nitwashobora kukuyamba tutye enju?' },

  // Contact
  'contact.title': { en: 'Contact Us', rk: 'Tukorere ahabw\'enzi', rn: 'Tukorere ahabw\'enzi' },
  'contact.subtitle': { en: 'Reach us through any of these channels', rk: 'Tukorerere n\'enkora ezi', rn: 'Tukorerere n\'enkora ezi' },
  'contact.location': { en: 'Location', rk: 'Ahantu', rn: 'Ahantu' },
  'contact.locationDetail': { en: 'Opposite All Saints Church, Plot 50, Kabale', rk: 'Omu maiso ga All Saints Church, Plot 50, Kabale', rn: 'Omu maiso ga All Saints Church, Plot 50, Kabale' },
  'contact.whatsapp': { en: 'WhatsApp', rk: 'WhatsApp', rn: 'WhatsApp' },
  'contact.hours': { en: 'Working Hours', rk: 'Essaawa z\'okukora', rn: 'Essaawa z\'okukora' },
  'contact.hoursDetail': { en: 'Mon - Sat: 8:00 AM - 6:00 PM', rk: 'Jumatatu - Jumamosi: 8:00 AM - 6:00 PM', rn: 'Jumatatu - Jumamosi: 8:00 AM - 6:00 PM' },
  'contact.formTitle': { en: 'Send us a message', rk: 'Tuheereize obutumwa', rn: 'Tuheereize obutumwa' },
  'contact.formName': { en: 'Full Name', rk: 'Eizina ryaawe ryona', rn: 'Eizina ryaawe ryona' },
  'contact.formEmail': { en: 'Email Address', rk: 'Email', rn: 'Email' },
  'contact.formSubject': { en: 'Subject', rk: 'Omutwe gw\'eshonga', rn: 'Omutwe gw\'eshonga' },
  'contact.formMessage': { en: 'Message', rk: 'Obutumwa', rn: 'Obutumwa' },
  'contact.formSubmit': { en: 'Send Message', rk: 'Sindika obutumwa', rn: 'Sindika obutumwa' },
  'contact.success': { en: 'Message sent successfully!', rk: 'Obutumwa bwagyenda gye!', rn: 'Obutumwa bwagyenda gye!' },

  // Auth
  'auth.login': { en: 'Login', rk: 'Yingira', rn: 'Yingira' },
  'auth.signup': { en: 'Sign Up', rk: 'Iyandikise', rn: 'Iyandikise' },
  'auth.email': { en: 'Email', rk: 'Email', rn: 'Email' },
  'auth.password': { en: 'Password', rk: 'Ekigambo ky\'obuhiire', rn: 'Ekigambo ky\'obuhiire' },
  'auth.fullName': { en: 'Full Name', rk: 'Eizina ryaawe ryona', rn: 'Eizina ryaawe ryona' },
  'auth.fullNamePlaceholder': { en: 'e.g. John Mugisha', rk: 'nk. John Mugisha', rn: 'nk. John Mugisha' },
  'auth.submit': { en: 'Login', rk: 'Yingira', rn: 'Yingira' },
  'auth.logout': { en: 'Logout', rk: 'Fuuka', rn: 'Fuuka' },
  'auth.farmer': { en: 'Farmer', rk: 'Omuhingi', rn: 'Omuhingi' },
  'auth.admin': { en: 'Admin', rk: 'Omukozi', rn: 'Omukozi' },
  'auth.selectRole': { en: 'Login or create an account', rk: 'Yingira nari wandikise', rn: 'Yingira nari wandikise' },
  'auth.adminOnly': { en: 'Staff login only', rk: 'Ab\'okukora kwonka', rn: 'Ab\'okukora kwonka' },
  'auth.nameRequired': { en: 'Full name is required', rk: 'Eizina niritekwa', rn: 'Eizina niritekwa' },
  'auth.checkEmail': { en: 'Check your email', rk: 'Kebera email yaawe', rn: 'Kebera email yaawe' },
  'auth.verifyEmail': { en: 'We sent you a verification link. Please check your inbox.', rk: 'Tukutumire link. Kebera email yaawe.', rn: 'Tukutumire link. Kebera email yaawe.' },

  // Chat extras
  'chat.loginRequired': { en: 'You need to create an account or login to start a consultation.', rk: 'Oteekwa kwandikisa nari okwingira okutandika okushabuurira.', rn: 'Oteekwa kwandikisa nari okwingira okutandika okushabuurira.' },
  'chat.loginToChat': { en: 'Login / Sign Up', rk: 'Yingira / Iyandikise', rn: 'Yingira / Iyandikise' },

  // Admin
  'admin.dashboard': { en: 'Admin Dashboard', rk: 'Dashboard y\'omukozi', rn: 'Dashboard y\'omukozi' },
  'admin.conversations': { en: 'Conversations', rk: 'Emboozi', rn: 'Emboozi' },
  'admin.manageProducts': { en: 'Manage Products', rk: 'Ebyokugurisha', rn: 'Ebyokugurisha' },
  'admin.addProduct': { en: 'Add Product', rk: 'Ongeraho ekyokugurisha', rn: 'Ongeraho ekyokugurisha' },

  // Footer
  'footer.rights': { en: '© 2026 Kigezi Vet Drugshop. All rights reserved.', rk: '© 2026 Kigezi Vet Drugshop. Oburenganzira bwona.', rn: '© 2026 Kigezi Vet Drugshop. Oburenganzira bwona.' },

  // Testimonials
  'testimonials.title': { en: 'What Our Clients Say', rk: 'Ebi Abantu Bagamba', rn: 'Ebi Abantu Bagamba' },
  'testimonials.subtitle': { en: 'Trusted by farmers across the Kigezi region', rk: 'Abeikirizibwa abahiisa omu Kigezi yona', rn: 'Abeikirizibwa abahiisa omu Kigezi yona' },
  'testimonials.1.text': { en: 'Kigezi Vet Drugshop saved my herd during the last outbreak. Their staff are professional and the medicine is genuine.', rk: 'Kigezi Vet Drugshop nibo bakijije ente zangye omu bwire bw\'oburwaire. Abakozi babo n\'abokwikirizibwa.', rn: 'Kigezi Vet Drugshop nibo bakijije ente zangye omu bwire bw\'oburwaire. Abakozi babo n\'abokwikirizibwa.' },
  'testimonials.1.author': { en: 'Mugisha John', rk: 'Mugisha John', rn: 'Mugisha John' },
  'testimonials.1.location': { en: 'Dairy Farmer, Kabale', rk: 'Omuhiisa, Kabale', rn: 'Omuhiisa, Kabale' },
  'testimonials.2.text': { en: 'The best veterinary shop in the region! I always get my poultry vaccines here and they never disappoint.', rk: 'Shop y\'emibazi y\'ente ekurayo omuri Kigezi! Obwire bwona nshanga emibazi y\'enkoko ekaruhura.', rn: 'Shop y\'emibazi y\'ente ekurayo omuri Kigezi! Obwire bwona nshanga emibazi y\'enkoko ekaruhura.' },
  'testimonials.2.author': { en: 'Ankunda Sarah', rk: 'Ankunda Sarah', rn: 'Ankunda Sarah' },
  'testimonials.2.location': { en: 'Poultry Farmer, Kisoro', rk: 'Omuhiisa, Kisoro', rn: 'Omuhiisa, Kisoro' },
  'testimonials.3.text': { en: 'I appreciate their advice as much as their medicine. They truly care about the local farmer.', rk: 'Ninkunda obuhabuzi bwabo n\'emibazi yabo. Nibafa muno aha muhiisa.', rn: 'Ninkunda obuhabuzi bwabo n\'emibazi yabo. Nibafa muno aha muhiisa.' },
  'testimonials.3.author': { en: 'Byamugisha Frank', rk: 'Byamugisha Frank', rn: 'Byamugisha Frank' },
  'testimonials.3.location': { en: 'Cattle Farmer, Rukungiri', rk: 'Omuhiisa, Rukungiri', rn: 'Omuhiisa, Rukungiri' },

  // Errors
  'error.title': { en: 'Something went wrong', rk: 'Harimu ekizibu', rn: 'Harimu ekizibu' },
  'error.subtitle': { en: 'We apologize for the inconvenience. Please try again or contact support.', rk: 'Tukusaasire ahabw\'ekizibu eki. Tandika kabaakari nari tuteere esimu.', rn: 'Tukusaasire ahabw\'ekizibu eki. Tandika kabaakari nari tuteere esimu.' },
  'error.refresh': { en: 'Refresh Page', rk: 'Garuka kabaakari', rn: 'Garuka kabaakari' },
  'error.backHome': { en: 'Back to Home', rk: 'Garuka Eka', rn: 'Garuka Eka' },
};

export function t(key: string, lang: Language): string {
  return translations[key]?.[lang] ?? translations[key]?.['en'] ?? key;
}
