import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Nav from './components/layout/Nav'
import Home from './pages/Home'
import Chat from './pages/Chat'
import About from './pages/About'

const Soul = lazy(() => import('./pages/Soul'))

function App() {
  return (
    <BrowserRouter>
      <Nav />
      <div className="pt-14">
        <Suspense fallback={
          <div className="min-h-[calc(100vh-3.5rem)] bg-bg-base flex items-center justify-center">
            <span className="text-4xl animate-breathe">🦎</span>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/soul" element={<Soul />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  )
}

export default App
