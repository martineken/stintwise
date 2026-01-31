import Link from "next/link"
import { getAllRaces } from "@/lib/db/queries"
import { raceSlug } from "@/lib/utils/slug"

export default async function HomePage() {
  const allRaces = await getAllRaces()

  // Group races by season
  const racesBySeason = allRaces.reduce((acc, race) => {
    const season = race.season
    if (!acc[season]) acc[season] = []
    acc[season].push(race)
    return acc
  }, {} as Record<number, typeof allRaces>)

  const seasons = Object.keys(racesBySeason)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Races</h1>
        <p className="mt-1 text-muted-foreground">
          Select a race to view strategy analysis
        </p>
      </div>

      {allRaces.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No races imported yet.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Run <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground">pnpm import:race &lt;meeting_key&gt;</code> to add races.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {seasons.map((season) => (
            <div key={season}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="text-primary">{season}</span>
                <span className="text-muted-foreground font-normal text-sm">
                  Season
                </span>
              </h2>
              
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {racesBySeason[season].map((race) => (
                  <Link
                    key={race.id}
                    href={`/race/${raceSlug(race.season, race.name)}`}
                    className="group block"
                  >
                    <div className="rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80 group-hover:shadow-lg group-hover:shadow-primary/5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold group-hover:text-primary transition-colors">
                            {race.name}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {race.circuit}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-secondary text-muted-foreground">
                          R{race.round}
                        </span>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {race.country}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
