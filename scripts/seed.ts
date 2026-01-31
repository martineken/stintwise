import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { races, drivers, raceEntries, stints, strategyEvents } from "../src/lib/db/schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  console.log("🌱 Seeding database...")

  // Clear existing data (in reverse order of dependencies)
  console.log("Clearing existing data...")
  await db.delete(strategyEvents)
  await db.delete(stints)
  await db.delete(raceEntries)
  await db.delete(races)
  await db.delete(drivers)

  // Insert drivers (2024 grid, top 10 finishers + a few others)
  console.log("Inserting drivers...")
  const insertedDrivers = await db.insert(drivers).values([
    { code: "VER", number: 1, firstName: "Max", lastName: "Verstappen", nationality: "Dutch", team: "Red Bull Racing" },
    { code: "PER", number: 11, firstName: "Sergio", lastName: "Perez", nationality: "Mexican", team: "Red Bull Racing" },
    { code: "SAI", number: 55, firstName: "Carlos", lastName: "Sainz", nationality: "Spanish", team: "Ferrari" },
    { code: "LEC", number: 16, firstName: "Charles", lastName: "Leclerc", nationality: "Monegasque", team: "Ferrari" },
    { code: "RUS", number: 63, firstName: "George", lastName: "Russell", nationality: "British", team: "Mercedes" },
    { code: "NOR", number: 4, firstName: "Lando", lastName: "Norris", nationality: "British", team: "McLaren" },
    { code: "HAM", number: 44, firstName: "Lewis", lastName: "Hamilton", nationality: "British", team: "Mercedes" },
    { code: "PIA", number: 81, firstName: "Oscar", lastName: "Piastri", nationality: "Australian", team: "McLaren" },
    { code: "ALO", number: 14, firstName: "Fernando", lastName: "Alonso", nationality: "Spanish", team: "Aston Martin" },
    { code: "STR", number: 18, firstName: "Lance", lastName: "Stroll", nationality: "Canadian", team: "Aston Martin" },
    { code: "OCO", number: 31, firstName: "Esteban", lastName: "Ocon", nationality: "French", team: "Alpine" },
    { code: "GAS", number: 10, firstName: "Pierre", lastName: "Gasly", nationality: "French", team: "Alpine" },
  ]).returning()

  const driverMap = Object.fromEntries(insertedDrivers.map(d => [d.code, d.id]))

  // Insert 2024 Bahrain GP
  console.log("Inserting race...")
  const [race] = await db.insert(races).values({
    season: 2024,
    round: 1,
    name: "Bahrain Grand Prix",
    officialName: "Formula 1 Gulf Air Bahrain Grand Prix 2024",
    circuit: "Bahrain International Circuit",
    country: "Bahrain",
    raceDate: "2024-03-02",
    totalLaps: 57,
    actualLaps: 57,
  }).returning()

  // Insert race entries (grid position, finish position, status)
  console.log("Inserting race entries...")
  const entryData = [
    { code: "VER", team: "Red Bull Racing", carNumber: 1, grid: 1, finish: 1, status: "finished" },
    { code: "PER", team: "Red Bull Racing", carNumber: 11, grid: 5, finish: 2, status: "finished" },
    { code: "SAI", team: "Ferrari", carNumber: 55, grid: 4, finish: 3, status: "finished" },
    { code: "LEC", team: "Ferrari", carNumber: 16, grid: 2, finish: 4, status: "finished" },
    { code: "RUS", team: "Mercedes", carNumber: 63, grid: 6, finish: 5, status: "finished" },
    { code: "NOR", team: "McLaren", carNumber: 4, grid: 7, finish: 6, status: "finished" },
    { code: "HAM", team: "Mercedes", carNumber: 44, grid: 9, finish: 7, status: "finished" },
    { code: "PIA", team: "McLaren", carNumber: 81, grid: 8, finish: 8, status: "finished" },
    { code: "ALO", team: "Aston Martin", carNumber: 14, grid: 3, finish: 9, status: "finished" },
    { code: "STR", team: "Aston Martin", carNumber: 18, grid: 10, finish: 10, status: "finished" },
  ]

  const insertedEntries = await db.insert(raceEntries).values(
    entryData.map(e => ({
      raceId: race.id,
      driverId: driverMap[e.code],
      team: e.team,
      carNumber: e.carNumber,
      gridPosition: e.grid,
      finishPosition: e.finish,
      status: e.status,
      totalPitStops: 2,
    }))
  ).returning()

  const entryMap = Object.fromEntries(
    insertedEntries.map((entry, i) => [entryData[i].code, entry.id])
  )

  // Insert stints (simplified but realistic data)
  console.log("Inserting stints...")
  const stintData = [
    // Verstappen: Soft -> Hard -> Medium (controlled race)
    { code: "VER", stintNumber: 1, compound: "soft", startLap: 1, endLap: 14, avgLapTime: "93.456", fastestLap: "92.876", degradation: "0.045" },
    { code: "VER", stintNumber: 2, compound: "hard", startLap: 15, endLap: 40, avgLapTime: "94.123", fastestLap: "93.234", degradation: "0.032" },
    { code: "VER", stintNumber: 3, compound: "medium", startLap: 41, endLap: 57, avgLapTime: "93.789", fastestLap: "93.012", degradation: "0.051" },
    
    // Perez: Medium -> Hard -> Soft (aggressive strategy, gained positions)
    { code: "PER", stintNumber: 1, compound: "medium", startLap: 1, endLap: 16, avgLapTime: "94.012", fastestLap: "93.456", degradation: "0.048" },
    { code: "PER", stintNumber: 2, compound: "hard", startLap: 17, endLap: 42, avgLapTime: "94.345", fastestLap: "93.678", degradation: "0.035" },
    { code: "PER", stintNumber: 3, compound: "soft", startLap: 43, endLap: 57, avgLapTime: "93.234", fastestLap: "92.567", degradation: "0.089" },
    
    // Sainz: Soft -> Hard -> Medium (solid podium)
    { code: "SAI", stintNumber: 1, compound: "soft", startLap: 1, endLap: 13, avgLapTime: "93.678", fastestLap: "93.012", degradation: "0.052" },
    { code: "SAI", stintNumber: 2, compound: "hard", startLap: 14, endLap: 39, avgLapTime: "94.456", fastestLap: "93.789", degradation: "0.038" },
    { code: "SAI", stintNumber: 3, compound: "medium", startLap: 40, endLap: 57, avgLapTime: "94.012", fastestLap: "93.345", degradation: "0.055" },
    
    // Leclerc: Soft -> Hard -> Medium (lost position to Sainz)
    { code: "LEC", stintNumber: 1, compound: "soft", startLap: 1, endLap: 15, avgLapTime: "93.567", fastestLap: "92.987", degradation: "0.058" },
    { code: "LEC", stintNumber: 2, compound: "hard", startLap: 16, endLap: 41, avgLapTime: "94.678", fastestLap: "93.890", degradation: "0.042" },
    { code: "LEC", stintNumber: 3, compound: "medium", startLap: 42, endLap: 57, avgLapTime: "94.234", fastestLap: "93.567", degradation: "0.061" },
    
    // Alonso: Started P3, dropped to P9 (high degradation)
    { code: "ALO", stintNumber: 1, compound: "soft", startLap: 1, endLap: 12, avgLapTime: "94.123", fastestLap: "93.234", degradation: "0.095" },
    { code: "ALO", stintNumber: 2, compound: "hard", startLap: 13, endLap: 38, avgLapTime: "95.012", fastestLap: "94.123", degradation: "0.068" },
    { code: "ALO", stintNumber: 3, compound: "medium", startLap: 39, endLap: 57, avgLapTime: "94.789", fastestLap: "94.012", degradation: "0.072" },
  ]

  await db.insert(stints).values(
    stintData.map(s => ({
      raceEntryId: entryMap[s.code],
      stintNumber: s.stintNumber,
      compound: s.compound,
      startLap: s.startLap,
      endLap: s.endLap,
      lapCount: s.endLap - s.startLap + 1,
      avgLapTime: s.avgLapTime,
      fastestLap: s.fastestLap,
      degradation: s.degradation,
    }))
  )

  // Insert strategy events
  console.log("Inserting strategy events...")
  await db.insert(strategyEvents).values([
    // Pit stops
    {
      raceId: race.id,
      raceEntryId: entryMap["VER"],
      lap: 14,
      eventType: "pit_stop",
      description: "Verstappen pits from the lead, switches to hard tires",
      pitStopDuration: "2.4",
      positionBefore: 1,
      positionAfter: 1,
      positionsGained: 0,
    },
    {
      raceId: race.id,
      raceEntryId: entryMap["SAI"],
      lap: 13,
      eventType: "pit_stop",
      description: "Sainz pits early, undercuts Leclerc",
      pitStopDuration: "2.5",
      positionBefore: 4,
      positionAfter: 3,
      positionsGained: 1,
    },
    {
      raceId: race.id,
      raceEntryId: entryMap["SAI"],
      lap: 13,
      eventType: "undercut",
      description: "Sainz successfully undercuts Leclerc — pitted lap 13 vs lap 15, emerged ahead with fresher tires",
      positionBefore: 4,
      positionAfter: 3,
      positionsGained: 1,
      metadata: { targetDriver: "LEC", lapDelta: 2 },
    },
    {
      raceId: race.id,
      raceEntryId: entryMap["PER"],
      lap: 16,
      eventType: "pit_stop",
      description: "Perez extends first stint, pits for hard tires",
      pitStopDuration: "2.3",
      positionBefore: 4,
      positionAfter: 4,
      positionsGained: 0,
    },
    {
      raceId: race.id,
      raceEntryId: entryMap["ALO"],
      lap: 12,
      eventType: "pit_stop",
      description: "Alonso forced to pit early due to high tire degradation",
      pitStopDuration: "2.6",
      positionBefore: 3,
      positionAfter: 6,
      positionsGained: -3,
    },
    {
      raceId: race.id,
      raceEntryId: entryMap["ALO"],
      lap: 25,
      eventType: "degradation_loss",
      description: "Alonso loses positions due to tire degradation — 0.095s/lap on softs forced early stop, never recovered track position",
      positionBefore: 3,
      positionAfter: 9,
      positionsGained: -6,
      metadata: { degradationRate: 0.095, compound: "soft" },
    },
  ])

  console.log("✅ Seed complete!")
  console.log(`   - 1 race: ${race.name}`)
  console.log(`   - ${insertedDrivers.length} drivers`)
  console.log(`   - ${insertedEntries.length} race entries`)
  console.log(`   - ${stintData.length} stints`)
  console.log(`   - 6 strategy events`)
}

seed().catch(console.error)
