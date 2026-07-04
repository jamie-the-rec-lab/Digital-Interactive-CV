import { useEffect, useState } from 'react'
import RecruiterCV from './RecruiterCV'
import Room3D from './Room3D'

function App() {
  const [inRoom, setInRoom] = useState(() => window.location.hash === '#room')
  useEffect(() => {
    const onHash = () => setInRoom(window.location.hash === '#room')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  if (inRoom) return <Room3D />
  return (
    <>
      <RecruiterCV />
      <a
        href="#room"
        style={{
          position: 'fixed', bottom: 20, right: 20, zIndex: 90,
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 12, textDecoration: 'none',
          background: '#2D2B28', color: '#F5E6D3',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: '0.3px',
          boxShadow: '0 6px 20px rgba(45,43,40,0.35)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(45,43,40,0.45)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(45,43,40,0.35)' }}
      >
        <span style={{ fontSize: 16 }}>🚪</span> Enter the 3D room
      </a>
    </>
  )
}

export default App
