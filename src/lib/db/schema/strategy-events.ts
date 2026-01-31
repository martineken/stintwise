import { pgTable, serial, varchar, integer, decimal, text, timestamp, jsonb } from "drizzle-orm/pg-core"
import { races } from "./races"
import { raceEntries } from "./race-entries"

export const strategyEvents = pgTable("strategy_events", {
  id: serial("id").primaryKey(),
  
  // Foreign keys
  raceId: integer("race_id").notNull().references(() => races.id),
  raceEntryId: integer("race_entry_id").references(() => raceEntries.id), // null for race-wide events (SC, red flag)
  
  // Event timing
  lap: integer("lap").notNull(),
  
  // Event type
  // pit_stop: driver pits
  // safety_car: SC deployed (race-wide)
  // vsc: virtual safety car (race-wide)
  // red_flag: race stopped (race-wide)
  // undercut: driver gained position via earlier stop
  // overcut: driver gained position via later stop
  eventType: varchar("event_type", { length: 50 }).notNull(),
  
  // Human-readable explanation (the "why")
  description: text("description"),
  
  // Pit stop specific
  pitStopDuration: decimal("pit_stop_duration", { precision: 6, scale: 3 }), // stationary time in seconds
  
  // Position changes
  positionBefore: integer("position_before"),
  positionAfter: integer("position_after"),
  positionsGained: integer("positions_gained"), // pre-computed: before - after (positive = gained)
  
  // Flexible metadata for event-specific data
  // e.g., { tireAge: 15, newCompound: "hard", oldCompound: "medium" }
  // e.g., { scDuration: 4, scReason: "debris" }
  metadata: jsonb("metadata"),
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export type StrategyEvent = typeof strategyEvents.$inferSelect
export type NewStrategyEvent = typeof strategyEvents.$inferInsert
