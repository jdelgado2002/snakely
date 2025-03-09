"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const PLAYER_COLORS = [
  "#FF5733", // Red-Orange
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F033FF", // Purple
  "#FFFC33", // Yellow
]

export default function LobbyScreen({ players, addPlayer, startGame }) {
  const [playerName, setPlayerName] = useState("")
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0])

  const handleAddPlayer = (e) => {
    e.preventDefault()
    if (playerName.trim() && players.length < 5) {
      addPlayer(playerName.trim(), selectedColor)
      setPlayerName("")
      // Select next available color
      const nextColorIndex = (PLAYER_COLORS.indexOf(selectedColor) + 1) % PLAYER_COLORS.length
      setSelectedColor(PLAYER_COLORS[nextColorIndex])
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Game Lobby</CardTitle>
        <CardDescription className="text-center">Add up to 5 players to join the cake battle!</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddPlayer} className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Player name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={10}
              className="flex-1"
              disabled={players.length >= 5}
            />
            <div className="flex gap-1">
              {PLAYER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? "border-black" : "border-transparent"}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  disabled={players.length >= 5}
                />
              ))}
            </div>
            <Button type="submit" disabled={players.length >= 5 || !playerName.trim()}>
              Add
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Players:</h3>
          {players.length === 0 ? (
            <p className="text-gray-500 italic">No players yet. Add some players to start!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="p-2 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: `${player.color}20` }}
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                  <span className="font-medium">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={startGame} disabled={players.length === 0} className="w-full">
          Start Game
        </Button>
      </CardFooter>
    </Card>
  )
}

