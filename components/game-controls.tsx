"use client"

import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

export default function GameControls() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 w-full max-w-md">
      <div className="flex flex-col items-center">
        <h3 className="font-semibold mb-2">Movement</h3>
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <Button variant="outline" size="icon" className="aspect-square">
            <ArrowUp className="h-4 w-4" />
          </Button>
          <div></div>
          <Button variant="outline" size="icon" className="aspect-square">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="aspect-square">
            <ArrowDown className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="aspect-square">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Or use WASD keys</p>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="font-semibold mb-2">Actions</h3>
        <Button className="w-full mb-2 bg-pink-500 hover:bg-pink-600">Throw Cake (Space)</Button>
        <p className="text-sm text-muted-foreground">Press Space to throw cake in the direction you&apos;re facing</p>
      </div>
    </div>
  )
}

