import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {race.season} {race.name}
        </CardTitle>
        <CardDescription>
          {race.circuit} · {formatDate(race.raceDate)} · {race.actualLaps ?? race.totalLaps} laps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Podium */}
          <div>
            <h3 className="font-semibold mb-2">Podium</h3>
            <div className="space-y-1">
              {podium.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2">
                  <span className="font-mono text-sm w-6">P{entry.finishPosition}</span>
                  <span className="font-medium">
                    {entry.driver.firstName} {entry.driver.lastName}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    ({entry.team})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-muted-foreground">DNFs:</span>{" "}
              <span className="font-medium">{dnfCount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Pit Stops:</span>{" "}
              <span className="font-medium">{totalPitStops}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Drivers:</span>{" "}
              <span className="font-medium">{entries.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
