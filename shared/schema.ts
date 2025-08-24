import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: text("duration").notNull(),
  skills: jsonb("skills").notNull().$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  studentId: text("student_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  certificateId: text("certificate_id").notNull().unique(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  grade: text("grade").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  qrCode: text("qr_code").notNull(),
  verificationCount: varchar("verification_count").default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  duration: true,
  skills: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  email: true,
  studentId: true,
}).extend({
  autoGenerateId: z.boolean().optional(),
});

export const insertCertificateSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  grade: z.string(),
  issueDate: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

export type Course = typeof courses.$inferSelect;
export type Student = typeof students.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Settings = typeof settings.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
