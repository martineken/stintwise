import { pgTable, serial, varchar, integer, timestamp } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  
  // Driver identification
  code: varchar("code", { length: 3 }).notNull().unique(),  // e.g., "VER", "HAM"
  number: integer("number"),                                 // e.g., 1, 44
  
  // Personal info
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  nationality: varchar("nationality", { length: 100 }),
  
  // Current team (denormalized for convenience, actual team per race is in race_entries)
  team: varchar("team", { length: 255 }),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Driver = typeof drivers.$inferSelect
export type NewDriver = typeof drivers.$inferInsert
