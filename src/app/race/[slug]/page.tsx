import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { getRaceBySlug, getRaceEntries, getStrategyEvents } from "@/lib/db/queries"
import { analyzeRace, prepareAnalysisInput } from "@/lib/analysis"
import { RaceSummary } from "@/components/race/race-summary"
import { StrategyTimeline } from "@/components/race/strategy-timeline"
import { DriverBreakdowns } from "@/components/race/driver-breakdowns"

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
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Back to races
        </Link>
      </nav>

      {/* Race header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
            {race.season}
          </span>
          <span className="text-xs text-muted-foreground">
            Round {race.round}
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold">{race.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {race.circuit} · {race.country}
        </p>
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        <RaceSummary race={race} entries={entries} />
        <StrategyTimeline events={events} entries={entries} insights={insights} />
        <DriverBreakdowns 
          entries={entries} 
          events={events} 
          insights={insights}
          totalLaps={totalLaps}
        />
      </div>
    </div>
  )
}
