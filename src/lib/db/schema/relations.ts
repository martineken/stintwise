import { relations } from "drizzle-orm"
import { races } from "./races"
import { drivers } from "./drivers"
import { raceEntries } from "./race-entries"
import { stints } from "./stints"
import { strategyEvents } from "./strategy-events"

// Race relations
export const racesRelations = relations(races, ({ many }) => ({
  entries: many(raceEntries),
  strategyEvents: many(strategyEvents),
}))

// Driver relations
export const driversRelations = relations(drivers, ({ many }) => ({
  entries: many(raceEntries),
}))

// Race entry relations
export const raceEntriesRelations = relations(raceEntries, ({ one, many }) => ({
  race: one(races, {
    fields: [raceEntries.raceId],
    references: [races.id],
  }),
  driver: one(drivers, {
    fields: [raceEntries.driverId],
    references: [drivers.id],
  }),
  stints: many(stints),
  strategyEvents: many(strategyEvents),
}))

// Stint relations
export const stintsRelations = relations(stints, ({ one }) => ({
  raceEntry: one(raceEntries, {
    fields: [stints.raceEntryId],
    references: [raceEntries.id],
  }),
}))

// Strategy event relations
export const strategyEventsRelations = relations(strategyEvents, ({ one }) => ({
  race: one(races, {
    fields: [strategyEvents.raceId],
    references: [races.id],
  }),
  raceEntry: one(raceEntries, {
    fields: [strategyEvents.raceEntryId],
    references: [raceEntries.id],
  }),
}))
