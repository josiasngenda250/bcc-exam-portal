export type Lang = 'en' | 'fr' | 'rw';

export const T = {
  // ── Language picker ─────────────────────────────────────────────────────────
  pickLang: {
    en: 'Choose your language',
    fr: 'Choisissez votre langue',
    rw: 'Hitamo ururimi rwawe',
  },

  // ── Landing page ─────────────────────────────────────────────────────────────
  welcome: {
    en: 'Welcome to the BCC Exam Portal',
    fr: 'Bienvenue sur le Portail d\'Examen BCC',
    rw: 'Murakaza neza mu Mbuga y\'Ibizamini ya BCC',
  },
  portalDesc: {
    en: 'This portal lets you take your BCC class exams online, see your scores, and track your progress through all 7 classes. Your results are saved automatically.',
    fr: 'Ce portail vous permet de passer vos examens de classe BCC en ligne, de voir vos scores et de suivre votre progression. Vos résultats sont enregistrés automatiquement.',
    rw: 'Uru rubuga rugufasha gukora ibizamini bya BCC kuri interineti, kureba amanota yawe, no gukurikirana amajyambere yawe. Ibisubizo byawe bigumizwa buri gihe.',
  },
  firstTime: {
    en: 'First time here',
    fr: 'Première visite',
    rw: 'Uza bwa mbere',
  },
  firstTimeDesc: {
    en: 'I have never used this portal before. I want to register and start my exams.',
    fr: 'Je n\'ai jamais utilisé ce portail. Je veux m\'inscrire et commencer mes examens.',
    rw: 'Ntabwo narigeze nakoresha uru rubuga. Ndashaka kwandikisha no gutangira ibizamini.',
  },
  alreadyRegistered: {
    en: 'I have already registered',
    fr: 'Je me suis déjà inscrit(e)',
    rw: 'Narayandikishije kera',
  },
  alreadyRegisteredDesc: {
    en: 'I have used this portal before and want to access my exams.',
    fr: 'J\'ai déjà utilisé ce portail et je veux accéder à mes examens.',
    rw: 'Narigeze nakoresha uru rubuga kandi ndashaka kugera ku bizamini byanjye.',
  },
  welcomeBack: {
    en: 'Welcome back',
    fr: 'Bon retour',
    rw: 'Murakaza neza',
  },
  enterContact: {
    en: 'Enter the email address or phone number you used when you registered.',
    fr: 'Entrez l\'adresse e-mail ou le numéro de téléphone que vous avez utilisé lors de votre inscription.',
    rw: 'Shyira aderesi ya imeli cyangwa numero ya telefoni wakoresha igihe wandikishaga.',
  },
  emailOrPhone: {
    en: 'Email or Phone Number',
    fr: 'E-mail ou Numéro de Téléphone',
    rw: 'Imeli cyangwa Numero ya Telefoni',
  },
  emailOrPhonePlaceholder: {
    en: 'example@email.com or +1 613 555 0000',
    fr: 'exemple@email.com ou +1 613 555 0000',
    rw: 'urugero@imeli.com cyangwa +250 78 000 0000',
  },
  contactHint: {
    en: 'Use the same contact you gave when you first registered.',
    fr: 'Utilisez le même contact que vous avez fourni lors de votre inscription.',
    rw: 'Koresha amakuru yawe yo gutumanahana watanze igihe wandikishaga bwa mbere.',
  },
  findAccount: {
    en: 'Find My Account →',
    fr: 'Trouver Mon Compte →',
    rw: 'Shaka Konti Yanjye →',
  },
  searching: {
    en: 'Searching…',
    fr: 'Recherche en cours…',
    rw: 'Gushakisha…',
  },
  cantFind: {
    en: "Can't find your account?",
    fr: 'Compte introuvable?',
    rw: 'Konti yawe ntiboneka?',
  },
  registerNew: {
    en: 'Register as a new participant',
    fr: 'S\'inscrire comme nouveau participant',
    rw: 'Iyandikishe nk\'umunyeshuri mushya',
  },
  back: {
    en: '← Back',
    fr: '← Retour',
    rw: '← Garuka',
  },
  errorTimeout: {
    en: 'Could not reach the server. Please check your internet and try again, or ask your instructor for help.',
    fr: 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez, ou demandez de l\'aide à votre instructeur.',
    rw: 'Ntibyashobotse kugera kuri seriveri. Reba interineti yawe ugerageze nanone, cyangwa usabe ubufasha kuri mwigisha wawe.',
  },
  errorGeneral: {
    en: 'Something went wrong. Please try again.',
    fr: 'Une erreur est survenue. Veuillez réessayer.',
    rw: 'Habaye ikosa. Gerageza nanone.',
  },
  verse: {
    en: '"…go and make disciples of all nations…" — Matthew 28:19-20',
    fr: '"…allez, faites de toutes les nations des disciples…" — Matthieu 28:19-20',
    rw: '"…nimugire abigishwa mu mahanga yose…" — Matayo 28:19-20',
  },

  // ── Register page ─────────────────────────────────────────────────────────────
  newParticipant: {
    en: 'New Participant',
    fr: 'Nouveau Participant',
    rw: 'Umunyeshuri Mushya',
  },
  registerSubtitle: {
    en: 'Fill in your information to get started. This only takes a moment.',
    fr: 'Remplissez vos informations pour commencer. Cela ne prend qu\'un instant.',
    rw: 'Uzuza amakuru yawe kugira ngo utangire. Ibi bitwara akanya gato gusa.',
  },
  firstName: {
    en: 'First Name *',
    fr: 'Prénom *',
    rw: 'Izina rya mbere *',
  },
  lastName: {
    en: 'Last Name *',
    fr: 'Nom *',
    rw: 'Izina rya nyuma *',
  },
  emailAddress: {
    en: 'Email Address',
    fr: 'Adresse E-mail',
    rw: 'Aderesi ya Imeli',
  },
  phoneNumber: {
    en: 'Phone Number',
    fr: 'Numéro de Téléphone',
    rw: 'Numero ya Telefoni',
  },
  examLanguage: {
    en: 'Exam Language',
    fr: 'Langue d\'Examen',
    rw: 'Ururimi rw\'Ikizamini',
  },
  country: {
    en: 'Country',
    fr: 'Pays',
    rw: 'Igihugu',
  },
  startLearning: {
    en: 'Start Learning →',
    fr: 'Commencer →',
    rw: 'Tangira Kwiga →',
  },
  registering: {
    en: 'Registering…',
    fr: 'Inscription en cours…',
    rw: 'Kwandikisha…',
  },
  alreadyRegisteredQ: {
    en: 'Already registered?',
    fr: 'Déjà inscrit(e)?',
    rw: 'Warayandikishije kera?',
  },
  goBackContact: {
    en: 'Go back and enter your contact info',
    fr: 'Retourner et entrer vos coordonnées',
    rw: 'Garuka ushyire amakuru yawe',
  },
  errorNameRequired: {
    en: 'Please enter your first and last name.',
    fr: 'Veuillez entrer votre prénom et nom.',
    rw: 'Nyamuneka shyira amazina yawe yombi.',
  },
  errorContactRequired: {
    en: 'Please enter your email address or phone number.',
    fr: 'Veuillez entrer votre adresse e-mail ou numéro de téléphone.',
    rw: 'Nyamuneka shyira aderesi ya imeli cyangwa numero ya telefoni.',
  },
  errorRegister: {
    en: 'Could not register. Please try again.',
    fr: 'Impossible de vous inscrire. Veuillez réessayer.',
    rw: 'Kwandikisha ntibyashobotse. Gerageza nanone.',
  },

  // ── Promotion & region fields ─────────────────────────────────────────────
  promotionSection: {
    en: 'Promotion Type',
    fr: 'Type de Promotion',
    rw: 'Ubwoko bw\'Igiciro',
  },
  onlinePromotion: {
    en: 'Online Promotion',
    fr: 'Promotion en Ligne',
    rw: 'Igiciro kuri Interineti',
  },
  onlinePromotionDesc: {
    en: 'I will attend classes and exams remotely over the internet.',
    fr: 'Je suivrai les cours et examens à distance via internet.',
    rw: 'Nzakurikira amasomo n\'ibizamini kuri interineti.',
  },
  inPersonPromotion: {
    en: 'In-Person Promotion',
    fr: 'Promotion en Présentiel',
    rw: 'Igiciro iri Aho',
  },
  inPersonPromotionDesc: {
    en: 'I will attend classes and exams physically at a location.',
    fr: 'Je suivrai les cours et examens en personne sur place.',
    rw: 'Nzakurikira amasomo n\'ibizamini iri aho.',
  },
  canadaRegion: {
    en: 'Canada Region',
    fr: 'Région du Canada',
    rw: 'Akarere ka Kanada',
  },
  eastCanada: {
    en: 'East Canada',
    fr: 'Canada Est',
    rw: 'Kanada y\'Iburasirazuba',
  },
  westCanada: {
    en: 'West Canada',
    fr: 'Canada Ouest',
    rw: 'Kanada y\'Iburengerazuba',
  },
  province: {
    en: 'Province / Territory',
    fr: 'Province / Territoire',
    rw: 'Intara / Akarere',
  },
  selectProvince: {
    en: 'Select your province…',
    fr: 'Choisissez votre province…',
    rw: 'Hitamo intara yawe…',
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────────
  hello: {
    en: 'Hello',
    fr: 'Bonjour',
    rw: 'Muraho',
  },
  classesPassed: {
    en: (n: number, total: number) => `${n} of ${total} classes passed`,
    fr: (n: number, total: number) => `${n} sur ${total} cours réussis`,
    rw: (n: number, total: number) => `Amasomo ${n} mu ${total} yanyuzwe`,
  },
  signOut: {
    en: 'Sign Out',
    fr: 'Déconnexion',
    rw: 'Sohoka',
  },
  noExamsOpen: {
    en: 'No exams open yet',
    fr: 'Aucun examen ouvert pour l\'instant',
    rw: 'Nta bizamini bifunguye ubu',
  },
  noExamsDesc: {
    en: 'Your instructor will unlock each exam when the class is ready. Check back soon!',
    fr: 'Votre instructeur débloquera chaque examen quand la classe sera prête. Revenez bientôt!',
    rw: 'Umwigisha wawe azafungura buri kizamini igihe ishuri rizaba riri gutegurwa. Ongera kugaruka vuba!',
  },
  open: { en: 'Open', fr: 'Ouvert', rw: 'Bifunguye' },
  closed: { en: 'Closed', fr: 'Fermé', rw: 'Bifunzwe' },
  bestScore: { en: 'Best score:', fr: 'Meilleur score:', rw: 'Amanota meza:' },
  passed: { en: 'Passed', fr: 'Réussi', rw: 'Yanyuzwe' },
  failed: { en: 'Failed', fr: 'Échoué', rw: 'Yanze' },
  attempts: {
    en: (n: number) => `${n} attempt${n !== 1 ? 's' : ''}`,
    fr: (n: number) => `${n} tentative${n !== 1 ? 's' : ''}`,
    rw: (n: number) => `${n} gerageza`,
  },
  language: { en: 'Language', fr: 'Langue', rw: 'Ururimi' },
  notStarted: { en: 'Not started yet', fr: 'Pas encore commencé', rw: 'Ntabwo yatangiye' },
  takeExam: { en: 'Take Exam', fr: 'Passer l\'Examen', rw: 'Kora Ikizamini' },
  retakeExam: { en: 'Retake Exam', fr: 'Repasser l\'Examen', rw: 'Subiramo Ikizamini' },
  viewResults: { en: 'View Results', fr: 'Voir les Résultats', rw: 'Reba Ibisubizo' },
  loadingDashboard: {
    en: 'Loading your dashboard…',
    fr: 'Chargement de votre tableau de bord…',
    rw: 'Gutegura ibiri muri konti yawe…',
  },

  // ── Exam page ─────────────────────────────────────────────────────────────────
  questionOf: {
    en: (n: number, total: number) => `Question ${n} of ${total}`,
    fr: (n: number, total: number) => `Question ${n} sur ${total}`,
    rw: (n: number, total: number) => `Ikibazo ${n} muri ${total}`,
  },
  answered: {
    en: (n: number, total: number) => `${n} of ${total} answered`,
    fr: (n: number, total: number) => `${n} sur ${total} répondues`,
    rw: (n: number, total: number) => `${n} muri ${total} byasubijwe`,
  },
  prev: { en: '← Previous', fr: '← Précédent', rw: '← Ibanziriza' },
  next: { en: 'Next →', fr: 'Suivant →', rw: 'Ikurikira →' },
  submitExam: { en: 'Submit Exam', fr: 'Soumettre l\'Examen', rw: 'Ohereza Ikizamini' },
  confirmTitle: { en: 'Submit this exam?', fr: 'Soumettre cet examen?', rw: 'Ohereza iki kizamini?' },
  confirmDesc: {
    en: (answered: number, total: number) => `You have answered ${answered} out of ${total} questions. You cannot change your answers after submitting.`,
    fr: (answered: number, total: number) => `Vous avez répondu à ${answered} questions sur ${total}. Vous ne pouvez pas modifier vos réponses après la soumission.`,
    rw: (answered: number, total: number) => `Wasubije ibibazo ${answered} muri ${total}. Ntushobora guhindura ibisubizo byawe nyuma yo kohereza.`,
  },
  confirmBtn: { en: 'Yes, Submit', fr: 'Oui, Soumettre', rw: 'Yego, Ohereza' },
  cancelBtn: { en: 'Cancel', fr: 'Annuler', rw: 'Reka' },
  submitting: { en: 'Submitting…', fr: 'Envoi en cours…', rw: 'Kohereza…' },
  examLoading: {
    en: 'Loading exam…',
    fr: 'Chargement de l\'examen…',
    rw: 'Gutegura ikizamini…',
  },

  // ── Results page ──────────────────────────────────────────────────────────────
  yourResults: { en: 'Your Results', fr: 'Vos Résultats', rw: 'Ibisubizo Byawe' },
  loadingResults: {
    en: 'Loading results…',
    fr: 'Chargement des résultats…',
    rw: 'Gutegura ibisubizo…',
  },
  questionBreakdown: {
    en: 'Question Breakdown',
    fr: 'Détail des Questions',
    rw: 'Ibisubizo kuri Buri Kibazo',
  },
  yourAnswer: { en: 'Your answer:', fr: 'Votre réponse:', rw: 'Igisubizo cyawe:' },
  notAnswered: { en: 'Not answered', fr: 'Sans réponse', rw: 'Ntibyasubijwe' },
  correctAnswer: { en: 'Correct answer:', fr: 'Réponse correcte:', rw: 'Igisubizo gikwiye:' },
  resultPassed: { en: '✓ Passed', fr: '✓ Réussi', rw: '✓ Yanyuzwe' },
  resultFailed: { en: '✗ Not Passed', fr: '✗ Non Réussi', rw: '✗ Ntiyanyuzwe' },
  attemptLabel: {
    en: (n: number, lang: string) => `Attempt #${n} · ${lang.toUpperCase()}`,
    fr: (n: number, lang: string) => `Tentative #${n} · ${lang.toUpperCase()}`,
    rw: (n: number, lang: string) => `Gerageza #${n} · ${lang.toUpperCase()}`,
  },
  backToDashboard: { en: '← Back to Dashboard', fr: '← Tableau de bord', rw: '← Garuka ku rubuga' },
} as const;

/** Read the active language from localStorage (SSR-safe). */
export function getLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  return (localStorage.getItem('bcc_lang') as Lang) || 'en';
}

export function setLang(lang: Lang) {
  if (typeof window !== 'undefined') localStorage.setItem('bcc_lang', lang);
}

/** Translate a key. Works with both plain string values and function values. */
export function t(key: keyof typeof T, lang: Lang, ...args: number[]): string {
  const val = T[key][lang];
  if (typeof val === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (val as any)(...args);
  }
  return val as string;
}
