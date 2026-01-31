import { StintVisualization } from "./stint-visualization"
import type { StrategyEvent, RaceEntry, Driver, Stint } from "@/lib/db/schema"
import type { Insight } from "@/lib/analysis"

type RaceEntryWithDriver = RaceEntry & {
  driver: Driver
  stints: Stint[]
}

interface DriverBreakdownsProps {
  entries: RaceEntryWithDriver[]
  events: StrategyEvent[]
  insights?: Insight[]
  totalLaps: number
}

export function DriverBreakdowns({ entries, events, insights = [], totalLaps }: DriverBreakdownsProps) {
  // Sort by finish position, DNFs at end
  const sorted = [...entries].sort((a, b) => {
    if (a.finishPosition && b.finishPosition) {
      return a.finishPosition - b.finishPosition
    }
    return a.finishPosition ? -1 : 1
  })

  const formatPositionDelta = (grid: number | null, finish: number | null) => {
    if (!grid || !finish) return null
    const delta = grid - finish
    if (delta === 0) return null
    if (delta > 0) return `+${delta}`
    return `${delta}`
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Driver Strategies</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((entry) => {
          const driverEvents = events.filter((e) => e.raceEntryId === entry.id)
          const driverInsights = insights.filter((i) => i.driverNumber === entry.carNumber)
          const positionDelta = formatPositionDelta(entry.gridPosition, entry.finishPosition)
          const isDNF = entry.status === "dnf"

          return (
            <div 
              key={entry.id} 
              className={`rounded-lg border bg-card overflow-hidden ${
                isDNF ? "border-border/50 opacity-75" : "border-border"
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {entry.driver.firstName} {entry.driver.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{entry.team}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">P{entry.gridPosition ?? "?"}</span>
                      <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className={`text-sm font-semibold ${isDNF ? "text-red-400" : ""}`}>
                        {isDNF ? "DNF" : `P${entry.finishPosition ?? "?"}`}
                      </span>
                    </div>
                    {positionDelta && !isDNF && (
                      <span
                        className={`text-xs font-medium ${
                          positionDelta.startsWith("+") ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {positionDelta} positions
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Stint visualization */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Tire Strategy
                  </h4>
                  <StintVisualization stints={entry.stints} totalLaps={totalLaps} />
                </div>

                {/* Analysis insights for this driver */}
                {driverInsights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Analysis
                    </h4>
                    <div className="space-y-1.5">
                      {driverInsights.slice(0, 2).map((insight, idx) => (
                        <p key={idx} className="text-sm text-foreground/80">
                          {insight.description}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pit stops */}
                {driverEvents.filter(e => e.eventType === "pit_stop").length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Pit Stops
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {driverEvents
                        .filter((e) => e.eventType === "pit_stop")
                        .map((event, idx) => (
                          <span
                            key={event.id ?? idx}
                            className="text-xs font-mono bg-secondary px-2 py-1 rounded"
                          >
                            L{event.lap}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
