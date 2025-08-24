import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../shared/schema";

neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to use database storage");
}

export const sqlClient = neon(process.env.DATABASE_URL);
export const db = drizzle(sqlClient, { schema });

export async function ensureSchema(): Promise<void> {
  await sqlClient`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  // courses
  await sqlClient`CREATE TABLE IF NOT EXISTS courses (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL,
    duration text NOT NULL,
    skills jsonb NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // students
  await sqlClient`CREATE TABLE IF NOT EXISTS students (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    student_id text NOT NULL UNIQUE,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // certificates
  await sqlClient`CREATE TABLE IF NOT EXISTS certificates (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id text NOT NULL UNIQUE,
    student_id varchar NOT NULL,
    course_id varchar NOT NULL,
    grade text NOT NULL,
    issue_date timestamp NOT NULL,
    qr_code text NOT NULL,
    verification_count varchar NOT NULL DEFAULT '0',
    notes text,
    created_at timestamp NOT NULL DEFAULT now()
  )`;

  // settings
  await sqlClient`CREATE TABLE IF NOT EXISTS settings (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    updated_at timestamp NOT NULL DEFAULT now()
  )`;
}