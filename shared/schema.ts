import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  duration: text("duration"),
  skills: jsonb("skills").$type<string[] | null>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").unique(),
  studentId: text("student_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  certificateId: text("certificate_id").notNull().unique(),
  studentId: varchar("student_id").notNull(),
  courseId: varchar("course_id").notNull(),
  grade: text("grade"),
  issueDate: timestamp("issue_date"),
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

export const insertCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  duration: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

export const insertStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional(),
  studentId: z.string().optional(),
  autoGenerateId: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (!data.autoGenerateId && (!data.studentId || data.studentId.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Student ID is required when auto-generation is disabled",
      path: ["studentId"],
    });
  }
});

export const insertCertificateSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  courseId: z.string().min(1, "Course is required"),
  grade: z.string().optional(),
  issueDate: z.string().optional().transform((val) => (val ? new Date(val) : new Date())),
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
