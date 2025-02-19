import { useState, useEffect } from 'react'
import './styles.css'

const adjustColor = (color) => {
  const colors = {
    blue: '#2980b9',
    red: '#c0392b',
    orange: '#d35400',
    purple: '#8e44ad',
    pink: '#c2185b',
  }
  return colors[color] || color
}

const defaultFlags = ['blue', 'red', 'orange', 'purple', 'pink']

export default function App() {
  const [flags, setFlags] = useState(defaultFlags)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [holes, setHoles] = useState([null, null])
  const [message, setMessage] = useState(null)
  const [combinations, setCombinations] = useState(new Set())
  const [totalCombinations, setTotalCombinations] = useState(0)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)
  const [starAnimation, setStarAnimation] = useState(false)

  const calculatePermutations = (n, r) => {
    // Calculate n!/(n-r)!
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
  const [starBlinkSound] = useState(() => {
    const audio = new Audio('/audio/star-blink-sound.mp3')
    audio.preload = 'auto' // Preload the audio file
    return audio
  })

  const [failSound] = useState(() => {
    const audio = new Audio('/audio/fail-sound.mp3')
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

  const handleDragStart = (index) => {
    setDraggedIndex(index)
  }

  const handleTouchStart = (index) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Helper function to create a unique string key for each combination
  const createCombinationKey = (combo) => {
    return combo.join('-')
  }

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 2000)
  }

  const handleDrop = (e, holeIndex) => {
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
          starBlinkSound.currentTime = 0
          const playPromise = starBlinkSound.play()
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
          failSound.currentTime = 0
          const playPromise = failSound.play()
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

  const handleTouchEnd = (e, holeIndex) => {
    handleDrop(e, holeIndex)
  }

  const handleReset = () => {
    setFlags(['blue', 'red', 'orange', 'purple', 'pink'])
    setHoles(Array(holes.length).fill(null))
    setMessage(null)
  }

  const handleRightClick = (e, holeIndex) => {
    e.preventDefault(); // Prevent default context menu
    if (holes[holeIndex] !== null) {
      const removedFlag = holes[holeIndex];
      setFlags([...flags, removedFlag]);
      const newHoles = [...holes];
      newHoles[holeIndex] = null;
      setHoles(newHoles);
    }
  };

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
                  -20,
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
                  -20,
                )})`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        ))}
      </div>
      <div className="star-container">
        <img
          src="/images/star.png"
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
          Các tổ hợp đã thử: {combinations.size}/{totalCombinations} (
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
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
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
