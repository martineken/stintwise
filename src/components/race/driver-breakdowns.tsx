import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
    <div>
      <h2 className="text-xl font-semibold mb-4">Driver Strategies</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((entry) => {
          const driverEvents = events.filter((e) => e.raceEntryId === entry.id)
          const driverInsights = insights.filter((i) => i.driverNumber === entry.carNumber)
          const positionDelta = formatPositionDelta(entry.gridPosition, entry.finishPosition)

          return (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {entry.driver.firstName} {entry.driver.lastName}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    P{entry.gridPosition ?? "?"} → P{entry.finishPosition ?? "?"}
                    {positionDelta && (
                      <span
                        className={`ml-2 font-medium ${
                          positionDelta.startsWith("+") ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ({positionDelta})
                      </span>
                    )}
                  </span>
                </CardTitle>
                <CardDescription>{entry.team}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stint visualization */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">TIRE STRATEGY</h4>
                  <StintVisualization stints={entry.stints} totalLaps={totalLaps} />
                </div>

                {/* Analysis insights for this driver */}
                {driverInsights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">ANALYSIS</h4>
                    <div className="space-y-1">
                      {driverInsights.slice(0, 2).map((insight, idx) => (
                        <p key={idx} className="text-sm">
                          <span className={insight.positionsGained > 0 ? "text-green-600" : insight.positionsGained < 0 ? "text-red-600" : ""}>
                            {insight.description}
                          </span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pit stops */}
                {driverEvents.filter(e => e.eventType === "pit_stop").length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">PIT STOPS</h4>
                    <div className="flex gap-2 flex-wrap">
                      {driverEvents
                        .filter((e) => e.eventType === "pit_stop")
                        .map((event, idx) => (
                          <span
                            key={event.id ?? idx}
                            className="text-xs bg-secondary px-2 py-1 rounded"
                          >
                            Lap {event.lap}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
