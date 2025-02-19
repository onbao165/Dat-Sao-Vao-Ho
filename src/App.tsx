import { useState, useEffect } from 'react'
import './styles.css'
import failSound from '/audio/fail-sound-2.mp3'
import starBlinkSound from '/audio/star-blink-sound.mp3'
import star from '/images/star-2.png'

type Color = 'blue' | 'red' | 'orange' | 'purple' | 'pink'
type Hole = Color | null

interface AudioState {
  currentTime: number
  preload: string
  play(): Promise<void>
}

const adjustColor = (color: string): string => {
  const colors: { [key: string]: string } = {
    blue: '#2980b9',
    red: '#c0392b',
    orange: '#d35400',
    purple: '#8e44ad',
    pink: '#c2185b',
  }
  return colors[color] || color
}

const defaultFlags: Color[] = ['blue', 'red', 'orange', 'purple', 'pink']

const App = () => {
  const [flags, setFlags] = useState<Color[]>(defaultFlags)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [holes, setHoles] = useState<Hole[]>([null, null])
  const [message, setMessage] = useState<string | null>(null)
  const [combinations, setCombinations] = useState<Set<string>>(new Set())
  const [totalCombinations, setTotalCombinations] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [toast, setToast] = useState<string | null>(null)
  const [starAnimation, setStarAnimation] = useState<boolean>(false)

  const calculatePermutations = (n: number, r: number): number => {
    let result = 1
    for (let i = 0; i < r; i++) {
      result *= n - i
    }
    return result
  }

  useEffect(() => {
    const total = calculatePermutations(defaultFlags.length, holes.length)
    setTotalCombinations(total)
  }, [holes.length])

  useEffect(() => {
    var currentProgress = (combinations.size / totalCombinations) * 100
    if (currentProgress < 20) currentProgress = 20
    setProgress(currentProgress)
  }, [combinations, totalCombinations])

  // Preload audio and keep reference
  const [starBlinkAudio] = useState<AudioState>(() => {
    const audio = new Audio(starBlinkSound)
    audio.preload = 'auto' // Preload the audio file
    return audio
  })

  const [failAudio] = useState<AudioState>(() => {
    const audio = new Audio(failSound)
    audio.preload = 'auto'
    return audio
  })

  const handleIncreaseHoles = () => {
    if (holes.length >= 7) {
      setMessage('Đã đạt số lượng hố tối đa!')
      setTimeout(() => setMessage(null), 2000)
      return
    }
    setHoles([...holes, null])
    setCombinations(new Set())
  }

  const handleDecreaseHoles = () => {
    if (holes.length <= 2) {
      setMessage('Số lượng hố tối thiểu là 2!')
      setTimeout(() => setMessage(null), 2000)
      return
    }
    setHoles(holes.slice(0, -1))
    setCombinations(new Set())
  }

  const handleDragStart = (index: number): void => {
    setDraggedIndex(index)
  }

  const handleTouchStart = (index: number): void => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault()
  }

  const createCombinationKey = (combo: Hole[]): string => {
    return combo.join('-')
  }

  const showToast = (message: string): void => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const handleDrop = (
    e: React.DragEvent | React.TouchEvent,
    holeIndex: number,
  ): void => {
    e.preventDefault()
    if (holes[holeIndex] === null && draggedIndex !== null) {
      const newHoles = [...holes]
      newHoles[holeIndex] = flags[draggedIndex]

      if (newHoles.every((hole) => hole !== null)) {
        const comboKey = createCombinationKey(newHoles)

        if (!combinations.has(comboKey)) {
          setCombinations((prev) => new Set([...prev, comboKey]))
          showToast('+1 điểm')

          // Play success sound and trigger star animation
          starBlinkAudio.currentTime = 0
          const playPromise = starBlinkAudio.play()
          if (playPromise !== undefined) {
            playPromise.catch((error) =>
              console.log('Audio play failed:', error),
            )
          }

          setStarAnimation(true)
          setTimeout(() => setStarAnimation(false), 500)
        } else {
          showToast('Tổ hợp này đã được thử!')
          // Play fail sound
          failAudio.currentTime = 0
          const playPromise = failAudio.play()
          if (playPromise !== undefined) {
            playPromise.catch((error) =>
              console.log('Audio play failed:', error),
            )
          }
        }
      }

      setHoles(newHoles)
      setFlags(flags.filter((_, index) => index !== draggedIndex))
    }
    setDraggedIndex(null)
  }

  const handleTouchEnd = (e: React.TouchEvent, holeIndex: number): void => {
    handleDrop(e, holeIndex)
  }

  const handleReset = () => {
    setFlags(['blue', 'red', 'orange', 'purple', 'pink'])
    setHoles(Array(holes.length).fill(null))
    setMessage(null)
  }

  const handleRightClick = (e: React.MouseEvent, holeIndex: number): void => {
    e.preventDefault() // Prevent default context menu
    if (holes[holeIndex] !== null) {
      const removedFlag = holes[holeIndex] as Color
      setFlags([...flags, removedFlag])
      const newHoles = [...holes]
      newHoles[holeIndex] = null
      setHoles(newHoles)
    }
  }

  const renderCombinations = () => {
    return Array.from(combinations).map((comboKey, index) => {
      const combo = comboKey.split('-')
      return (
        <div key={index} className="combination-item">
          {combo.map((color, colorIndex) => (
            <div
              key={colorIndex}
              className="combination-flag"
              style={{
                background: `linear-gradient(135deg, ${color}, ${adjustColor(
                  color,
                )})`,
                width: '2rem',
                height: '1.5rem',
                margin: '0 0.25rem',
              }}
            />
          ))}
        </div>
      )
    })
  }

  return (
    <div className="container">
      <div className="flags-container">
        {flags.map((color, index) => (
          <div
            key={index}
            draggable
            className="flag"
            onDragStart={() => handleDragStart(index)}
            onTouchStart={() => handleTouchStart(index)}
          >
            <div className="flag-pole" />
            <div
              className="flag-content"
              style={{
                background: `linear-gradient(135deg, ${color}, ${adjustColor(
                  color,
                )})`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="star-container">
        <img
          src={star}
          alt="Progress Star"
          className={`star ${starAnimation ? 'star-success' : ''}`}
          style={{ opacity: progress / 100 }}
        />
      </div>

      <div className="holes-container">
        {holes.map((hole, index) => (
          <div
            key={index}
            className="hole"
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            onTouchEnd={(e) => handleTouchEnd(e, index)}
            onContextMenu={(e) => handleRightClick(e, index)}
            style={{
              border: hole
                ? `4px solid ${hole}`
                : '4px solid rgba(0, 0, 0, 0.8)',
            }}
          >
            {hole && (
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: hole,
                  margin: 'auto',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {message && <div className="message">{message}</div>}
      {/* <div className="stats">
        <div className="perm-count">
          Số cách sắp xếp: {permCount}
        </div>
      </div> */}
      <div className="combinations-container">
        <h3 className="combinations-title">
          Các thứ tự đã thử: {combinations.size} (
          {Math.round((combinations.size / totalCombinations) * 100)}%)
        </h3>
        <div className="combinations-list">{renderCombinations()}</div>
      </div>
      <div className="controls">
        <button
          onClick={handleReset}
          className="button reset-button"
          title="Reset"
        >
          <i className="fas fa-redo-alt"></i> Reset
        </button>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}
        >
          <button
            onClick={handleIncreaseHoles}
            className="button increase-button"
            title="Add Hole"
          >
            <i className="fas fa-plus"></i> Thêm hố
          </button>
          <button
            onClick={handleDecreaseHoles}
            className="button decrease-button"
            title="Remove Hole"
          >
            <i className="fas fa-minus"></i> Giảm hố
          </button>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

export default App
