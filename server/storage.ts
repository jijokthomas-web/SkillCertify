import { type Course, type Student, type Certificate, type Settings, type InsertCourse, type InsertStudent, type InsertCertificate, type InsertSettings } from "../shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: string, course: Partial<InsertCourse>): Promise<Course | undefined>;
  deleteCourse(id: string): Promise<boolean>;

  // Students
  getStudents(): Promise<Student[]>;
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;
  generateStudentId(): Promise<string>;

  // Certificates
  getCertificates(): Promise<Certificate[]>;
  getCertificate(id: string): Promise<Certificate | undefined>;
  getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate & { certificateId: string; qrCode: string }): Promise<Certificate>;
  updateCertificate(id: string, certificate: Partial<Certificate>): Promise<Certificate | undefined>;
  deleteCertificate(id: string): Promise<boolean>;
  incrementVerificationCount(certificateId: string): Promise<void>;

  // Settings
  getSettings(): Promise<Settings[]>;
  getSetting(key: string): Promise<Settings | undefined>;
  createOrUpdateSetting(key: string, value: string): Promise<Settings>;

  // Statistics
  getStats(): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalCertificates: number;
    totalVerifications: number;
  }>;
}

export class MemStorage implements IStorage {
  private courses: Map<string, Course>;
  private students: Map<string, Student>;
  private certificates: Map<string, Certificate>;
  private settings: Map<string, Settings>;

  constructor() {
    this.courses = new Map();
    this.students = new Map();
    this.certificates = new Map();
    this.settings = new Map();
    
    // Initialize default settings
    this.initializeDefaultSettings();
  }

  private async initializeDefaultSettings() {
    await this.createOrUpdateSetting("student_id_pattern", "STU-{YEAR}-{###}");
    await this.createOrUpdateSetting("student_id_auto_generate", "true");
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }

  async getCourse(id: string): Promise<Course | undefined> {
    return this.courses.get(id);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = randomUUID();
    const course: Course = {
      ...insertCourse,
      id,
      createdAt: new Date(),
    };
    this.courses.set(id, course);
    return course;
  }

  async updateCourse(id: string, courseUpdate: Partial<InsertCourse>): Promise<Course | undefined> {
    const existing = this.courses.get(id);
    if (!existing) return undefined;

    const updated: Course = { ...existing, ...courseUpdate };
    this.courses.set(id, updated);
    return updated;
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Students
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    return Array.from(this.students.values()).find(s => s.studentId === studentId);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    let studentId = insertStudent.studentId;
    
    // Auto-generate student ID if requested or if not provided
    if (insertStudent.autoGenerateId || !studentId || !studentId.trim()) {
      studentId = await this.generateStudentId();
    }
    
    const student: Student = {
      ...insertStudent,
      studentId,
      id,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  async updateStudent(id: string, studentUpdate: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;

    const updated: Student = { ...existing, ...studentUpdate };
    this.students.set(id, updated);
    return updated;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  async generateStudentId(): Promise<string> {
    const pattern = await this.getSetting("student_id_pattern");
    const template = pattern?.value || "STU-{YEAR}-{###}";
    
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const existingStudents = Array.from(this.students.values());
    
    // Replace variables in template
    let processedTemplate = template
      .replace(/{YEAR}/g, year.toString())
      .replace(/{MONTH}/g, month);
    
    // Find the pattern for numbers (consecutive # symbols)
    const numberPattern = processedTemplate.match(/(#+)/);
    if (!numberPattern) {
      // No number pattern found, just return the template
      return processedTemplate;
    }
    
    const paddingLength = numberPattern[1].length;
    
    // Create prefix by removing the number pattern
    const prefix = processedTemplate.replace(numberPattern[1], "");
    
    // Find existing numbers with this prefix
    const existingNumbers = existingStudents
      .map(s => s.studentId)
      .filter(id => id.startsWith(prefix))
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
    return Array.from(this.certificates.values());
  }

  async getCertificate(id: string): Promise<Certificate | undefined> {
    return this.certificates.get(id);
  }

  async getCertificateByCertificateId(certificateId: string): Promise<Certificate | undefined> {
    return Array.from(this.certificates.values()).find(c => c.certificateId === certificateId);
  }

  async createCertificate(certificateData: InsertCertificate & { certificateId: string; qrCode: string }): Promise<Certificate> {
    const id = randomUUID();
    const certificate: Certificate = {
      ...certificateData,
      id,
      verificationCount: "0",
      createdAt: new Date(),
    };
    this.certificates.set(id, certificate);
    return certificate;
  }

  async updateCertificate(id: string, certificateUpdate: Partial<Certificate>): Promise<Certificate | undefined> {
    const existing = this.certificates.get(id);
    if (!existing) return undefined;

    const updated: Certificate = { ...existing, ...certificateUpdate };
    this.certificates.set(id, updated);
    return updated;
  }

  async deleteCertificate(id: string): Promise<boolean> {
    return this.certificates.delete(id);
  }

  async incrementVerificationCount(certificateId: string): Promise<void> {
    const certificate = Array.from(this.certificates.values()).find(c => c.certificateId === certificateId);
    if (certificate) {
      const count = parseInt(certificate.verificationCount) + 1;
      certificate.verificationCount = count.toString();
      this.certificates.set(certificate.id, certificate);
    }
  }

  // Settings
  async getSettings(): Promise<Settings[]> {
    return Array.from(this.settings.values());
  }

  async getSetting(key: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(s => s.key === key);
  }

  async createOrUpdateSetting(key: string, value: string): Promise<Settings> {
    const existing = await this.getSetting(key);
    if (existing) {
      const updated: Settings = { 
        ...existing, 
        value, 
        updatedAt: new Date() 
      };
      this.settings.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const setting: Settings = {
        id,
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.settings.set(id, setting);
      return setting;
    }
  }

  async getStats(): Promise<{
    totalCourses: number;
    totalStudents: number;
    totalCertificates: number;
    totalVerifications: number;
  }> {
    const totalVerifications = Array.from(this.certificates.values())
      .reduce((sum, cert) => sum + parseInt(cert.verificationCount), 0);

    return {
      totalCourses: this.courses.size,
      totalStudents: this.students.size,
      totalCertificates: this.certificates.size,
      totalVerifications,
    };
  }
}

export const storage = new MemStorage();
