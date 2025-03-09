"use client"

import { useState } from "react"
import GameCanvas from "./game-canvas"
import LobbyScreen from "./lobby-screen"
import GameControls from "./game-controls"

export default function GameContainer() {
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState([])
  const [localPlayerId, setLocalPlayerId] = useState(null)

  const addPlayer = (name, color) => {
    if (players.length < 5) {
      const newPlayer = {
        id: Date.now().toString(),
        name,
        color,
        x: Math.random() * 700 + 50,
        y: Math.random() * 400 + 50,
        direction: Math.random() > 0.5 ? "right" : "left", // Random initial direction
        score: 0,
        isSlipping: false,
        health: 100,
      }

      setPlayers([...players, newPlayer])
      if (!localPlayerId) {
        setLocalPlayerId(newPlayer.id)
      }

      return newPlayer.id
    }
    return null
  }

  const startGame = () => {
    if (players.length > 0) {
      setGameStarted(true)
    }
  }

  const updatePlayerPosition = (id, x, y, direction) => {
    setPlayers(players.map((player) => (player.id === id ? { ...player, x, y, direction } : player)))
  }

  const handlePlayerHit = (targetId, damage = 10) => {
    setPlayers(
      players.map((player) =>
        player.id === targetId ? { ...player, health: Math.max(0, player.health - damage) } : player,
      ),
    )
  }

  const makePlayerSlip = (id) => {
    setPlayers(players.map((player) => (player.id === id ? { ...player, isSlipping: true } : player)))

    // Reset slipping after 3 seconds
    setTimeout(() => {
      setPlayers((prev) => prev.map((player) => (player.id === id ? { ...player, isSlipping: false } : player)))
    }, 3000)
  }

  const incrementScore = (id) => {
    setPlayers(players.map((player) => (player.id === id ? { ...player, score: player.score + 1 } : player)))
  }

  return (
    <div className="w-full max-w-4xl">
      {!gameStarted ? (
        <LobbyScreen players={players} addPlayer={addPlayer} startGame={startGame} />
      ) : (
        <div className="flex flex-col items-center">
          <div className="relative w-full border-4 border-purple-500 rounded-lg overflow-hidden bg-white shadow-lg">
            <GameCanvas
              players={players}
              localPlayerId={localPlayerId}
              updatePlayerPosition={updatePlayerPosition}
              handlePlayerHit={handlePlayerHit}
              makePlayerSlip={makePlayerSlip}
              incrementScore={incrementScore}
            />
          </div>
          <GameControls localPlayerId={localPlayerId} />
          <div className="mt-4 grid grid-cols-5 gap-2 w-full">
            {players.map((player) => (
              <div
                key={player.id}
                className="p-2 rounded-lg text-center"
                style={{ backgroundColor: `${player.color}30` }}
              >
                <p className="font-bold" style={{ color: player.color }}>
                  {player.name}
                </p>
                <p>Score: {player.score}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${player.health}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

