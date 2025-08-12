import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Pflegeheime (Tenants)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // "Pflegeheim Sonnenschein"
  subdomain: text("subdomain").notNull().unique(), // "sonnenschein"
  isActive: boolean("is_active").default(true),
  customConfig: jsonb("custom_config").default({}), // Spezielle Einstellungen
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'caregiver' | 'lead' | 'super_admin'
  tenantId: varchar("tenant_id"), // null für Super Admin
  createdAt: timestamp("created_at").defaultNow(),
});



export const residents = pgTable("residents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(), // Gehört zu welchem Pflegeheim
  name: text("name").notNull(),
  room: text("room").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const careEntries = pgTable("care_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull(), // Gehört zu welchem Pflegeheim
  residentId: varchar("resident_id").notNull(),
  authorId: varchar("author_id").notNull(),
  status: text("status").notNull().default("draft"), // 'draft' | 'pending' | 'final' | 'rejected'
  content: jsonb("content").notNull(), // Structured care report data
  audioFilePath: text("audio_file_path"), // Path to recorded audio file
  transcriptRaw: text("transcript_raw"), // Original transcription from Whisper
  transcriptDe: text("transcript_de"), // German translation from DeepL or GPT
  draftJson: jsonb("draft_json"), // AI-generated structured data
  pdfPath: text("pdf_path"), // Path to generated PDF
  comments: text("comments"),
  approvedBy: varchar("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"), // Grund der Ablehnung
  rejectedBy: varchar("rejected_by"), // Wer hat abgelehnt
  rejectedAt: timestamp("rejected_at"), // Wann abgelehnt
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type"), // 'resident' | 'entry' | 'user'
  entityId: varchar("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Settings schema for glossary
export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  type: text("type").notNull().default("string"), // "string", "json", "boolean"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feature Flags für kundenspezifische Features
export const featureFlags = pgTable("feature_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id"), // null = global
  flagName: text("flag_name").notNull(), // "advanced_ai", "custom_reports"
  isEnabled: boolean("is_enabled").default(false),
  value: jsonb("value"), // Für komplexe Konfigurationen
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertResidentSchema = createInsertSchema(residents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCareEntrySchema = createInsertSchema(careEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Learning Data - KI lernt aus Spracheingaben
export const learningPatterns = pgTable("learning_patterns", {
  id: text("id").primaryKey(),
  originalText: text("original_text").notNull(),
  correctedText: text("corrected_text").notNull(),
  context: text("context").notNull(), // 'medical' | 'nursing' | 'medication' | 'vital_signs' | 'general'
  frequency: integer("frequency").default(1).notNull(),
  confidence: real("confidence").default(0.6).notNull(),
  lastUsed: timestamp("last_used").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vocabularyTerms = pgTable("vocabulary_terms", {
  id: text("id").primaryKey(),
  term: text("term").notNull(),
  alternatives: text("alternatives").array(),
  category: text("category").notNull(),
  usageCount: integer("usage_count").default(1).notNull(),
  confidenceScore: real("confidence_score").default(0.3).notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const learningStats = pgTable("learning_stats", {
  id: text("id").primaryKey().default("global"),
  totalTranscriptions: integer("total_transcriptions").default(0).notNull(),
  totalCorrections: integer("total_corrections").default(0).notNull(),
  accuracyImprovement: real("accuracy_improvement").default(0.0).notNull(),
  lastLearningEvent: timestamp("last_learning_event").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLearningPatternSchema = createInsertSchema(learningPatterns).omit({
  id: true,
  createdAt: true,
});

export const insertVocabularyTermSchema = createInsertSchema(vocabularyTerms).omit({
  id: true,
  createdAt: true,
});

export const insertLearningStatsSchema = createInsertSchema(learningStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resident = typeof residents.$inferSelect;
export type InsertResident = z.infer<typeof insertResidentSchema>;

export type CareEntry = typeof careEntries.$inferSelect;
export type InsertCareEntry = z.infer<typeof insertCareEntrySchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

export type LearningPattern = typeof learningPatterns.$inferSelect;
export type InsertLearningPattern = z.infer<typeof insertLearningPatternSchema>;

export type VocabularyTerm = typeof vocabularyTerms.$inferSelect;
export type InsertVocabularyTerm = z.infer<typeof insertVocabularyTermSchema>;

export type LearningStats = typeof learningStats.$inferSelect;
export type InsertLearningStats = z.infer<typeof insertLearningStatsSchema>;

// Care entry content structure
export const careEntryContentSchema = z.object({
  summary: z.string().optional(), // Full speech summary
  vitalSigns: z.object({
    bloodPressure: z.string().optional(),
    pulse: z.string().optional(),
    temperature: z.string().optional(),
    weight: z.string().optional(),
  }).optional(),
  medication: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    time: z.string(),
    administered: z.boolean(),
  })).optional(),
  medicationNotes: z.string().optional(),
  mobility: z.string().optional(),
  nutrition: z.string().optional(),
  hygiene: z.string().optional(),
  mood: z.string().optional(),
  specialNotes: z.string().optional(),
  recommendations: z.string().optional(),
});

// Austrian care report schema for AI processing (SIS/ATL-compliant)
export const austrianCareReportSchema = z.object({
  vitalwerte: z.string().min(1, "Vitalwerte sind erforderlich"),
  medikation: z.array(z.object({
    name: z.string(),
    dosis: z.string(),
    uhrzeit: z.string().regex(/^\d{2}:\d{2}$/, "Uhrzeit muss Format HH:MM haben"),
  })),
  mobilität: z.string().min(1, "Mobilität ist erforderlich"),
  ernährung_flüssigkeit: z.string().min(1, "Ernährung/Flüssigkeit ist erforderlich"),
  hygiene: z.string().min(1, "Hygiene ist erforderlich"),
  stimmung_kognition: z.string().min(1, "Stimmung/Kognition ist erforderlich"),
  besonderheiten: z.string().min(1, "Besonderheiten sind erforderlich"),
  empfehlungen: z.string().min(1, "Empfehlungen sind erforderlich"),
});

export type AustrianCareReport = z.infer<typeof austrianCareReportSchema>;

export type CareEntryContent = z.infer<typeof careEntryContentSchema>;
