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
    rw: 'Murakaza neza ku rubuga rw\'ibizamini rwa BCC',
  },
  portalDesc: {
    en: 'This portal lets you take your BCC class exams online, see your scores, and track your progress through all 7 classes. Your results are saved automatically.',
    fr: 'Ce portail vous permet de passer vos examens de classe BCC en ligne, de voir vos scores et de suivre votre progression. Vos résultats sont enregistrés automatiquement.',
    rw: 'Uru rubuga rugufasha gukora ibizamini bya BCC kuri interineti, kureba amanota yawe, no gukurikirana aho ugeze. Ibisubizo byawe bibikwa igihe cyose.',
  },
  firstTime: {
    en: 'First time here',
    fr: 'Première visite',
    rw: 'Ni ubwa mbere nkoresheje uru rubuga',
  },
  firstTimeDesc: {
    en: 'I have never used this portal before. I want to register and start my exams.',
    fr: 'Je n\'ai jamais utilisé ce portail. Je veux m\'inscrire et commencer mes examens.',
    rw: 'Ntabwo ndakoresha uru rubuga. Ndashaka kwiyandikisha no gutangira ibizamini.',
  },
  alreadyRegistered: {
    en: 'I have already registered',
    fr: 'Je me suis déjà inscrit(e)',
    rw: 'Nariyandikishije',
  },
  alreadyRegisteredDesc: {
    en: 'I have used this portal before and want to access my exams.',
    fr: 'J\'ai déjà utilisé ce portail et je veux accéder à mes examens.',
    rw: 'Nakoresheje uru rubuga mbere kandi ndashaka kubona ibizamini byanjye.',
  },
  welcomeBack: {
    en: 'Welcome back',
    fr: 'Bon retour',
    rw: 'Murakaza neza nanone',
  },
  enterContact: {
    en: 'Enter the email address or phone number you used when you registered.',
    fr: 'Entrez l\'adresse e-mail ou le numéro de téléphone que vous avez utilisé lors de votre inscription.',
    rw: 'Andika imeli cyangwa nimero ya telefoni wakoresheje igihe wiyandikishaga.',
  },
  emailOrPhone: {
    en: 'Email or Phone Number',
    fr: 'E-mail ou Numéro de Téléphone',
    rw: 'Imeli cyangwa nimero ya telefoni',
  },
  emailOrPhonePlaceholder: {
    en: 'example@email.com or +1 613 555 0000',
    fr: 'exemple@email.com ou +1 613 555 0000',
    rw: 'urugero@imeli.com cyangwa +250 78 000 0000',
  },
  contactHint: {
    en: 'Use the same contact you gave when you first registered.',
    fr: 'Utilisez le même contact que vous avez fourni lors de votre inscription.',
    rw: 'Koresha amakuru watanze igihe wiyandikishaga bwa mbere.',
  },
  findAccount: {
    en: 'Find My Account →',
    fr: 'Trouver Mon Compte →',
    rw: 'Shaka konti yanjye →',
  },
  searching: {
    en: 'Searching…',
    fr: 'Recherche en cours…',
    rw: 'Turimo gushakisha…',
  },
  cantFind: {
    en: "Can't find your account?",
    fr: 'Compte introuvable?',
    rw: 'Konti yawe ntiboneka?',
  },
  registerNew: {
    en: 'Register as a new participant',
    fr: 'S\'inscrire comme nouveau participant',
    rw: 'Iyandikishe nk\'ukoresha uru rubuga bwa mbere',
  },
  back: {
    en: '← Back',
    fr: '← Retour',
    rw: '← Subira inyuma',
  },
  errorTimeout: {
    en: 'Could not reach the server. Please check your internet and try again, or ask your instructor for help.',
    fr: 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez, ou demandez de l\'aide à votre instructeur.',
    rw: 'Ntibyashobotse kugera kuri seriveri. Reba interineti yawe wongere ugerageze, cyangwa usabe umwigisha wawe kugufasha.',
  },
  errorGeneral: {
    en: 'Something went wrong. Please try again.',
    fr: 'Une erreur est survenue. Veuillez réessayer.',
    rw: 'Habaye ikosa. Ongera ugerageze.',
  },
  verse: {
    en: '"…go and make disciples of all nations…" — Matthew 28:19-20',
    fr: '"…allez, faites de toutes les nations des disciples…" — Matthieu 28:19-20',
    rw: '"…muhindure abantu bo mu mahanga yose abigishwa…" — Matayo 28:19-20',
  },

  // ── Register page ─────────────────────────────────────────────────────────────
  newParticipant: {
    en: 'New Participant',
    fr: 'Nouveau Participant',
    rw: 'Umunyeshuri mushya',
  },
  registerSubtitle: {
    en: 'Fill in your information to get started. This only takes a moment.',
    fr: 'Remplissez vos informations pour commencer. Cela ne prend qu\'un instant.',
    rw: 'Uzuza amakuru yawe kugira ngo utangire. Ibi bifata akanya gato gusa.',
  },
  firstName: {
    en: 'First Name *',
    fr: 'Prénom *',
    rw: 'Izina rya mbere *',
  },
  lastName: {
    en: 'Last Name *',
    fr: 'Nom *',
    rw: 'Izina ry\'umuryango *',
  },
  emailAddress: {
    en: 'Email Address',
    fr: 'Adresse E-mail',
    rw: 'Aderesi ya imeli',
  },
  phoneNumber: {
    en: 'Phone Number',
    fr: 'Numéro de Téléphone',
    rw: 'Nimero ya telefoni',
  },
  examLanguage: {
    en: 'Exam Language',
    fr: 'Langue d\'Examen',
    rw: 'Ururimi rw\'ikizamini',
  },
  country: {
    en: 'Country',
    fr: 'Pays',
    rw: 'Igihugu',
  },
  startLearning: {
    en: 'Start Learning →',
    fr: 'Commencer →',
    rw: 'Tangira kwiga →',
  },
  registering: {
    en: 'Registering…',
    fr: 'Inscription en cours…',
    rw: 'Turimo kukwandikisha…',
  },
  alreadyRegisteredQ: {
    en: 'Already registered?',
    fr: 'Déjà inscrit(e)?',
    rw: 'Wariyandikishije?',
  },
  goBackContact: {
    en: 'Go back and enter your contact info',
    fr: 'Retourner et entrer vos coordonnées',
    rw: 'Subira inyuma wuzuze ibisabwa.',
  },
  errorNameRequired: {
    en: 'Please enter your first and last name.',
    fr: 'Veuillez entrer votre prénom et nom.',
    rw: 'Andika amazina yawe yombi.',
  },
  errorContactRequired: {
    en: 'Please enter your email address or phone number.',
    fr: 'Veuillez entrer votre adresse e-mail ou numéro de téléphone.',
    rw: 'Andika aderesi ya imeli cyangwa nimero ya telefoni.',
  },
  errorRegister: {
    en: 'Could not register. Please try again.',
    fr: 'Impossible de vous inscrire. Veuillez réessayer.',
    rw: 'Kwiyandikisha ntibyashobotse. Ongera ugerageze.',
  },

  // ── Promotion & region fields ─────────────────────────────────────────────
  promotionSection: {
    en: 'Promotion Type',
    fr: 'Type de Promotion',
    rw: 'Uburyo bwo kwitabira',
  },
  onlinePromotion: {
    en: 'Online Promotion',
    fr: 'Promotion en Ligne',
    rw: 'Abitabira bakoresheje uburyo bwa Interineti (Online)',
  },
  onlinePromotionDesc: {
    en: 'I will attend classes and exams remotely over the internet.',
    fr: 'Je suivrai les cours et examens à distance via internet.',
    rw: 'Nkurikirana amasomo kuri Interineti (Zoom).',
  },
  inPersonPromotion: {
    en: 'In-Person Promotion',
    fr: 'Promotion en Présentiel',
    rw: 'Nitabira imbonankubone kuri ERC',
  },
  inPersonPromotionDesc: {
    en: 'I will attend classes and exams physically at a location.',
    fr: 'Je suivrai les cours et examens en personne sur place.',
    rw: 'Nkurikirana amasomo imbonankubone kuri ERC.',
  },
  canadaRegion: {
    en: 'Canada Region',
    fr: 'Région du Canada',
    rw: 'Igihugu cya Canada',
  },
  onlineGroup: {
    en: 'Online Group / Section',
    fr: 'Groupe / Section en Ligne',
    rw: 'Ishami rya Online muri ryo uri',
  },
  onlineGroupEast: {
    en: '🌅 East — Ottawa · Toronto · Montréal…',
    fr: '🌅 Est — Ottawa · Toronto · Montréal…',
    rw: '🌅 Iburasirazuba — Ottawa · Toronto · Montréal…',
  },
  onlineGroupWest: {
    en: '🌄 West — Edmonton · Vancouver · Calgary…',
    fr: '🌄 Ouest — Edmonton · Vancouver · Calgary…',
    rw: '🌄 Iburengerazuba — Edmonton · Vancouver · Calgary…',
  },
  eastCanada: {
    en: 'East Canada',
    fr: 'Canada Est',
    rw: 'Canada y\'Iburasirazuba',
  },
  westCanada: {
    en: 'West Canada',
    fr: 'Canada Ouest',
    rw: 'Canada y\'Iburengerazuba',
  },
  province: {
    en: 'Province / Territory',
    fr: 'Province / Territoire',
    rw: 'Intara / Teritwari',
  },
  selectProvince: {
    en: 'Select your province…',
    fr: 'Choisissez votre province…',
    rw: 'Hitamo intara cyangwa teritwari yawe…',
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
    rw: (n: number, total: number) => `Watsinze amasomo ${n} kuri ${total}`,
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
    rw: 'Umwigisha wawe azajya afungura buri kizamini igihe kigeze. Ongera ugaruke vuba!',
  },
  open:      { en: 'Open',    fr: 'Ouvert', rw: 'Igikinguye' },
  closed:    { en: 'Closed',  fr: 'Fermé',  rw: 'Igifunze'   },
  bestScore: { en: 'Best score:', fr: 'Meilleur score:', rw: 'Amanota yawe menshi:' },
  passed:    { en: 'Passed',  fr: 'Réussi',  rw: 'Watsinze'    },
  failed:    { en: 'Failed',  fr: 'Échoué',  rw: 'Ntiwatsinze' },
  attempts: {
    en: (n: number) => `${n} attempt${n !== 1 ? 's' : ''}`,
    fr: (n: number) => `${n} tentative${n !== 1 ? 's' : ''}`,
    rw: (n: number) => `Inshuro ${n}`,
  },
  language:   { en: 'Language', fr: 'Langue', rw: 'Ururimi' },
  notStarted: { en: 'Not started yet', fr: 'Pas encore commencé', rw: 'Ntikiratangira' },
  takeExam:   { en: 'Take Exam',    fr: 'Passer l\'Examen',    rw: 'Kora ikizamini'    },
  retakeExam: { en: 'Retake Exam',  fr: 'Repasser l\'Examen',  rw: 'Subiramo ikizamini' },
  viewResults:{ en: 'View Results', fr: 'Voir les Résultats',  rw: 'Reba amanota'       },
  loadingDashboard: {
    en: 'Loading your dashboard…',
    fr: 'Chargement de votre tableau de bord…',
    rw: 'Turimo gutegura dashboard yawe…',
  },

  // ── Exam page ─────────────────────────────────────────────────────────────────
  questionOf: {
    en: (n: number, total: number) => `Question ${n} of ${total}`,
    fr: (n: number, total: number) => `Question ${n} sur ${total}`,
    rw: (n: number, total: number) => `Ikibazo ${n} kuri ${total}`,
  },
  answered: {
    en: (n: number, total: number) => `${n} of ${total} answered`,
    fr: (n: number, total: number) => `${n} sur ${total} répondues`,
    rw: (n: number, total: number) => `Ibibazo ${n} kuri ${total} byasubijwe`,
  },
  prev:       { en: '← Previous', fr: '← Précédent', rw: '← Icyabanje'   },
  next:       { en: 'Next →',      fr: 'Suivant →',   rw: 'Igikurikira →' },
  submitExam: { en: 'Submit Exam', fr: 'Soumettre l\'Examen', rw: 'Ohereza ikizamini' },
  confirmTitle: {
    en: 'Submit this exam?',
    fr: 'Soumettre cet examen?',
    rw: 'Urashaka kohereza iki kizamini?',
  },
  confirmDesc: {
    en: (answered: number, total: number) =>
      `You have answered ${answered} out of ${total} questions. You cannot change your answers after submitting.`,
    fr: (answered: number, total: number) =>
      `Vous avez répondu à ${answered} questions sur ${total}. Vous ne pouvez pas modifier vos réponses après la soumission.`,
    rw: (answered: number, total: number) =>
      `Wasubije ibibazo ${answered} kuri ${total}. Nyuma yo kohereza, ntuzashobora guhindura ibisubizo byawe.`,
  },
  confirmBtn: { en: 'Yes, Submit', fr: 'Oui, Soumettre', rw: 'Yego, ohereza'  },
  cancelBtn:  { en: 'Cancel',      fr: 'Annuler',         rw: 'Hagarika'       },
  submitting: { en: 'Submitting…', fr: 'Envoi en cours…', rw: 'Turimo kohereza…' },
  examLoading: {
    en: 'Loading exam…',
    fr: 'Chargement de l\'examen…',
    rw: 'Turimo gutegura ikizamini…',
  },

  // ── Results page ──────────────────────────────────────────────────────────────
  yourResults: { en: 'Your Results', fr: 'Vos Résultats', rw: 'Ibisubizo Byawe' },
  loadingResults: {
    en: 'Loading results…',
    fr: 'Chargement des résultats…',
    rw: 'Turimo gutegura ibisubizo…',
  },
  questionBreakdown: {
    en: 'Question Breakdown',
    fr: 'Détail des Questions',
    rw: 'Ibisobanuro kuri buri kibazo',
  },
  yourAnswer:    { en: 'Your answer:',    fr: 'Votre réponse:',    rw: 'Igisubizo cyawe:'      },
  notAnswered:   { en: 'Not answered',    fr: 'Sans réponse',      rw: 'Nta gisubizo cyatanzwe' },
  correctAnswer: { en: 'Correct answer:', fr: 'Réponse correcte:', rw: 'Igisubizo gikwiye:'    },
  resultPassed:  { en: '✓ Passed',        fr: '✓ Réussi',          rw: '✓ Watsinze'             },
  resultFailed:  { en: '✗ Not Passed',    fr: '✗ Non Réussi',      rw: '✗ Ntiwatsinze'          },
  attemptLabel: {
    en: (n: number, lang: string) => `Attempt #${n} · ${lang.toUpperCase()}`,
    fr: (n: number, lang: string) => `Tentative #${n} · ${lang.toUpperCase()}`,
    rw: (n: number, lang: string) => `Inshuro #${n} · ${lang.toUpperCase()}`,
  },
  backToDashboard: {
    en: '← Back to Dashboard',
    fr: '← Tableau de bord',
    rw: '← Subira ku bizamini',
  },
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
