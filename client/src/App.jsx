import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<div className="p-8 text-center text-2xl font-bold text-indigo-600">NoteWise</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
