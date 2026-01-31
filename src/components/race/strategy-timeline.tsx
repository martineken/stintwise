import type { StrategyEvent, RaceEntry, Driver, Stint } from "@/lib/db/schema"
import type { Insight } from "@/lib/analysis"

type RaceEntryWithDriver = RaceEntry & {
  driver: Driver
  stints: Stint[]
}

interface StrategyTimelineProps {
  events: StrategyEvent[]
  entries: RaceEntryWithDriver[]
  insights?: Insight[]
}

// Unified timeline item type
interface TimelineItem {
  id: string
  lap: number
  type: string
  label: string
  description: string
  positionsGained: number | null
  isInsight: boolean
}

export function StrategyTimeline({ events, entries, insights = [] }: StrategyTimelineProps) {
  // Convert DB events to timeline items
  const eventItems: TimelineItem[] = events
    .filter(
      (e) =>
        e.eventType === "safety_car" ||
        e.eventType === "red_flag" ||
        e.eventType === "vsc" ||
        e.eventType === "undercut" ||
        e.eventType === "overcut" ||
        e.eventType === "degradation_loss" ||
        (e.eventType === "pit_stop" && (e.positionsGained ?? 0) !== 0)
    )
    .map((e) => ({
      id: `event-${e.id}`,
      lap: e.lap,
      type: e.eventType,
      label: getEventTypeLabel(e.eventType),
      description: e.description ?? "",
      positionsGained: e.positionsGained,
      isInsight: false,
    }))

  // Convert computed insights to timeline items
  const insightItems: TimelineItem[] = insights.map((i, idx) => ({
    id: `insight-${idx}`,
    lap: i.lap,
    type: i.type,
    label: getEventTypeLabel(i.type),
    description: i.description,
    positionsGained: i.positionsGained,
    isInsight: true,
  }))

  // Merge and deduplicate (prefer insights over raw events for same type/lap)
  const seenKeys = new Set<string>()
  const allItems = [...insightItems, ...eventItems].filter((item) => {
    const key = `${item.lap}-${item.type}`
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })

  // Sort by lap
  allItems.sort((a, b) => a.lap - b.lap)

  // Take top items to avoid overwhelming the UI
  const displayItems = allItems.slice(0, 12)

  if (displayItems.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-4">Key Strategy Moments</h2>
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No significant strategy events detected.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Key Strategy Moments</h2>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {displayItems.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 hover:bg-secondary/30 transition-colors">
              <div className="flex-shrink-0 w-16">
                <span className="inline-flex items-center justify-center w-full font-mono text-xs px-2 py-1 rounded bg-secondary text-muted-foreground">
                  L{item.lap}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    item.isInsight 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                  {item.positionsGained !== null && item.positionsGained !== 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        item.positionsGained > 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {item.positionsGained > 0 ? "+" : ""}{item.positionsGained} pos
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-foreground/90">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function getEventTypeLabel(type: string): string {
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
      return "Long Stint"
    case "pit_stop_position_change":
      return "Strategy"
    default:
      return type
  }
}
