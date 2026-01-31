import { getMeetings } from "./openf1-client"

const year = parseInt(process.argv[2], 10) || new Date().getFullYear()

async function listRaces() {
  console.log(`\n🏎️  Available races for ${year}:\n`)
  
  const meetings = await getMeetings(year)
  
  // Filter out testing sessions
  const races = meetings.filter(m => !m.meeting_name.toLowerCase().includes("testing"))
  
  console.log("meeting_key | Race Name")
  console.log("------------|------------------------------------------")
  
  for (const race of races) {
    const date = new Date(race.date_start).toLocaleDateString()
    console.log(`${race.meeting_key.toString().padStart(11)} | ${race.meeting_name} (${date})`)
  }
  
  console.log(`\nUsage: pnpm import:race <meeting_key>`)
  console.log(`Example: pnpm import:race ${races[0]?.meeting_key ?? 1229}`)
}

listRaces().catch(console.error)
