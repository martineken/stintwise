/**
 * Long Stint Detection Rule
 * 
 * Detects drivers who ran notably longer stints than competitors,
 * which often indicates either good tire management or a strategic gamble.
 */

import type { Insight, AnalysisInput } from "../types"

export function detectLongStints(input: AnalysisInput): Insight[] {
  const insights: Insight[] = []
  
  // Calculate average stint length per stint number
  const stintLengths: Map<number, number[]> = new Map()
  
  for (const entry of input.entries) {
    for (const stint of entry.stints) {
      const lengths = stintLengths.get(stint.stintNumber) ?? []
      lengths.push(stint.lapCount)
      stintLengths.set(stint.stintNumber, lengths)
    }
  }
  
  // Calculate averages
  const avgStintLength: Map<number, number> = new Map()
  for (const [stintNum, lengths] of stintLengths) {
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    avgStintLength.set(stintNum, avg)
  }
  
  // Find drivers with notably long stints (>30% longer than average)
  for (const entry of input.entries) {
    for (const stint of entry.stints) {
      const avg = avgStintLength.get(stint.stintNumber)
      if (!avg) continue
      
      const percentLonger = ((stint.lapCount - avg) / avg) * 100
      
      if (percentLonger > 30 && stint.lapCount >= 10) {
        insights.push({
          type: "degradation_loss", // Reusing type for now
          lap: stint.endLap,
          description: `${entry.driverName} ran a long ${stint.compound} stint (${stint.lapCount} laps vs ${Math.round(avg)} avg) — ${percentLonger > 50 ? "aggressive tire management" : "extended stint"}`,
          driverNumber: entry.driverNumber,
          positionsGained: 0, // Neutral observation
          metadata: {
            stintNumber: stint.stintNumber,
            compound: stint.compound,
            lapCount: stint.lapCount,
            averageLapCount: Math.round(avg),
            percentLonger: Math.round(percentLonger),
          },
        })
      }
    }
  }
  
  return insights
}
