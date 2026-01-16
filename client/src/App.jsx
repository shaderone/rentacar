// App.jsx decides which pages to show based on the route.

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import Login from './pages/public/Login'
import CarDetails from './pages/public/CarDetails'
import Dashboard from './pages/public/Dashboard'
import Register from './pages/public/Register'
import MyBookings from './pages/user/myBookings'
import AllCars from './pages/public/AllCars'
import Profile from './pages/user/Profile'
import BookingConfirmation from './pages/user/BookingConfirmation'
import AddCar from './pages/host/AddCar'
import HostDashboard from './pages/host/HostDashboard'
import PrivateRoute from './components/common/PrivateRoute'
import MyFleet from './pages/host/MyFleet'
import HostBookings from './pages/host/HostBookings'
import EditCar from './pages/host/editCar'

// ... imports

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/all-cars' element={<AllCars />} />
        <Route path='/car/:id' element={<CarDetails />} />

        {/* PROTECTED: LOGGED IN USERS ONLY */}
        <Route element={<PrivateRoute allowedRoles={['user', 'host', 'admin']} />}>
          <Route path='/mybookings' element={<MyBookings />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/confirm-booking' element={<BookingConfirmation />} />
        </Route>

        {/* PROTECTED: HOST ONLY */}
        <Route element={<PrivateRoute allowedRoles={['host']} />}>
          <Route path='/host/dashboard' element={<HostDashboard />} />
          <Route path='/host/add-car' element={<AddCar />} />
          <Route path='/host/my-fleet' element={<MyFleet />} />
          <Route path='/host/bookings' element={<HostBookings />} />
          <Route path='/host/edit-car/:id' element={<EditCar />} />
        </Route>

        {/* PROTECTED: ADMIN ONLY */}
        {/* <Route element={<PrivateRoute allowedRoles={['admin']} />}> ... </Route> */}

      </Routes>
    </Router>
  )
}

export default App