import "dotenv/config"
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { eq, and } from "drizzle-orm"
import { races, drivers, raceEntries, stints, strategyEvents } from "../src/lib/db/schema"
import {
  getMeeting,
  getRaceSession,
  getDrivers,
  getStints,
  getPitStops,
  getSessionResults,
  getStartingGrid,
  getRaceControl,
  type OpenF1Driver,
} from "./openf1-client"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// Get meeting_key from command line
const meetingKey = parseInt(process.argv[2], 10)

if (!meetingKey || isNaN(meetingKey)) {
  console.error("Usage: pnpm import:race <meeting_key>")
  console.error("Example: pnpm import:race 1229  # 2024 Bahrain GP")
  console.error("\nFind meeting keys at: https://api.openf1.org/v1/meetings?year=2024")
  process.exit(1)
}

async function importRace(meetingKey: number) {
  console.log(`\n🏎️  Importing race with meeting_key: ${meetingKey}\n`)

  // 1. Fetch meeting info
  console.log("Fetching meeting info...")
  const meeting = await getMeeting(meetingKey)
  if (!meeting) {
    throw new Error(`Meeting ${meetingKey} not found`)
  }
  console.log(`  Found: ${meeting.meeting_name} (${meeting.year})`)

  // Skip pre-season testing
  if (meeting.meeting_name.toLowerCase().includes("testing")) {
    throw new Error("Cannot import testing sessions, only race weekends")
  }

  // 2. Get race session
  console.log("Fetching race session...")
  const raceSession = await getRaceSession(meetingKey)
  if (!raceSession) {
    throw new Error(`No race session found for meeting ${meetingKey}`)
  }
  console.log(`  Session key: ${raceSession.session_key}`)

  // 3. Check if race already exists
  const existingByName = await db.select().from(races).where(
    and(
      eq(races.name, meeting.meeting_name),
      eq(races.season, meeting.year)
    )
  )
  
  if (existingByName.length > 0) {
    console.log(`\n⚠️  Race "${meeting.meeting_name}" already exists. Skipping.`)
    console.log("   To re-import, delete the existing race first.")
    return
  }

  // 4. Fetch all data sequentially to avoid rate limits
  console.log("Fetching race data...")
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  const openF1Drivers = await getDrivers(raceSession.session_key)
  await delay(200)
  const openF1Stints = await getStints(raceSession.session_key)
  await delay(200)
  const openF1PitStops = await getPitStops(raceSession.session_key)
  await delay(200)
  const openF1Results = await getSessionResults(raceSession.session_key)
  await delay(200)
  const openF1Grid = await getStartingGrid(raceSession.session_key).catch(() => [])
  await delay(200)
  const openF1RaceControl = await getRaceControl(raceSession.session_key)

  console.log(`  Drivers: ${openF1Drivers.length}`)
  console.log(`  Stints: ${openF1Stints.length}`)
  console.log(`  Pit stops: ${openF1PitStops.length}`)
  console.log(`  Results: ${openF1Results.length}`)
  console.log(`  Grid positions: ${openF1Grid.length}`)

  // 5. Insert/update drivers
  console.log("\nProcessing drivers...")
  const driverMap = new Map<number, number>() // openF1 driver_number -> our driver id
  
  for (const d of openF1Drivers) {
    // Check if driver exists by code
    const existing = await db.select().from(drivers).where(eq(drivers.code, d.name_acronym))

    if (existing.length > 0) {
      driverMap.set(d.driver_number, existing[0].id)
      // Update team if changed
      if (existing[0].team !== d.team_name) {
        await db.update(drivers)
          .set({ team: d.team_name })
          .where(eq(drivers.id, existing[0].id))
      }
    } else {
      const [inserted] = await db.insert(drivers).values({
        code: d.name_acronym,
        number: d.driver_number,
        firstName: d.first_name,
        lastName: d.last_name,
        team: d.team_name,
      }).returning()
      driverMap.set(d.driver_number, inserted.id)
      console.log(`  Added driver: ${d.first_name} ${d.last_name} (${d.name_acronym})`)
    }
  }

  // 6. Insert race
  console.log("\nInserting race...")
  const raceDate = new Date(raceSession.date_start).toISOString().split("T")[0]
  const totalLaps = Math.max(...openF1Results.map(r => r.number_of_laps))
  
  // Calculate round number: count existing races in this season + 1
  const existingRacesInSeason = await db.select().from(races).where(eq(races.season, meeting.year))
  const roundNumber = existingRacesInSeason.length + 1
  
  const [insertedRace] = await db.insert(races).values({
    season: meeting.year,
    round: roundNumber,
    name: meeting.meeting_name,
    officialName: meeting.meeting_official_name,
    circuit: meeting.circuit_short_name,
    country: meeting.country_name,
    raceDate: raceDate,
    totalLaps: totalLaps,
    actualLaps: totalLaps,
  }).returning()

  console.log(`  Created race: ${insertedRace.name} (ID: ${insertedRace.id})`)

  // 7. Insert race entries
  console.log("\nInserting race entries...")
  const entryMap = new Map<number, number>() // driver_number -> race_entry id
  const gridMap = new Map(openF1Grid.map(g => [g.driver_number, g.position]))

  for (const result of openF1Results) {
    const driverId = driverMap.get(result.driver_number)
    if (!driverId) {
      console.log(`  Skipping unknown driver: ${result.driver_number}`)
      continue
    }

    const driver = openF1Drivers.find(d => d.driver_number === result.driver_number)
    const pitStopCount = openF1PitStops.filter(p => p.driver_number === result.driver_number).length

    const status = result.dnf ? "dnf" : result.dns ? "dns" : result.dsq ? "dsq" : "finished"

    const [entry] = await db.insert(raceEntries).values({
      raceId: insertedRace.id,
      driverId: driverId,
      team: driver?.team_name ?? "Unknown",
      carNumber: result.driver_number,
      gridPosition: gridMap.get(result.driver_number) ?? null,
      finishPosition: result.position,
      status: status,
      totalPitStops: pitStopCount,
    }).returning()

    entryMap.set(result.driver_number, entry.id)
  }
  console.log(`  Created ${entryMap.size} race entries`)

  // 8. Insert stints
  console.log("\nInserting stints...")
  let stintCount = 0

  for (const stint of openF1Stints) {
    const entryId = entryMap.get(stint.driver_number)
    if (!entryId) continue
    
    // Skip stints with missing lap data
    if (stint.lap_start == null || stint.lap_end == null) {
      console.log(`  Skipping stint with missing lap data for driver ${stint.driver_number}`)
      continue
    }

    const lapCount = stint.lap_end - stint.lap_start + 1

    await db.insert(stints).values({
      raceEntryId: entryId,
      stintNumber: stint.stint_number,
      compound: stint.compound.toLowerCase(),
      startLap: stint.lap_start,
      endLap: stint.lap_end,
      lapCount: lapCount,
      // Degradation computed later if needed
    })
    stintCount++
  }
  console.log(`  Created ${stintCount} stints`)

  // 9. Insert strategy events (pit stops)
  console.log("\nInserting pit stops...")
  let pitEventCount = 0

  for (const pit of openF1PitStops) {
    const entryId = entryMap.get(pit.driver_number)
    if (!entryId) continue

    const driver = openF1Drivers.find(d => d.driver_number === pit.driver_number)

    await db.insert(strategyEvents).values({
      raceId: insertedRace.id,
      raceEntryId: entryId,
      lap: pit.lap_number,
      eventType: "pit_stop",
      description: `${driver?.first_name} ${driver?.last_name} pits`,
      pitStopDuration: pit.stop_duration?.toString() ?? pit.lane_duration.toString(),
    })
    pitEventCount++
  }
  console.log(`  Created ${pitEventCount} pit stop events`)

  // 10. Insert safety car events
  console.log("\nProcessing race control events...")
  let scCount = 0

  const safetyCarEvents = openF1RaceControl.filter(
    rc => rc.category === "SafetyCar" || 
          (rc.message && (
            rc.message.includes("SAFETY CAR") || 
            rc.message.includes("VSC")
          ))
  )

  for (const sc of safetyCarEvents) {
    const eventType = sc.message.includes("VSC") ? "vsc" : "safety_car"
    
    await db.insert(strategyEvents).values({
      raceId: insertedRace.id,
      raceEntryId: null, // Race-wide event
      lap: sc.lap_number,
      eventType: eventType,
      description: sc.message,
    })
    scCount++
  }
  
  if (scCount > 0) {
    console.log(`  Created ${scCount} safety car events`)
  } else {
    console.log(`  No safety car events`)
  }

  // Summary
  console.log("\n✅ Import complete!")
  console.log(`   Race: ${insertedRace.name}`)
  console.log(`   Entries: ${entryMap.size}`)
  console.log(`   Stints: ${stintCount}`)
  console.log(`   Events: ${pitEventCount + scCount}`)
}

importRace(meetingKey).catch((err) => {
  console.error("\n❌ Import failed:", err.message)
  process.exit(1)
})
