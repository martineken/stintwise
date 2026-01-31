import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import type { StrategyEvent, RaceEntry, Driver, Stint } from "@/lib/db/schema"

type RaceEntryWithDriver = RaceEntry & {
  driver: Driver
  stints: Stint[]
}

interface DriverBreakdownsProps {
  entries: RaceEntryWithDriver[]
  events: StrategyEvent[]
}

export function DriverBreakdowns({ entries, events }: DriverBreakdownsProps) {
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

  const getCompoundColor = (compound: string) => {
    switch (compound.toLowerCase()) {
      case "soft":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-gray-200"
      case "intermediate":
        return "bg-green-500"
      case "wet":
        return "bg-blue-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Driver Strategies</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((entry) => {
          const driverEvents = events.filter((e) => e.raceEntryId === entry.id)
          const positionDelta = formatPositionDelta(entry.gridPosition, entry.finishPosition)

          return (
            <Card key={entry.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>
                    {entry.driver.firstName} {entry.driver.lastName}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    P{entry.gridPosition} → P{entry.finishPosition}
                    {positionDelta && (
                      <span
                        className={`ml-2 ${
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
              <CardContent>
                {/* Stints */}
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">STINTS</h4>
                  <div className="space-y-1">
                    {entry.stints.map((stint) => (
                      <div key={stint.id} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-3 h-3 rounded-full ${getCompoundColor(stint.compound)}`}
                          title={stint.compound}
                        />
                        <span className="capitalize w-16">{stint.compound}</span>
                        <span className="text-muted-foreground">
                          L{stint.startLap}-{stint.endLap}
                        </span>
                        <span className="text-muted-foreground">
                          ({stint.lapCount} laps)
                        </span>
                        {stint.degradation && (
                          <span className="text-xs text-muted-foreground">
                            {stint.degradation}s/lap
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key events for this driver */}
                {driverEvents.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-2">KEY MOMENTS</h4>
                    <div className="space-y-1">
                      {driverEvents
                        .filter((e) => e.eventType !== "pit_stop" || (e.positionsGained ?? 0) !== 0)
                        .slice(0, 3)
                        .map((event) => (
                          <p key={event.id} className="text-sm text-muted-foreground">
                            Lap {event.lap}: {event.description?.split(" — ")[0]}
                          </p>
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
