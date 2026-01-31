import { pgTable, serial, varchar, date, integer, timestamp, unique } from "drizzle-orm/pg-core"

export const races = pgTable("races", {
  id: serial("id").primaryKey(),
  
  // Race identification
  season: integer("season").notNull(),
  round: integer("round").notNull(),
  
  // Race details
  name: varchar("name", { length: 255 }).notNull(),
  officialName: varchar("official_name", { length: 255 }),
  circuit: varchar("circuit", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  
  // Timing
  raceDate: date("race_date").notNull(),
  totalLaps: integer("total_laps"),
  actualLaps: integer("actual_laps"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  seasonRoundUnique: unique().on(table.season, table.round),
}))

export type Race = typeof races.$inferSelect
export type NewRace = typeof races.$inferInsert
