import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function RaceNotFound() {
  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Race Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        The race you're looking for doesn't exist.
      </p>
      <Link href="/" className="mt-4">
        <Button>Back to races</Button>
      </Link>
    </main>
  )
}
