import { type IStorage } from "./storage";
import { db } from "./db";
import { and, eq, sql } from "drizzle-orm";
import { certificates, courses, settings, students, type Certificate, type Course, type InsertCertificate, type InsertCourse, type InsertSettings, type InsertStudent, type Settings, type Student } from "../shared/schema";

export class DbStorage implements IStorage {
  // Courses
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return rows[0];
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const rows = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return rows[0];
  }

  async updateCourse(id: string, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const rows = await db
      .update(courses)
      .set(courseUpdate)
      .where(eq(courses.id, id))
      .returning();
    return rows[0];
  }

  async deleteCourse(id: string): Promise<boolean> {
    const rows = await db.delete(courses).where(eq(courses.id, id)).returning({ id: courses.id });
    return rows.length > 0;
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async getStudent(id: string): Promise<Student | undefined> {
    const rows = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return rows[0];
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const rows = await db.select().from(students).where(eq(students.studentId, studentId)).limit(1);
    return rows[0];
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    let studentId = insertStudent.studentId;
    if (insertStudent.autoGenerateId || !studentId || !studentId.trim()) {
      studentId = await this.generateStudentId();
    }

    const rows = await db
      .insert(students)
      .values({
        name: insertStudent.name,
        email: insertStudent.email ?? null,
        studentId,
      })
      .returning();
    return rows[0];
  }

  async updateStudent(id: string, studentUpdate: Partial<InsertStudent>): Promise<Student | undefined> {
    const rows = await db
      .update(students)
      .set({
        name: studentUpdate.name,
        email: studentUpdate.email,
        studentId: studentUpdate.studentId,
      })
      .where(eq(students.id, id))
      .returning();
    return rows[0];
  }

  async deleteStudent(id: string): Promise<boolean> {
    const rows = await db.delete(students).where(eq(students.id, id)).returning({ id: students.id });
    return rows.length > 0;
  }

  async generateStudentId(): Promise<string> {
    const setting = await this.getSetting("student_id_pattern");
    const template = setting?.value || "STU-{YEAR}-{###}";

    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");

    let processedTemplate = template
      .replace(/{YEAR}/g, year.toString())
      .replace(/{MONTH}/g, month);

    const numberPattern = processedTemplate.match(/(#+)/);
    if (!numberPattern) return processedTemplate;

    const paddingLength = numberPattern[1].length;
    const prefix = processedTemplate.replace(numberPattern[1], "");

    const rows = await db
      .select({ studentId: students.studentId })
      .from(students)
      .where(sql`${students.studentId} LIKE ${prefix + "%"}`);

    const existingNumbers = rows
      .map(r => r.studentId)
      .map(id => {
        const match = id.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const paddedNumber = nextNumber.toString().padStart(paddingLength, "0");
    return processedTemplate.replace(numberPattern[1], paddedNumber);
  }

  // Certificates
  async getCertificates(): Promise<Certificate[]> {
    return await db.select().from(certificates);
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    const rows = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
    return rows[0];
  }

  async getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined> {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateId, certificateId))
      .limit(1);
    return rows[0];
  }

  async generateCertificateId(): Promise<string> {
    const setting = await this.getSetting("certificate_id_pattern");
    const template = setting?.value || "CERT-{YEAR}-ABCD-{###}";

    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");

    let processedTemplate = template
      .replace(/\{YEAR\}/g, year.toString())
      .replace(/\{MONTH\}/g, month);

    const parts = processedTemplate.split("-");
    if (parts.length !== 4) {
      while (parts.length < 4) parts.push("{###}");
      if (parts.length > 4) processedTemplate = parts.slice(0, 3).concat(parts.slice(3).join("")).join("-");
      else processedTemplate = parts.join("-");
    }

    const numberPattern = processedTemplate.match(/(#+)/);
    if (!numberPattern) return processedTemplate;

    const paddingLength = numberPattern[1].length;
    const prefix = processedTemplate.replace(numberPattern[1], "");

    const rows = await db
      .select({ certificateId: certificates.certificateId })
      .from(certificates)
      .where(sql`${certificates.certificateId} LIKE ${prefix + "%"}`);

    const existingNumbers = rows
      .map(r => r.certificateId)
      .map(id => {
        const match = id.match(/(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => !isNaN(num));

    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    const paddedNumber = nextNumber.toString().padStart(paddingLength, "0");
    return processedTemplate.replace(numberPattern[1], paddedNumber);
  }

  async createCertificate(certificateData: InsertCertificate & { certificateId: string; qrCode: string }): Promise<Certificate> {
    const rows = await db
      .insert(certificates)
      .values({
        certificateId: certificateData.certificateId,
        studentId: certificateData.studentId,
        courseId: certificateData.courseId,
        grade: certificateData.grade,
        issueDate: certificateData.issueDate,
        qrCode: certificateData.qrCode,
        notes: (certificateData as any).notes,
      })
      .returning();
    return rows[0];
  }

  async updateCertificate(id: string, certificateUpdate: Partial<Certificate>): Promise<Certificate | undefined> {
    const rows = await db
      .update(certificates)
      .set(certificateUpdate)
      .where(eq(certificates.id, id))
      .returning();
    return rows[0];
  }

  async deleteCertificate(id: string): Promise<boolean> {
    const rows = await db.delete(certificates).where(eq(certificates.id, id)).returning({ id: certificates.id });
    return rows.length > 0;
  }

  async incrementVerificationCount(certificateId: string): Promise<void> {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.certificateId, certificateId))
      .limit(1);
    const existing = rows[0];
    if (!existing) return;

    const next = (parseInt(existing.verificationCount) || 0) + 1;
    await db
      .update(certificates)
      .set({ verificationCount: String(next) })
      .where(eq(certificates.id, existing.id));
  }

  // Settings
  async getSettings(): Promise<Settings[]> {
    return await db.select().from(settings);
  }

  async getSetting(key: string): Promise<Settings | undefined> {
    const rows = await db
      .select()
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return rows[0];
  }

  async createOrUpdateSetting(key: string, value: string): Promise<Settings> {
    const existing = await this.getSetting(key);
    if (existing) {
      const rows = await db
        .update(settings)
        .set({ value, updatedAt: new Date() })
        .where(eq(settings.id, existing.id))
        .returning();
      return rows[0];
    } else {
      const rows = await db
        .insert(settings)
        .values({ key, value })
        .returning();
      return rows[0];
    }
  }

  async getStats(): Promise<{ totalCourses: number; totalStudents: number; totalCertificates: number; totalVerifications: number; }> {
    const [{ count: totalCourses }] = await db.select({ count: sql<number>`count(*)` }).from(courses);
    const [{ count: totalStudents }] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [{ count: totalCertificates }] = await db.select({ count: sql<number>`count(*)` }).from(certificates);
    const [{ sum: totalVerifications }] = await db
      .select({ sum: sql<number>`sum((${certificates.verificationCount})::int)` })
      .from(certificates);

    return {
      totalCourses: Number(totalCourses ?? 0),
      totalStudents: Number(totalStudents ?? 0),
      totalCertificates: Number(totalCertificates ?? 0),
      totalVerifications: Number(totalVerifications ?? 0),
    };
  }
}