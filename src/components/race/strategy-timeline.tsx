import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { StrategyEvent, RaceEntry, Driver, Stint } from "@/lib/db/schema"

type RaceEntryWithDriver = RaceEntry & {
  driver: Driver
  stints: Stint[]
}

interface StrategyTimelineProps {
  events: StrategyEvent[]
  entries: RaceEntryWithDriver[]
}

export function StrategyTimeline({ events, entries }: StrategyTimelineProps) {
  // Filter to significant events
  const significantEvents = events.filter(
    (e) =>
      e.eventType === "safety_car" ||
      e.eventType === "red_flag" ||
      e.eventType === "vsc" ||
      e.eventType === "undercut" ||
      e.eventType === "overcut" ||
      e.eventType === "degradation_loss" ||
      (e.eventType === "pit_stop" && (e.positionsGained ?? 0) !== 0)
  )

  const getDriverName = (raceEntryId: number | null) => {
    if (!raceEntryId) return null
    const entry = entries.find((e) => e.id === raceEntryId)
    return entry ? `${entry.driver.firstName} ${entry.driver.lastName}` : null
  }

  const formatPositionChange = (gained: number | null) => {
    if (gained === null || gained === 0) return null
    if (gained > 0) return `+${gained}`
    return `${gained}`
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "pit_stop":
        return "Pit Stop"
      case "safety_car":
        return "Safety Car"
      case "vsc":
        return "VSC"
      case "red_flag":
        return "Red Flag"
      case "undercut":
        return "Undercut"
      case "overcut":
        return "Overcut"
      case "degradation_loss":
        return "Tire Deg"
      default:
        return type
    }
  }

  if (significantEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Key Strategy Moments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No significant strategy events recorded.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Strategy Moments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {significantEvents.map((event) => (
            <div key={event.id} className="flex gap-4 border-l-2 border-border pl-4">
              <div className="flex-shrink-0 w-16">
                <span className="font-mono text-sm text-muted-foreground">
                  Lap {event.lap}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-0.5 bg-secondary rounded">
                    {getEventTypeLabel(event.eventType)}
                  </span>
                  {event.positionsGained !== null && event.positionsGained !== 0 && (
                    <span
                      className={`text-xs font-medium ${
                        event.positionsGained > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPositionChange(event.positionsGained)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
