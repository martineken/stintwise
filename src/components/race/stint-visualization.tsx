import type { Stint } from "@/lib/db/schema"

interface StintVisualizationProps {
  stints: Stint[]
  totalLaps: number
}

const compoundColors: Record<string, { bg: string; text: string }> = {
  soft: { bg: "bg-red-500", text: "text-white" },
  medium: { bg: "bg-yellow-400", text: "text-black" },
  hard: { bg: "bg-white border border-gray-300", text: "text-black" },
  intermediate: { bg: "bg-green-500", text: "text-white" },
  wet: { bg: "bg-blue-500", text: "text-white" },
}

export function StintVisualization({ stints, totalLaps }: StintVisualizationProps) {
  if (stints.length === 0) {
    return <p className="text-sm text-muted-foreground">No stint data</p>
  }

  return (
    <div className="space-y-2">
      {/* Stint bar */}
      <div className="flex h-8 rounded overflow-hidden">
        {stints.map((stint, index) => {
          const width = (stint.lapCount / totalLaps) * 100
          const colors = compoundColors[stint.compound.toLowerCase()] ?? compoundColors.hard
          
          return (
            <div
              key={stint.id ?? index}
              className={`${colors.bg} ${colors.text} flex items-center justify-center text-xs font-medium relative group`}
              style={{ width: `${width}%` }}
              title={`${stint.compound}: L${stint.startLap}-${stint.endLap} (${stint.lapCount} laps)`}
            >
              {width > 15 && (
                <span className="truncate px-1">
                  {stint.compound.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                {stint.compound} · L{stint.startLap}-{stint.endLap} · {stint.lapCount} laps
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-3 text-xs text-muted-foreground">
        {stints.map((stint, index) => {
          const colors = compoundColors[stint.compound.toLowerCase()] ?? compoundColors.hard
          return (
            <div key={stint.id ?? index} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
              <span>
                {stint.compound} ({stint.lapCount})
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
