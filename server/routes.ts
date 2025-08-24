import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCourseSchema, insertStudentSchema, insertCertificateSchema, insertSettingsSchema } from "../shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Public API - Certificate verification (no auth required)
  app.get("/api/verify/:certificateId", async (req, res) => {
    try {
      const { certificateId } = req.params;
      
      const certificate = await storage.getCertificateByCertificateId(certificateId);
      if (!certificate) {
        return res.status(404).json({ error: "Certificate not found" });
      }

      const student = await storage.getStudent(certificate.studentId);
      const course = await storage.getCourse(certificate.courseId);

      if (!student || !course) {
        return res.status(404).json({ error: "Associated data not found" });
      }

      // Increment verification count
      await storage.incrementVerificationCount(certificateId);

      res.json({
        certificate,
        student: {
          name: student.name,
          email: student.email,
          studentId: student.studentId,
        },
        course: {
          title: course.title,
          description: course.description,
          duration: course.duration,
          skills: course.skills,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Admin API - Protected routes (would be protected by auth middleware in production)
  
  // Courses
  app.get("/api/admin/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/courses", async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(id, courseData);
      
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/courses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCourse(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Students
  app.get("/api/admin/students", async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/admin/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const studentData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(id, studentData);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/students/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteStudent(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Certificates
  app.get("/api/admin/certificates", async (req, res) => {
    try {
      const certificates = await storage.getCertificates();
      const enrichedCertificates = await Promise.all(
        certificates.map(async (cert) => {
          const student = await storage.getStudent(cert.studentId);
          const course = await storage.getCourse(cert.courseId);
          return {
            ...cert,
            student,
            course,
          };
        })
      );
      res.json(enrichedCertificates);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/certificates", async (req, res) => {
    try {
      const certificateData = insertCertificateSchema.parse(req.body);
      
      // Generate certificate ID via storage pattern
      const certificateId = await storage.generateCertificateId();
      
      // Generate QR code URL
      const forwardedProto = (req.get("x-forwarded-proto") || req.protocol || "https") as string;
      const forwardedHost = (req.get("x-forwarded-host") || req.get("host") || "localhost:5000") as string;
      const runtimeBaseUrl = process.env.VITE_BASE_URL || `${forwardedProto}://${forwardedHost}`;
      const qrCode = `${runtimeBaseUrl}/verify/${certificateId}`;
      
      const certificate = await storage.createCertificate({
        ...certificateData,
        certificateId,
        qrCode,
      });
      
      res.status(201).json(certificate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.delete("/api/admin/certificates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCertificate(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Certificate not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Settings
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.createOrUpdateSetting(key, value);
      res.json(setting);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/generate-student-id", async (req, res) => {
    try {
      const studentId = await storage.generateStudentId();
      res.json({ studentId });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/admin/generate-certificate-id", async (_req, res) => {
    try {
      const certificateId = await storage.generateCertificateId();
      res.json({ certificateId });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
