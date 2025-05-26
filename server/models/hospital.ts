import { sql } from 'drizzle-orm';
import { text, varchar, json } from 'drizzle-orm/pg-core';
import { pgTable } from 'drizzle-orm/pg-core';

export const hospitals = pgTable('hospitals', {
  id: varchar('id').primaryKey(),
  name: varchar('name').notNull(),
  code: varchar('code').notNull(),
  level: varchar('level').notNull(),
  ownership: varchar('ownership').notNull(),
  services: json('services').$type<string[]>().notNull().default(sql`'[]'::jsonb`),
  contact: json('contact').$type<{
    phone?: string;
    email?: string;
    address?: string;
  }>().notNull().default(sql`'{}'::jsonb`),
  location: json('location').$type<{
    county: string;
    subCounty: string;
    ward?: string;
  }>().notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export type Hospital = typeof hospitals.$inferSelect;
export type NewHospital = typeof hospitals.$inferInsert; 