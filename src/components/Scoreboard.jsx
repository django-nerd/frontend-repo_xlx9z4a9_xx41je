import React, { useEffect, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Scoreboard({ score, onNewHigh }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [high, setHigh] = useState(0)
  const [name, setName] = useState('')

  const fetchHigh = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BACKEND}/api/highscore`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setHigh(data.score || 0)
      setLoading(false)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  useEffect(() => { fetchHigh() }, [])

  useEffect(() => {
    if (score > high && high !== 0) {
      onNewHigh?.()
    }
  }, [score, high, onNewHigh])

  const saveHigh = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/highscore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })
      })
      if (!res.ok) throw new Error('Failed to save')
      const data = await res.json()
      setHigh(data.score)
      setName('')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="flex items-center justify-between bg-slate-800/60 border border-blue-500/20 rounded-xl p-4 text-blue-100">
      <div className="flex items-center gap-4">
        <div className="text-sm opacity-80">Score</div>
        <div className="text-2xl font-bold text-white">{score}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm opacity-80">High</div>
        <div className="text-2xl font-bold text-emerald-400">{loading ? '...' : high}</div>
      </div>
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name (optional)"
          className="bg-slate-900/60 border border-slate-700 text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-slate-500"
        />
        <button
          onClick={saveHigh}
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-3 py-1 rounded transition"
        >Save</button>
      </div>
    </div>
  )
}
