import { Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Contact from './pages/Contact'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default App
