import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { getRaceBySlug, getRaceEntries, getStrategyEvents } from "@/lib/db/queries"
import { analyzeRace, prepareAnalysisInput } from "@/lib/analysis"
import { RaceSummary } from "@/components/race/race-summary"
import { StrategyTimeline } from "@/components/race/strategy-timeline"
import { DriverBreakdowns } from "@/components/race/driver-breakdowns"
import { Button } from "@/components/ui/button"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const race = await getRaceBySlug(params.slug)

  if (!race) {
    return { title: "Race Not Found" }
  }

  const title = `${race.season} ${race.name} Strategy Analysis | Stintwise`
  const description = `Tire strategy, pit stops, and key moments from the ${race.season} ${race.name} at ${race.circuit}.`

  return {
    title,
    description,
  }
}

export default async function RacePage({ params }: Props) {
  const race = await getRaceBySlug(params.slug)

  if (!race) {
    notFound()
  }

  const entries = await getRaceEntries(race.id)
  const events = await getStrategyEvents(race.id)
  
  // Run analysis on the race data
  const totalLaps = race.actualLaps ?? race.totalLaps ?? 57
  const pitStopEvents = events
    .filter(e => e.eventType === "pit_stop")
    .map(e => ({
      raceEntryId: e.raceEntryId!,
      lap: e.lap,
      pitStopDuration: e.pitStopDuration,
    }))
  
  const analysisInput = prepareAnalysisInput(
    race.id,
    totalLaps,
    entries.map(e => ({
      id: e.id,
      carNumber: e.carNumber,
      gridPosition: e.gridPosition,
      finishPosition: e.finishPosition,
      driver: e.driver,
      team: e.team,
      stints: e.stints.map(s => ({
        stintNumber: s.stintNumber,
        compound: s.compound,
        startLap: s.startLap,
        endLap: s.endLap,
        lapCount: s.lapCount,
      })),
    })),
    pitStopEvents
  )
  
  const insights = analyzeRace(analysisInput)

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="pl-0">
            ← Back to races
          </Button>
        </Link>
      </div>

      <RaceSummary race={race} entries={entries} />
      
      <div className="mt-8">
        <StrategyTimeline events={events} entries={entries} insights={insights} />
      </div>
      
      <div className="mt-8">
        <DriverBreakdowns 
          entries={entries} 
          events={events} 
          insights={insights}
          totalLaps={totalLaps}
        />
      </div>
    </main>
  )
}
