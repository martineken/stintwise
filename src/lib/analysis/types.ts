/**
 * Types for race analysis insights
 */

export type InsightType =
  | "undercut"
  | "overcut"
  | "degradation_loss"
  | "safety_car_advantage"
  | "pit_stop_position_change"

export interface Insight {
  type: InsightType
  lap: number
  description: string
  driverNumber: number
  targetDriverNumber?: number // For undercut/overcut, who was the target
  positionsGained: number // Negative = lost positions
  metadata?: Record<string, unknown>
}

export interface AnalysisInput {
  raceId: number
  entries: {
    id: number
    driverNumber: number
    driverCode: string
    driverName: string
    team: string
    gridPosition: number | null
    finishPosition: number | null
    stints: {
      stintNumber: number
      compound: string
      startLap: number
      endLap: number
      lapCount: number
    }[]
  }[]
  pitStops: {
    driverNumber: number
    lap: number
    duration: number
  }[]
  totalLaps: number
}
