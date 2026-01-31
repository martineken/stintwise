import { pgTable, serial, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core"
import { races } from "./races"
import { drivers } from "./drivers"

export const raceEntries = pgTable("race_entries", {
  id: serial("id").primaryKey(),
  
  // Foreign keys
  raceId: integer("race_id").notNull().references(() => races.id),
  driverId: integer("driver_id").notNull().references(() => drivers.id),
  
  // Entry details
  team: varchar("team", { length: 255 }).notNull(),
  carNumber: integer("car_number").notNull(),
  
  // Qualifying & grid
  gridPosition: integer("grid_position"),
  
  // Race result
  finishPosition: integer("finish_position"),
  status: varchar("status", { length: 50 }).notNull().default("finished"), // finished, dnf, dsq, dns
  dnfReason: varchar("dnf_reason", { length: 255 }),
  dnfLap: integer("dnf_lap"),
  
  // Pre-computed stats
  totalPitStops: integer("total_pit_stops"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  raceDriverUnique: unique().on(table.raceId, table.driverId),
}))

export type RaceEntry = typeof raceEntries.$inferSelect
export type NewRaceEntry = typeof raceEntries.$inferInsert
