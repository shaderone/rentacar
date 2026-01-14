// App.jsx decides which pages to show based on the route.

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Login from './pages/Login'
import CarDetails from './pages/carDetails'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import MyBookings from './pages/myBookings'

function App() {
  return (
    <>
      <Router>
        <div className='container mx-auto px-4'>
          <Header />
          <Routes>
            <Route path='/' element={<Dashboard />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/car/:id' element={<CarDetails />} />
            <Route path='/mybookings' element={<MyBookings />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App