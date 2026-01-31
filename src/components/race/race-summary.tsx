import type { Race, RaceEntry, Driver, Stint } from "@/lib/db/schema"

type RaceEntryWithDriver = RaceEntry & {
  driver: Driver
  stints: Stint[]
}

interface RaceSummaryProps {
  race: Race
  entries: RaceEntryWithDriver[]
}

export function RaceSummary({ race, entries }: RaceSummaryProps) {
  const podium = entries
    .filter((e) => e.finishPosition && e.finishPosition <= 3)
    .sort((a, b) => a.finishPosition! - b.finishPosition!)

  const dnfCount = entries.filter((e) => e.status === "dnf").length
  const totalPitStops = entries.reduce((sum, e) => sum + (e.totalPitStops ?? 0), 0)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const podiumColors = ["text-yellow-400", "text-gray-400", "text-amber-600"]

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Race Summary</h2>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Podium card */}
        <div className="sm:col-span-2 rounded-lg border border-border bg-card p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Podium
          </h3>
          <div className="space-y-2">
            {podium.map((entry, idx) => (
              <div key={entry.id} className="flex items-center gap-3">
                <span className={`font-bold text-lg w-8 ${podiumColors[idx]}`}>
                  P{entry.finishPosition}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.driver.firstName} {entry.driver.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.team}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Total Laps
          </h3>
          <p className="text-2xl font-bold">{race.actualLaps ?? race.totalLaps}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(race.raceDate)}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Pit Stops
          </h3>
          <p className="text-2xl font-bold">{totalPitStops}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {dnfCount} DNF{dnfCount !== 1 ? "s" : ""} · {entries.length} drivers
          </p>
        </div>
      </div>
    </section>
  )
}
