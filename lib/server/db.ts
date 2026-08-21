// In-memory persistent database store for ToumAnina

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "family" | "admin";
  passwordHash: string; // Stored hash
  patientExitPin?: string; // 4-digit PIN for exiting Patient Mode (default: "1234")
  createdAt: string;
  activePatientId?: string;
  isActive?: boolean; // Account status (active/disabled)
}

export interface Patient {
  id: string;
  familyId: string;
  name: string;
  birthDate: string;
  bloodType?: string;
  emergencyPhone: string;
  photoUrl?: string;
  dailyHabits?: string;
  dietPreferences?: string;
  medicalNotes?: string;
  safeLatitude: number;
  safeLongitude: number;
  safeRadiusMeters: number;
  createdAt: string;
}

export interface LocationRecord {
  id: string;
  patientId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  isInsideSafeZone: boolean;
  distanceFromHomeMeters: number;
  recordedAt: string;
  source: "patient_device" | "simulation" | "manual";
}

export interface MoodRecord {
  id: string;
  patientId: string;
  mood: "very_good" | "good" | "neutral" | "difficult";
  notes?: string;
  recordedBy: "patient" | "caregiver";
  recordedAt: string;
}

export interface ActivityRecord {
  id: string;
  patientId: string;
  activityType: "memory_pairs" | "photo_memory" | "daily_puzzle" | "number_sequence" | "color_quiz" | "math_easy" | "word_match";
  score: number;
  turns: number;
  durationSeconds: number;
  completedAt: string;
}

export interface SafetyAlert {
  id: string;
  familyId: string;
  patientId: string;
  patientName: string;
  type: "geofence_exit" | "manual_sos" | "low_battery";
  title: string;
  description: string;
  latitude?: number;
  longitude?: number;
  severity: "high" | "medium" | "low";
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  details: string;
  ip?: string;
  createdAt: string;
}

export interface ActivityTemplate {
  id: string;
  titleFr: string;
  titleAr: string;
  descriptionFr: string;
  descriptionAr: string;
  type: "memory_pairs" | "photo_memory" | "daily_puzzle" | "number_sequence" | "color_quiz" | "math_easy" | "word_match";
  difficulty: "easy" | "medium" | "hard";
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  titleFr: string;
  titleAr: string;
  contentFr: string;
  contentAr: string;
  category: "advice" | "exercise" | "nutrition" | "news";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Distance calculation using Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Simple base64/salt hash simulator for demo reliability
export function hashPassword(password: string): string {
  return Buffer.from(`toumoanina_salt_${password}`).toString("base64");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Global persistent in-memory store attached to globalThis in Node.js runtime
interface GlobalStore {
  users: User[];
  patients: Patient[];
  locations: LocationRecord[];
  moods: MoodRecord[];
  activities: ActivityRecord[];
  alerts: SafetyAlert[];
  logs: AuditLog[];
  activityTemplates: ActivityTemplate[];
  contentItems: ContentItem[];
}

const globalForDb = globalThis as unknown as { toumoaninaStore?: GlobalStore };

function initSeedData(): GlobalStore {
  const familyUser: User = {
    id: "usr_family_demo",
    name: "Famille Benali",
    email: "famille.demo@toumoanina.app",
    phone: "+213 549 18 19 11",
    role: "family",
    passwordHash: hashPassword("Famille123!"),
    patientExitPin: "1234",
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    activePatientId: "pat_mohammed_1",
  };

  const adminUser: User = {
    id: "usr_admin_demo",
    name: "Administrateur ToumAnina",
    email: "admin@gmail.com",
    phone: "+213 550 00 00 00",
    role: "admin",
    passwordHash: hashPassword("123456789"),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
  };

  const patient1: Patient = {
    id: "pat_mohammed_1",
    familyId: "usr_family_demo",
    name: "Mohammed Benali",
    birthDate: "1948-04-15",
    bloodType: "O+",
    emergencyPhone: "+213 549 18 19 11",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    dailyHabits: "Prend son thé à la menthe à 16h au jardin. Promenade habituelle le matin vers 10h.",
    dietPreferences: "Régime peu salé. Aime les dattes et le thé léger. Allergique aux arachides.",
    medicalNotes: "Stade modéré Alzheimer. Traitement quotidien à prendre à 8h et 20h. Très sensible aux bruits forts.",
    safeLatitude: 36.7538, // Alger (Hydra/El Mouradia)
    safeLongitude: 3.0588,
    safeRadiusMeters: 600,
    createdAt: new Date(Date.now() - 28 * 24 * 3600 * 1000).toISOString(),
  };

  const patient2: Patient = {
    id: "pat_fatima_2",
    familyId: "usr_family_demo",
    name: "Fatima Zohra Benali",
    birthDate: "1953-09-20",
    bloodType: "A+",
    emergencyPhone: "+213 549 18 19 11",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
    dailyHabits: "Lecture du Coran le matin, aime écouter les chants andalous l'après-midi.",
    dietPreferences: "Sans sucre ajouté. Préfère les plats traditionnels faits maison.",
    medicalNotes: "Suivi mémoire précoce. Bonne mobilité.",
    safeLatitude: 36.7538,
    safeLongitude: 3.0588,
    safeRadiusMeters: 800,
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
  };

  // Seed initial location records
  const locations: LocationRecord[] = [
    {
      id: "loc_1",
      patientId: "pat_mohammed_1",
      latitude: 36.7538,
      longitude: 3.0588,
      accuracy: 12,
      isInsideSafeZone: true,
      distanceFromHomeMeters: 0,
      recordedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      source: "patient_device",
    },
    {
      id: "loc_2",
      patientId: "pat_mohammed_1",
      latitude: 36.7545,
      longitude: 3.0601,
      accuracy: 15,
      isInsideSafeZone: true,
      distanceFromHomeMeters: 130,
      recordedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      source: "patient_device",
    },
    {
      id: "loc_3",
      patientId: "pat_mohammed_1",
      latitude: 36.7521,
      longitude: 3.0565,
      accuracy: 10,
      isInsideSafeZone: true,
      distanceFromHomeMeters: 260,
      recordedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      source: "patient_device",
    },
  ];

  // Seed moods
  const moods: MoodRecord[] = [
    {
      id: "mood_1",
      patientId: "pat_mohammed_1",
      mood: "good",
      notes: "Très souriant ce matin après le petit-déjeuner en famille.",
      recordedBy: "patient",
      recordedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: "mood_2",
      patientId: "pat_mohammed_1",
      mood: "good",
      notes: "A apprécié la promenade dans le jardin.",
      recordedBy: "caregiver",
      recordedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "mood_3",
      patientId: "pat_mohammed_1",
      mood: "neutral",
      notes: "Journée calme, un peu fatigué en fin d'après-midi.",
      recordedBy: "caregiver",
      recordedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    },
    {
      id: "mood_4",
      patientId: "pat_mohammed_1",
      mood: "good",
      notes: "Très réceptif aux jeux de mémoire.",
      recordedBy: "patient",
      recordedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    },
  ];

  // Seed cognitive activities
  const activities: ActivityRecord[] = [
    {
      id: "act_1",
      patientId: "pat_mohammed_1",
      activityType: "memory_pairs",
      score: 100,
      turns: 12,
      durationSeconds: 45,
      completedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: "act_2",
      patientId: "pat_mohammed_1",
      activityType: "memory_pairs",
      score: 100,
      turns: 14,
      durationSeconds: 58,
      completedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    },
    {
      id: "act_3",
      patientId: "pat_mohammed_1",
      activityType: "memory_pairs",
      score: 100,
      turns: 16,
      durationSeconds: 70,
      completedAt: new Date(Date.now() - 50 * 3600 * 1000).toISOString(),
    },
  ];

  // Seed safety alerts
  const alerts: SafetyAlert[] = [
    {
      id: "alt_1",
      familyId: "usr_family_demo",
      patientId: "pat_mohammed_1",
      patientName: "Mohammed Benali",
      type: "geofence_exit",
      title: "Sortie de zone de sécurité détectée",
      description: "Mohammed s'est éloigné de 720m du domicile (périmètre configuré à 600m).",
      latitude: 36.761,
      longitude: 3.065,
      severity: "high",
      isResolved: true,
      resolvedAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
  ];

  const logs: AuditLog[] = [
    {
      id: "log_1",
      userId: "usr_family_demo",
      userEmail: "famille.demo@toumoanina.app",
      action: "AUTH_LOGIN",
      details: "Connexion réussie espace famille",
      createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    },
    {
      id: "log_2",
      userId: "usr_family_demo",
      userEmail: "famille.demo@toumoanina.app",
      action: "PATIENT_MODE_START",
      details: "Activation du Mode Patient pour Mohammed Benali",
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    },
  ];

  const activityTemplates: ActivityTemplate[] = [
    {
      id: "tpl_1",
      titleFr: "Jeu des paires de mémoire",
      titleAr: "لعبة أزواج الذاكرة",
      descriptionFr: "Retrouvez les paires de cartes pour stimuler la mémoire visuelle et l'attention.",
      descriptionAr: "العثور على أزواج البطاقات المتطابقة لتحفيز الذاكرة البصرية والانتباه.",
      type: "memory_pairs",
      difficulty: "easy",
      durationMinutes: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "tpl_2",
      titleFr: "Reconnaissance de photos et souvenirs",
      titleAr: "التعرف على الصور والذكريات",
      descriptionFr: "Identifiez des objets, animaux et éléments familiers du quotidien.",
      descriptionAr: "التعرف على الأشياء والحيوانات والمشاهد اليومية لترسيخ الذاكرة.",
      type: "photo_memory",
      difficulty: "easy",
      durationMinutes: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "tpl_3",
      titleFr: "Suite de chiffres",
      titleAr: "تسلسل الأرقام",
      descriptionFr: "Mémorisez puis reproduisez une suite de chiffres simples.",
      descriptionAr: "احفظ تسلسل الأرقام وأعِد إدخالها بالترتيب الصحيح لتدريب التركيز.",
      type: "number_sequence",
      difficulty: "medium",
      durationMinutes: 8,
      isActive: true,
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "tpl_4",
      titleFr: "Quiz de couleurs et réflexes",
      titleAr: "اختبار الألوان والتركيز",
      descriptionFr: "Identifiez rapidement la couleur affichée pour stimuler les réflexes cognitifs.",
      descriptionAr: "تعرّف بسرعة على اللون المعروض لتحفيز الانتباه وسرعة الاستجابة.",
      type: "color_quiz",
      difficulty: "easy",
      durationMinutes: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "tpl_5",
      titleFr: "Calcul mental facile",
      titleAr: "الحساب الذهني البسيط",
      descriptionFr: "Résolvez des opérations simples de la vie quotidienne (+ et -).",
      descriptionAr: "حل عمليات جمع وطرح يومية بسيطة لتحفيز التفكير المنطقي.",
      type: "math_easy",
      difficulty: "easy",
      durationMinutes: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "tpl_6",
      titleFr: "Association d'objets du quotidien",
      titleAr: "مطابقة الأشياء المترابطة",
      descriptionFr: "Associez chaque objet à son usage ou son partenaire habituel.",
      descriptionAr: "اربط كل شيء بما يناسبه في الحياة اليومية (مثل: شاي 🫖 براد).",
      type: "word_match",
      difficulty: "easy",
      durationMinutes: 5,
      isActive: true,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  const contentItems: ContentItem[] = [
    {
      id: "cnt_1",
      titleFr: "Comprendre la maladie d'Alzheimer",
      titleAr: "فهم مرض الزهايمر",
      contentFr: "L'Alzheimer est une maladie neurodégénérative qui affecte la mémoire, le raisonnement et le comportement. Une prise en charge précoce améliore significativement la qualité de vie.",
      contentAr: "مرض الزهايمر هو مرض تنكسي عصبي يؤثر على الذاكرة والتفكير والسلوك. التدخل المبكر يحسّن بشكل ملحوظ من جودة الحياة.",
      category: "advice",
      isPublished: true,
      createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "cnt_2",
      titleFr: "Exercices de stimulation cognitive",
      titleAr: "تمارين التحفيز المعرفي",
      contentFr: "Des exercices réguliers comme les jeux de mémoire, la lecture et les activités créatives aident à ralentir le déclin cognitif et maintenir l'autonomie.",
      contentAr: "التمارين المنتظمة كألعاب الذاكرة والقراءة والأنشطة الإبداعية تساعد في إبطاء التراجع المعرفي والحفاظ على الاستقلالية.",
      category: "exercise",
      isPublished: true,
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "cnt_3",
      titleFr: "Alimentation et mémoire",
      titleAr: "التغذية والذاكرة",
      contentFr: "Un régime méditerranéen riche en oméga-3, antioxydants et légumes verts est associé à un meilleur maintien des fonctions cognitives chez les personnes âgées.",
      contentAr: "النظام الغذائي المتوسطي الغني بأوميغا-3 ومضادات الأكسدة والخضروات الورقية مرتبط بحفاظ أفضل على الوظائف المعرفية لدى كبار السن.",
      category: "nutrition",
      isPublished: false,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    users: [familyUser, adminUser],
    patients: [patient1, patient2],
    locations,
    moods,
    activities,
    alerts,
    logs,
    activityTemplates,
    contentItems,
  };
}

function getStore(): GlobalStore {
  if (!globalForDb.toumoaninaStore) {
    globalForDb.toumoaninaStore = initSeedData();
  }

  // Remove any old admin@toumoanina.app user
  globalForDb.toumoaninaStore.users = globalForDb.toumoaninaStore.users.filter(
    (u) => u.email.toLowerCase() !== "admin@toumoanina.app"
  );

  // Guarantee single admin@gmail.com
  const existingAdmin = globalForDb.toumoaninaStore.users.find(
    (u) => u.email.toLowerCase() === "admin@gmail.com" || u.id === "usr_admin_demo"
  );

  if (!existingAdmin) {
    globalForDb.toumoaninaStore.users.push({
      id: "usr_admin_demo",
      name: "Administrateur ToumAnina",
      email: "admin@gmail.com",
      phone: "+213 550 00 00 00",
      role: "admin",
      passwordHash: hashPassword("123456789"),
      createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    });
  } else {
    existingAdmin.id = "usr_admin_demo";
    existingAdmin.email = "admin@gmail.com";
    existingAdmin.passwordHash = hashPassword("123456789");
    existingAdmin.role = "admin";
  }

  // Deduplicate any duplicate IDs in users array
  globalForDb.toumoaninaStore.users = globalForDb.toumoaninaStore.users.filter(
    (u, index, self) => self.findIndex((o) => o.id === u.id) === index
  );

  // If demo family user exists, ensure valid credentials
  const familyUser = globalForDb.toumoaninaStore.users.find(
    (u) => u.email.toLowerCase() === "famille.demo@toumoanina.app" || u.id === "usr_family_demo"
  );
  if (familyUser) {
    familyUser.id = "usr_family_demo";
    familyUser.role = "family";
    familyUser.passwordHash = hashPassword("Famille123!");
  }

  // Ensure all 6 activity templates exist and are active
  const seedTemplates = initSeedData().activityTemplates;
  if (!globalForDb.toumoaninaStore.activityTemplates) {
    globalForDb.toumoaninaStore.activityTemplates = [...seedTemplates];
  } else {
    for (const tpl of seedTemplates) {
      const idx = globalForDb.toumoaninaStore.activityTemplates.findIndex((t) => t.id === tpl.id);
      if (idx === -1) {
        globalForDb.toumoaninaStore.activityTemplates.push(tpl);
      } else {
        globalForDb.toumoaninaStore.activityTemplates[idx] = { ...tpl, isActive: true };
      }
    }
  }
  if (!globalForDb.toumoaninaStore.contentItems || globalForDb.toumoaninaStore.contentItems.length === 0) {
    globalForDb.toumoaninaStore.contentItems = [
      {
        id: "cnt_1",
        titleFr: "Comprendre la maladie d'Alzheimer",
        titleAr: "فهم مرض الزهايمر",
        contentFr: "L'Alzheimer est une maladie neurodégénérative qui affecte la mémoire, le raisonnement et le comportement. Une prise en charge précoce améliore significativement la qualité de vie.",
        contentAr: "مرض الزهايمر هو مرض تنكسي عصبي يؤثر على الذاكرة والتفكير والسلوك. التدخل المبكر يحسّن بشكل ملحوظ من جودة الحياة.",
        category: "advice",
        isPublished: true,
        createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      },
      {
        id: "cnt_2",
        titleFr: "Exercices de stimulation cognitive",
        titleAr: "تمارين التحفيز المعرفي",
        contentFr: "Des exercices réguliers comme les jeux de mémoire, la lecture et les activités créatives aident à ralentir le déclin cognitif et maintenir l'autonomie.",
        contentAr: "التمارين المنتظمة كألعاب الذاكرة والقراءة والأنشطة الإبداعية تساعد في إبطاء التراجع المعرفي والحفاظ على الاستقلالية.",
        category: "exercise",
        isPublished: true,
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      },
    ];
  }

  return globalForDb.toumoaninaStore;
}

export const db: GlobalStore = new Proxy({} as GlobalStore, {
  get(_target, prop: keyof GlobalStore) {
    const store = getStore();
    return store[prop];
  },
  set(_target, prop: keyof GlobalStore, value) {
    const store = getStore();
    (store as any)[prop] = value;
    return true;
  },
});

export function resetDatabase(): GlobalStore {
  globalForDb.toumoaninaStore = initSeedData();
  return globalForDb.toumoaninaStore;
}

