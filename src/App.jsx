import React, { useState } from 'react'
import Header from './components/Header'
import SnakeGame from './components/SnakeGame'
import Scoreboard from './components/Scoreboard'

function App() {
  const [score, setScore] = useState(0)
  const [notified, setNotified] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(59,130,246,0.15),transparent_55%)]" />
      <div className="relative min-h-screen flex flex-col items-center p-6 gap-6">
        <Header />
        <div className="w-full max-w-3xl">
          <Scoreboard score={score} onNewHigh={() => setNotified(true)} />
        </div>
        <SnakeGame onScoreChange={(s)=>{ setScore(s); }} />
        {notified && (
          <div className="text-emerald-300/80 text-sm">New high! Save it with your name.</div>
        )}
        <div className="mt-6 text-blue-200/70 text-sm">Use arrow keys to move</div>
      </div>
    </div>
  )
}

export default App