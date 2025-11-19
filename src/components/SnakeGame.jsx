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

      // BORDER COLLISION: end game if touching border
      if (next.x < 0 || next.x >= COLS || next.y < 0 || next.y >= ROWS) {
        setRunning(false)
        return prev
      }

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
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    ctx.clearRect(0,0,WIDTH,HEIGHT)

    // background with subtle green checker and vignette
    for (let y=0;y<ROWS;y++){
      for (let x=0;x<COLS;x++){
        ctx.fillStyle = (x+y)%2===0 ? '#052e16' : '#064e3b' // deep greens
        ctx.fillRect(x*CELL, y*CELL, CELL, CELL)
      }
    }

    // vignette overlay
    const grad = ctx.createRadialGradient(WIDTH/2, HEIGHT/2, Math.min(WIDTH,HEIGHT)/6, WIDTH/2, HEIGHT/2, Math.max(WIDTH,HEIGHT)/1.1)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.35)')
    ctx.fillStyle = grad
    ctx.fillRect(0,0,WIDTH,HEIGHT)

    // board border glow
    ctx.strokeStyle = running ? '#22c55e' : '#ef4444'
    ctx.lineWidth = 4
    ctx.shadowColor = running ? '#22c55e' : '#ef4444'
    ctx.shadowBlur = 12
    ctx.strokeRect(2,2, WIDTH-4, HEIGHT-4)
    ctx.shadowBlur = 0

    // draw food as an apple
    const fx = food.x*CELL + CELL/2
    const fy = food.y*CELL + CELL/2
    const r = CELL*0.35
    const appleGrad = ctx.createRadialGradient(fx-3, fy-3, r*0.3, fx, fy, r)
    appleGrad.addColorStop(0, '#fca5a5')
    appleGrad.addColorStop(1, '#dc2626')
    ctx.fillStyle = appleGrad
    ctx.beginPath()
    ctx.arc(fx, fy, r, 0, Math.PI*2)
    ctx.fill()
    // leaf
    ctx.fillStyle = '#16a34a'
    ctx.beginPath()
    ctx.ellipse(fx+6, fy-10, 6, 3, -0.5, 0, Math.PI*2)
    ctx.fill()
    // stem
    ctx.strokeStyle = '#78350f'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(fx, fy- r - 2)
    ctx.lineTo(fx+4, fy- r - 10)
    ctx.stroke()

    // snake
    snake.forEach((p,i)=>{
      const px = p.x*CELL
      const py = p.y*CELL
      const inset = 2
      const w = CELL - inset*2
      const h = CELL - inset*2

      // rounded rect for body segments
      const radius = 5
      ctx.beginPath()
      ctx.moveTo(px+inset+radius, py+inset)
      ctx.lineTo(px+inset+w-radius, py+inset)
      ctx.quadraticCurveTo(px+inset+w, py+inset, px+inset+w, py+inset+radius)
      ctx.lineTo(px+inset+w, py+inset+h-radius)
      ctx.quadraticCurveTo(px+inset+w, py+inset+h, px+inset+w-radius, py+inset+h)
      ctx.lineTo(px+inset+radius, py+inset+h)
      ctx.quadraticCurveTo(px+inset, py+inset+h, px+inset, py+inset+h-radius)
      ctx.lineTo(px+inset, py+inset+radius)
      ctx.quadraticCurveTo(px+inset, py+inset, px+inset+radius, py+inset)
      ctx.closePath()

      if (i===0) {
        // head with brighter green gradient
        const g = ctx.createLinearGradient(px, py, px+CELL, py+CELL)
        g.addColorStop(0, '#22c55e')
        g.addColorStop(1, '#16a34a')
        ctx.fillStyle = g
        ctx.shadowColor = '#22c55e'
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
        // outline
        ctx.strokeStyle = '#14532d'
        ctx.lineWidth = 2
        ctx.stroke()

        // eyes based on direction
        const eyeOffset = 5
        const eyeR = 3
        let ex1 = px + CELL/2 - eyeOffset
        let ey1 = py + CELL/2 - eyeOffset
        let ex2 = px + CELL/2 + eyeOffset
        let ey2 = py + CELL/2 - eyeOffset
        if (dir.x === 1) { ex1 = px+CELL-8; ey1 = py+8; ex2 = px+CELL-8; ey2 = py+CELL-8 }
        if (dir.x === -1){ ex1 = px+8; ey1 = py+8; ex2 = px+8; ey2 = py+CELL-8 }
        if (dir.y === 1) { ex1 = px+8; ey1 = py+CELL-8; ex2 = px+CELL-8; ey2 = py+CELL-8 }
        if (dir.y === -1){ ex1 = px+8; ey1 = py+8; ex2 = px+CELL-8; ey2 = py+8 }
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(ex1, ey1, eyeR, 0, Math.PI*2); ctx.fill()
        ctx.beginPath(); ctx.arc(ex2, ey2, eyeR, 0, Math.PI*2); ctx.fill()
        ctx.fillStyle = '#111827'
        ctx.beginPath(); ctx.arc(ex1, ey1, 1.5, 0, Math.PI*2); ctx.fill()
        ctx.beginPath(); ctx.arc(ex2, ey2, 1.5, 0, Math.PI*2); ctx.fill()
      } else {
        const g = ctx.createLinearGradient(px, py, px+CELL, py+CELL)
        g.addColorStop(0, '#10b981')
        g.addColorStop(1, '#065f46')
        ctx.fillStyle = g
        ctx.fill()
        ctx.strokeStyle = '#064e3b'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })
  }, [snake, food, running, dir])

  const reset = () => {
    setSnake([{ x: 10, y: 12 }])
    setDir({ x: 1, y: 0 })
    setFood(randCell([{ x: 10, y: 12 }]))
    setSpeed(120)
    setRunning(true)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-900/30" />
      {!running && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-red-400 text-sm">Game Over — you hit the wall.</p>
          <button onClick={reset} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded">Play Again</button>
        </div>
      )}
    </div>
  )
}
