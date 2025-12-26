import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Gift } from 'lucide-react'
import HomeView from './views/HomeView'
import RoomView from './views/RoomView'

const Header = () => (
  <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
    <a href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
      <Gift size={24} />
      <span className="font-serif text-xl tracking-widest font-bold">SECRET SANTA</span>
    </a>
  </header>
);

const Footer = () => (
  <footer className="absolute bottom-0 left-0 w-full p-4 text-center text-white/20 text-xs font-sans pointer-events-none">
    <p>© 2025 Holiday Edition.</p>
  </footer>
);

function App() {
  return (
    <div className="bg-pattern min-h-screen text-white font-sans selection:bg-amber-500/30">
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/room/:roomId" element={<RoomView />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </div>
  );
}

export default App;
