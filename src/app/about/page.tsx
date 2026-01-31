import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About | Stintwise",
  description: "Learn how Stintwise analyzes F1 race strategy, tire stints, and key moments.",
}

export default function AboutPage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">About Stintwise</h1>
        <p className="mt-1 text-muted-foreground">
          Understanding why F1 races unfold the way they do
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold mb-3">What is Stintwise?</h2>
          <p className="text-foreground/80 leading-relaxed">
            Stintwise is an F1 analysis tool that breaks down race strategy to explain 
            <em> why</em> races unfold the way they do. Instead of just showing results, 
            we analyze tire stints, pit stop timing, and strategic decisions to reveal 
            the story behind each race.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">How It Works</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-primary mb-1">Data Import</h3>
              <p className="text-sm text-muted-foreground">
                Race data is imported from the OpenF1 API, including lap times, 
                pit stops, tire compounds, and race control events.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-primary mb-1">Strategy Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our rule-based analysis engine detects key strategic moments: 
                undercuts, overcuts, long stints, and position changes through 
                the pit window.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-medium text-primary mb-1">Visual Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Each race is presented with stint visualizations, timeline events, 
                and per-driver strategy breakdowns to tell the complete story.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Analysis Rules</h2>
          <ul className="space-y-2 text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Undercut Detection:</strong> Identifies when a driver gains 
                position by pitting earlier than a competitor
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Position Changes:</strong> Highlights significant grid-to-finish 
                position changes and their likely causes
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>
                <strong>Long Stints:</strong> Detects drivers running notably longer 
                stints than average, indicating tire management or strategic gambles
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3">Tech Stack</h2>
          <div className="flex flex-wrap gap-2">
            {["Next.js", "TypeScript", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "OpenF1 API"].map((tech) => (
              <span 
                key={tech}
                className="text-xs font-medium px-2.5 py-1 rounded bg-secondary text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Built as a portfolio project to explore F1 data analysis and modern web development.
            Data sourced from the{" "}
            <a 
              href="https://openf1.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              OpenF1 API
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}
