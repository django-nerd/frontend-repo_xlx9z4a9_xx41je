import React, { useEffect, useRef, useState, useCallback } from 'react'

const CELL = 20
const COLS = 24
const ROWS = 24
const WIDTH = COLS * CELL
const HEIGHT = ROWS * CELL

const DIRS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
}

function randCell(exclude) {
  while (true) {
    const p = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }
    if (!exclude.some(e => e.x === p.x && e.y === p.y)) return p
  }
}

export default function SnakeGame({ onScoreChange }) {
  const canvasRef = useRef(null)
  const [snake, setSnake] = useState([{ x: 10, y: 12 }])
  const [dir, setDir] = useState({ x: 1, y: 0 })
  const [food, setFood] = useState(randCell([{ x: 10, y: 12 }]))
  const [speed, setSpeed] = useState(120)
  const [running, setRunning] = useState(true)

  const score = snake.length - 1
  useEffect(() => { onScoreChange?.(score) }, [score, onScoreChange])

  const step = useCallback(() => {
    if (!running) return
    setSnake(prev => {
      const head = prev[0]
      const next = { x: head.x + dir.x, y: head.y + dir.y }
      // Wrap around edges
      next.x = (next.x + COLS) % COLS
      next.y = (next.y + ROWS) % ROWS
      // Collision with self
      if (prev.some((p, i) => i !== 0 && p.x === next.x && p.y === next.y)) {
        setRunning(false)
        return prev
      }
      const ate = next.x === food.x && next.y === food.y
      const newSnake = [next, ...prev]
      if (!ate) newSnake.pop()
      else setFood(randCell(newSnake))
      return newSnake
    })
  }, [dir, food, running])

  useEffect(() => {
    const id = setInterval(step, speed)
    return () => clearInterval(id)
  }, [step, speed])

  useEffect(() => {
    const onKey = (e) => {
      const d = DIRS[e.key]
      if (!d) return
      // prevent reversing directly
      if (snake.length > 1 && snake[0].x + d.x === snake[1].x && snake[0].y + d.y === snake[1].y) return
      setDir(d)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [snake])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0,0,WIDTH,HEIGHT)

    // background grid
    for (let y=0;y<ROWS;y++){
      for (let x=0;x<COLS;x++){
        ctx.fillStyle = (x+y)%2===0 ? '#0f172a' : '#111827'
        ctx.fillRect(x*CELL, y*CELL, CELL, CELL)
      }
    }

    // food
    ctx.fillStyle = '#f43f5e'
    ctx.shadowColor = '#f43f5e'
    ctx.shadowBlur = 8
    ctx.fillRect(food.x*CELL, food.y*CELL, CELL, CELL)
    ctx.shadowBlur = 0

    // snake
    snake.forEach((p,i)=>{
      ctx.fillStyle = i===0 ? '#22d3ee' : '#38bdf8'
      ctx.fillRect(p.x*CELL+1, p.y*CELL+1, CELL-2, CELL-2)
    })
  }, [snake, food])

  const reset = () => {
    setSnake([{ x: 10, y: 12 }])
    setDir({ x: 1, y: 0 })
    setFood(randCell([{ x: 10, y: 12 }]))
    setSpeed(120)
    setRunning(true)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-xl border border-blue-500/30 shadow-lg shadow-blue-900/20" />
      {!running && (
        <div className="flex gap-2">
          <button onClick={reset} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Play Again</button>
        </div>
      )}
    </div>
  )
}
