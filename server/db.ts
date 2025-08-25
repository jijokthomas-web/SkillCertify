import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

neonConfig.fetchConnectionCache = true;

const DB_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
if (!DB_URL) {
  throw new Error("DATABASE_URL/NETLIFY_DATABASE_URL is required to use database storage");
}

export const sqlClient = neon(DB_URL);
export const db = drizzle(sqlClient, { schema });

export async function ensureSchema(): Promise<void> {
  await sqlClient`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  // courses
  await sqlClient`CREATE TABLE IF NOT EXISTS courses (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    duration text,
    skills jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // students
  await sqlClient`CREATE TABLE IF NOT EXISTS students (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text UNIQUE,
    student_id text NOT NULL UNIQUE,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // certificates
  await sqlClient`CREATE TABLE IF NOT EXISTS certificates (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id text NOT NULL UNIQUE,
    student_id varchar NOT NULL,
    course_id varchar NOT NULL,
    grade text,
    issue_date timestamp,
    qr_code text NOT NULL,
    verification_count varchar NOT NULL DEFAULT '0',
    notes text,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // Migrations to relax NOT NULL constraints if tables already exist
  try { await sqlClient`ALTER TABLE students ALTER COLUMN email DROP NOT NULL`; } catch {}
  try { await sqlClient`ALTER TABLE courses ALTER COLUMN description DROP NOT NULL`; } catch {}
  try { await sqlClient`ALTER TABLE courses ALTER COLUMN duration DROP NOT NULL`; } catch {}
  try { await sqlClient`ALTER TABLE courses ALTER COLUMN skills DROP NOT NULL`; } catch {}
  try { await sqlClient`ALTER TABLE certificates ALTER COLUMN grade DROP NOT NULL`; } catch {}
  try { await sqlClient`ALTER TABLE certificates ALTER COLUMN issue_date DROP NOT NULL`; } catch {}

  // settings
  await sqlClient`CREATE TABLE IF NOT EXISTS settings (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`;
}