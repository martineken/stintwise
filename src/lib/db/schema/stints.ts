import { pgTable, serial, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core"
import { raceEntries } from "./race-entries"

export const stints = pgTable("stints", {
  id: serial("id").primaryKey(),
  
  // Foreign key
  raceEntryId: integer("race_entry_id").notNull().references(() => raceEntries.id),
  
  // Stint identification
  stintNumber: integer("stint_number").notNull(), // 1, 2, 3...
  
  // Tire info
  compound: varchar("compound", { length: 50 }).notNull(), // soft, medium, hard, intermediate, wet
  
  // Lap range
  startLap: integer("start_lap").notNull(),
  endLap: integer("end_lap").notNull(),
  lapCount: integer("lap_count").notNull(), // pre-computed: endLap - startLap + 1
  
  // Performance metrics (stored, not computed at render)
  avgLapTime: decimal("avg_lap_time", { precision: 8, scale: 3 }), // seconds, e.g., 91.234
  fastestLap: decimal("fastest_lap", { precision: 8, scale: 3 }),
  degradation: decimal("degradation", { precision: 6, scale: 4 }), // seconds per lap, e.g., 0.0523
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type Stint = typeof stints.$inferSelect
export type NewStint = typeof stints.$inferInsert
