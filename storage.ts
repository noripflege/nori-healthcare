import { type User, type InsertUser, type Resident, type InsertResident, type CareEntry, type InsertCareEntry, type AuditLog, type InsertAuditLog, type Settings, type InsertSettings, type Tenant, type InsertTenant, type FeatureFlag, type InsertFeatureFlag } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Tenants (Multi-Tenant Support)
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined>;
  getAllTenants(): Promise<Tenant[]>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, tenant: Partial<InsertTenant>): Promise<Tenant | undefined>;
  
  // Residents
  getResident(id: string): Promise<Resident | undefined>;
  getAllResidents(tenantId?: string): Promise<Resident[]>;
  getResidentsByTenant(tenantId: string): Promise<Resident[]>;
  createResident(resident: InsertResident): Promise<Resident>;
  updateResident(id: string, resident: Partial<InsertResident>): Promise<Resident | undefined>;
  deleteResident(id: string): Promise<boolean>;
  
  // Care Entries
  getCareEntry(id: string): Promise<CareEntry | undefined>;
  getCareEntriesByResident(residentId: string): Promise<CareEntry[]>;
  getCareEntriesByStatus(status: string, tenantId?: string): Promise<CareEntry[]>;
  getCareEntriesByTenant(tenantId: string): Promise<CareEntry[]>;
  getCareEntriesByAuthorAndStatus(authorId: string, status: string): Promise<CareEntry[]>;
  getAllCareEntries(tenantId?: string): Promise<CareEntry[]>;
  createCareEntry(entry: InsertCareEntry): Promise<CareEntry>;
  updateCareEntry(id: string, entry: Partial<InsertCareEntry>): Promise<CareEntry | undefined>;
  updateCareEntryProcessing(id: string, processing: {
    transcriptRaw?: string;
    transcriptDe?: string;
    draftJson?: any;
    pdfPath?: string;
    status?: string;
  }): Promise<CareEntry | undefined>;
  
  // Audit Logs
  getAuditLogs(tenantId?: string): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  
  // Settings
  getSetting(key: string): Promise<Settings | undefined>;
  setSetting(key: string, value: string, type?: string, description?: string): Promise<Settings>;
  
  // Feature Flags
  getFeatureFlag(tenantId: string | null, flagName: string): Promise<FeatureFlag | undefined>;
  setFeatureFlag(tenantId: string | null, flagName: string, isEnabled: boolean, value?: any): Promise<FeatureFlag>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tenants: Map<string, Tenant>;
  private residents: Map<string, Resident>;
  private careEntries: Map<string, CareEntry>;
  private auditLogs: Map<string, AuditLog>;
  private settings: Map<string, Settings>;
  private featureFlags: Map<string, FeatureFlag>;

  constructor() {
    this.users = new Map();
    this.tenants = new Map();
    this.residents = new Map();
    this.careEntries = new Map();
    this.auditLogs = new Map();
    this.settings = new Map();
    this.featureFlags = new Map();
    
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create demo tenant
    const demoTenant: Tenant = {
      id: "tenant-demo",
      name: "Demo Pflegeheim",
      subdomain: "demo",
      isActive: true,
      customConfig: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(demoTenant.id, demoTenant);

    // Create super admin (no tenant)
    const superAdmin: User = {
      id: "user-super",
      email: "admin@nori.app",
      name: "Nori Admin",
      role: "super_admin",
      tenantId: null,
      createdAt: new Date(),
    };
    this.users.set(superAdmin.id, superAdmin);

    // Create demo users with tenant
    const pflegeleitung: User = {
      id: "user-1",
      email: "leitung@nori.app",
      name: "Dr. Maria Schmidt",
      role: "lead",
      tenantId: "tenant-demo",
      createdAt: new Date(),
    };
    
    const pflegekraft: User = {
      id: "user-2",
      email: "pflege@nori.app", 
      name: "Lisa Weber",
      role: "caregiver",
      tenantId: "tenant-demo",
      createdAt: new Date(),
    };
    
    this.users.set(pflegeleitung.id, pflegeleitung);
    this.users.set(pflegekraft.id, pflegekraft);

    // Create demo residents as requested
    const resident1: Resident = {
      id: "resident-1",
      tenantId: "tenant-demo",
      name: "Anna M.",
      room: "101",
      dateOfBirth: "1943",
      status: "active", 
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const resident2: Resident = {
      id: "resident-2", 
      tenantId: "tenant-demo",
      name: "Mehmet K.",
      room: "102",
      dateOfBirth: "1939",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.residents.set(resident1.id, resident1);
    this.residents.set(resident2.id, resident2);

    // Create a demo final care entry for PDF viewing
    const demoEntry: CareEntry = {
      id: "entry-demo",
      tenantId: "tenant-demo",
      residentId: resident1.id,
      authorId: pflegekraft.id,
      status: "final",
      content: {
        vitalSigns: {
          bloodPressure: "135/85 mmHg",
          pulse: "78/min", 
          temperature: "36,7°C",
          weight: "72 kg"
        },
        medication: [
          {
            name: "Ramipril",
            dosage: "5mg",
            time: "08:00",
            administered: true
          }
        ],
        mobility: "Patient ist mit Rollator 50m im Flur gegangen. Sturzgefahr bei unbekannten Wegen.",
        nutrition: "Frühstück vollständig eingenommen. Trinkmenge gering, Ermutigung erforderlich. 800ml bis 12:00 Uhr.",
        hygiene: "Morgendliche Körperpflege mit Unterstützung durchgeführt. Patient kooperativ.",
        mood: "Patient wirkt müde aber ansprechbar. Keine kognitiven Auffälligkeiten.",
        specialNotes: "Keine besonderen Vorkommnisse.",
        recommendations: "Trinkmenge weiter überwachen und zur Flüssigkeitsaufnahme ermutigen."
      },
      draftJson: {
        vitalwerte: "Blutdruck 135/85 mmHg, Puls 78/min, Temperatur 36,7°C, Gewicht 72 kg",
        medikation: [
          {
            name: "Ramipril",
            dosis: "5mg", 
            uhrzeit: "08:00"
          }
        ],
        mobilität: "Patient ist mit Rollator 50m im Flur gegangen. Sturzgefahr bei unbekannten Wegen.",
        ernährung_flüssigkeit: "Frühstück vollständig eingenommen. Trinkmenge gering, 800ml bis 12:00 Uhr.",
        hygiene: "Morgendliche Körperpflege mit Unterstützung durchgeführt. Patient kooperativ.",
        stimmung_kognition: "Patient wirkt müde aber ansprechbar. Keine kognitiven Auffälligkeiten.",
        besonderheiten: "Keine besonderen Vorkommnisse.",
        empfehlungen: "Trinkmenge weiter überwachen und zur Flüssigkeitsaufnahme ermutigen."
      },
      transcriptRaw: "Demo transcript...",
      transcriptDe: "Demo German transcript...",
      pdfPath: "demo-report.pdf",
      approvedBy: pflegeleitung.id,
      approvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      comments: "Bericht vollständig und korrekt dokumentiert.",
      audioFilePath: null,
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // Day before yesterday
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    };

    this.careEntries.set(demoEntry.id, demoEntry);

    // Create demo care entries
    const entry1: CareEntry = {
      id: "entry-1",
      tenantId: "tenant-demo",
      residentId: "resident-1",
      authorId: "user-2",
      status: "pending",
      content: {
        vitalSigns: {
          bloodPressure: "120/80 mmHg",
          pulse: "72 bpm",
          temperature: "36.8°C",
          weight: "68 kg"
        },
        medication: [
          { name: "Ramipril", dosage: "5mg", time: "08:00", administered: true },
          { name: "Metformin", dosage: "850mg", time: "12:00", administered: true }
        ],
        mobility: "Bewohner ist mit Rollator mobil. Kurze Strecken im Zimmer ohne Hilfsmittel möglich. Sturzgefahr besteht bei unbekannten Wegen.",
        nutrition: "Frühstück vollständig eingenommen. Trinkmenge heute ca. 1,2L. Bewohner benötigt Ermutigung zum Trinken.",
        hygiene: "Morgendliche Körperpflege mit Unterstützung durchgeführt.",
        mood: "Bewohner wirkt ausgeglichen und aufmerksam.",
        specialNotes: "Keine besonderen Vorkommnisse.",
        recommendations: "Trinkmenge weiter beobachten."
      },
      audioFilePath: null,
      transcriptRaw: null,
      transcriptDe: null,
      draftJson: null,
      pdfPath: null,
      comments: null,
      approvedBy: null,
      approvedAt: null,
      speakerName: null,
      rejectionReason: null,
      rejectedBy: null,
      rejectedAt: null,
      createdAt: new Date("2024-11-15T14:30:00Z"),
      updatedAt: new Date("2024-11-15T14:30:00Z"),
    };
    
    const entry2: CareEntry = {
      id: "entry-2",
      tenantId: "tenant-demo",
      residentId: "resident-2",
      authorId: "user-2",
      status: "final",
      content: {
        vitalSigns: {
          bloodPressure: "135/85 mmHg",
          pulse: "78 bpm",
          temperature: "36.6°C",
          weight: "62 kg"
        },
        medication: [
          { name: "Enalapril", dosage: "10mg", time: "08:00", administered: true }
        ],
        mobility: "Bewohnerin geht selbstständig mit Gehstock.",
        nutrition: "Gute Nahrungsaufnahme, ausreichende Flüssigkeitszufuhr.",
        hygiene: "Selbstständige Körperpflege.",
        mood: "Freundlich und kommunikativ.",
        specialNotes: "Leichte Schwellung am rechten Knöchel beobachtet.",
        recommendations: "Beine hochlagern, Schwellung beobachten."
      },
      audioFilePath: null,
      transcriptRaw: null,
      transcriptDe: null,
      draftJson: null,
      pdfPath: "/pdf/entry-2.pdf",
      comments: "Guter Pflegebericht, vollständig dokumentiert.",
      approvedBy: "user-1",
      approvedAt: new Date("2024-11-14T16:45:00Z"),
      speakerName: null,
      rejectionReason: null,
      rejectedBy: null,
      rejectedAt: null,
      createdAt: new Date("2024-11-14T10:00:00Z"),
      updatedAt: new Date("2024-11-14T16:45:00Z"),
    };
    
    const entry3: CareEntry = {
      id: "entry-3",
      tenantId: "tenant-demo",
      residentId: "resident-1",
      authorId: "user-2",
      status: "draft",
      content: {
        vitalSigns: {
          bloodPressure: "118/76 mmHg",
          pulse: "70 bpm"
        },
        mobility: "Mobilisation im Rollstuhl durchgeführt."
      },
      audioFilePath: null,
      transcriptRaw: null,
      transcriptDe: null,
      draftJson: null,
      pdfPath: null,
      comments: null,
      approvedBy: null,
      approvedAt: null,
      speakerName: null,
      rejectionReason: null,
      rejectedBy: null,
      rejectedAt: null,
      createdAt: new Date("2024-11-13T09:15:00Z"),
      updatedAt: new Date("2024-11-13T09:15:00Z"),
    };
    
    this.careEntries.set(entry1.id, entry1);
    this.careEntries.set(entry2.id, entry2);
    this.careEntries.set(entry3.id, entry3);

    // Create demo audit logs
    const auditLogs: AuditLog[] = [
      {
        id: "audit-1",
        userId: "user-2",
        action: "CREATE_ENTRY",
        description: "Pflegebericht erstellt",
        entityType: "entry",
        entityId: "entry-1",
        metadata: { residentName: "Max Mustermann" },
        ipAddress: "192.168.1.42",
        timestamp: new Date("2024-11-15T14:30:00Z"),
      },
      {
        id: "audit-2",
        userId: "user-1",
        action: "APPROVE_ENTRY",
        description: "Bericht freigegeben",
        entityType: "entry",
        entityId: "entry-2",
        metadata: { residentName: "Anna Schmidt" },
        ipAddress: "192.168.1.12",
        timestamp: new Date("2024-11-14T16:45:00Z"),
      },
      {
        id: "audit-3",
        userId: "user-1",
        action: "CREATE_RESIDENT",
        description: "Bewohner angelegt",
        entityType: "resident",
        entityId: "resident-2",
        metadata: { residentName: "Anna Schmidt" },
        ipAddress: "192.168.1.12",
        timestamp: new Date("2024-11-13T09:15:00Z"),
      }
    ];
    
    auditLogs.forEach(log => this.auditLogs.set(log.id, log));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated: User = {
      ...user,
      ...updateData,
    };
    this.users.set(id, updated);
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Tenant methods
  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(t => t.subdomain === subdomain);
  }

  async getAllTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  async createTenant({
    name,
    subdomain,
    isActive = true,
    customConfig = {},
  }: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const now = new Date();
    const tenant: Tenant = {
      id,
      name,
      subdomain,
      isActive,
      customConfig,
      createdAt: now,
      updatedAt: now,
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<InsertTenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const updated: Tenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date(),
    };
    this.tenants.set(id, updated);
    return updated;
  }

  // Residents
  async getResident(id: string): Promise<Resident | undefined> {
    return this.residents.get(id);
  }

  async getAllResidents(tenantId?: string): Promise<Resident[]> {
    let residents = Array.from(this.residents.values());
    if (tenantId) {
      residents = residents.filter(r => r.tenantId === tenantId);
    }
    return residents.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getResidentsByTenant(tenantId: string): Promise<Resident[]> {
    return Array.from(this.residents.values())
      .filter(r => r.tenantId === tenantId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createResident(insertResident: InsertResident): Promise<Resident> {
    const id = randomUUID();
    const resident: Resident = {
      ...insertResident,
      id,
      status: insertResident.status || "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.residents.set(id, resident);
    return resident;
  }

  async updateResident(id: string, updateData: Partial<InsertResident>): Promise<Resident | undefined> {
    const resident = this.residents.get(id);
    if (!resident) return undefined;
    
    const updated: Resident = {
      ...resident,
      ...updateData,
      updatedAt: new Date(),
    };
    this.residents.set(id, updated);
    return updated;
  }

  async deleteResident(id: string): Promise<boolean> {
    return this.residents.delete(id);
  }

  // Care Entries
  async getCareEntry(id: string): Promise<CareEntry | undefined> {
    return this.careEntries.get(id);
  }

  async getCareEntriesByResident(residentId: string): Promise<CareEntry[]> {
    return Array.from(this.careEntries.values())
      .filter(entry => entry.residentId === residentId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async getCareEntriesByStatus(status: string, tenantId?: string): Promise<CareEntry[]> {
    let entries = Array.from(this.careEntries.values()).filter(entry => entry.status === status);
    if (tenantId) {
      entries = entries.filter(entry => entry.tenantId === tenantId);
    }
    return entries.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async getAllCareEntries(tenantId?: string): Promise<CareEntry[]> {
    let entries = Array.from(this.careEntries.values());
    if (tenantId) {
      entries = entries.filter(entry => entry.tenantId === tenantId);
    }
    return entries.sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async getCareEntriesByTenant(tenantId: string): Promise<CareEntry[]> {
    return Array.from(this.careEntries.values())
      .filter(entry => entry.tenantId === tenantId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async getCareEntriesByAuthorAndStatus(authorId: string, status: string): Promise<CareEntry[]> {
    return Array.from(this.careEntries.values())
      .filter(entry => entry.authorId === authorId && entry.status === status)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async createCareEntry(insertEntry: InsertCareEntry): Promise<CareEntry> {
    const id = randomUUID();
    const entry: CareEntry = {
      ...insertEntry,
      id,
      status: insertEntry.status || "draft",
      audioFilePath: insertEntry.audioFilePath || null,
      transcriptRaw: insertEntry.transcriptRaw || null,
      transcriptDe: insertEntry.transcriptDe || null,
      draftJson: insertEntry.draftJson || null,
      pdfPath: insertEntry.pdfPath || null,
      comments: insertEntry.comments || null,
      approvedBy: insertEntry.approvedBy || null,
      approvedAt: insertEntry.approvedAt || null,
      rejectionReason: insertEntry.rejectionReason || null,
      rejectedBy: insertEntry.rejectedBy || null,
      rejectedAt: insertEntry.rejectedAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.careEntries.set(id, entry);
    return entry;
  }

  async updateCareEntry(id: string, updateData: Partial<InsertCareEntry>): Promise<CareEntry | undefined> {
    const entry = this.careEntries.get(id);
    if (!entry) return undefined;
    
    const updated: CareEntry = {
      ...entry,
      ...updateData,
      updatedAt: new Date(),
    };
    this.careEntries.set(id, updated);
    return updated;
  }

  async updateCareEntryProcessing(id: string, processing: {
    transcriptRaw?: string;
    transcriptDe?: string;
    draftJson?: any;
    pdfPath?: string;
    status?: string;
  }): Promise<CareEntry | undefined> {
    const entry = this.careEntries.get(id);
    if (!entry) return undefined;

    const updated: CareEntry = { 
      ...entry, 
      ...processing,
      updatedAt: new Date() 
    };
    this.careEntries.set(id, updated);
    return updated;
  }

  // Audit Logs
  async getAuditLogs(tenantId?: string): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    if (tenantId) {
      // Filter logs by finding users that belong to the tenant
      const tenantUserIds = Array.from(this.users.values())
        .filter(user => user.tenantId === tenantId)
        .map(user => user.id);
      logs = logs.filter(log => 
        tenantUserIds.includes(log.userId) || 
        log.userId === "system" ||
        // Also filter by entity context (e.g., resident belongs to tenant)
        (log.entityType === "resident" && log.entityId && this.isEntityInTenant(log.entityType, log.entityId, tenantId)) ||
        (log.entityType === "entry" && log.entityId && this.isEntityInTenant(log.entityType, log.entityId, tenantId))
      );
    }
    return logs.sort((a, b) => (b.timestamp ? new Date(b.timestamp).getTime() : 0) - (a.timestamp ? new Date(a.timestamp).getTime() : 0));
  }

  // Helper method to check if an entity belongs to a tenant
  private isEntityInTenant(entityType: string, entityId: string, tenantId: string): boolean {
    switch (entityType) {
      case "resident":
        const resident = this.residents.get(entityId);
        return resident?.tenantId === tenantId;
      case "entry":
        const entry = this.careEntries.get(entityId);
        return entry?.tenantId === tenantId;
      default:
        return false;
    }
  }

  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...insertLog,
      id,
      entityType: insertLog.entityType || null,
      entityId: insertLog.entityId || null,
      metadata: insertLog.metadata || null,
      ipAddress: insertLog.ipAddress || null,
      timestamp: new Date(),
    };
    this.auditLogs.set(id, log);
    return log;
  }

  // Settings
  async getSetting(key: string): Promise<Settings | undefined> {
    return this.settings.get(key);
  }

  async setSetting(key: string, value: string, type: string = "string", description?: string): Promise<Settings> {
    const existing = this.settings.get(key);
    const setting: Settings = {
      id: existing?.id || randomUUID(),
      key,
      value,
      type,
      description: description || existing?.description || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.settings.set(key, setting);
    return setting;
  }

  // Feature Flags
  async getFeatureFlag(tenantId: string | null, flagName: string): Promise<FeatureFlag | undefined> {
    const key = `${tenantId || 'global'}-${flagName}`;
    return this.featureFlags.get(key);
  }

  async setFeatureFlag(tenantId: string | null, flagName: string, isEnabled: boolean, value?: any): Promise<FeatureFlag> {
    const key = `${tenantId || 'global'}-${flagName}`;
    const existing = this.featureFlags.get(key);
    
    const flag: FeatureFlag = {
      id: existing?.id || randomUUID(),
      tenantId,
      flagName,
      isEnabled,
      value: value || null,
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    
    this.featureFlags.set(key, flag);
    return flag;
  }
}

export const storage = new MemStorage();
