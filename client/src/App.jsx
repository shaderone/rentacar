import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/common/Header'
import PrivateRoute from './components/common/PrivateRoute'

// Public Pages
import Dashboard from './pages/public/Dashboard'
import Login from './pages/public/Login'
import Register from './pages/public/Register'
import AllCars from './pages/public/AllCars'
import CarDetails from './pages/public/CarDetails'

// User Pages
import MyBookings from './pages/user/MyBookings'
import Profile from './pages/user/Profile'
import BookingConfirmation from './pages/user/BookingConfirmation'

// Host Pages
import HostDashboard from './pages/host/HostDashboard'
import AddCar from './pages/host/AddCar'
import MyFleet from './pages/host/MyFleet'
import HostBookings from './pages/host/HostBookings'
import EditCar from './pages/host/EditCar'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path='/' element={<Dashboard />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/all-cars' element={<AllCars />} />
        <Route path='/car/:id' element={<CarDetails />} />

        {/* PROTECTED: LOGGED IN USERS (User, Host, Admin) */}
        <Route element={<PrivateRoute allowedRoles={['user', 'host', 'admin']} />}>
          {/* Note: changed path to match the navigate() in BookingConfirmation */}
          <Route path='/my-bookings' element={<MyBookings />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='/confirm-booking' element={<BookingConfirmation />} />
        </Route>

        {/* PROTECTED: HOST ONLY */}
        <Route element={<PrivateRoute allowedRoles={['host']} />}>
          <Route path='/host/dashboard' element={<HostDashboard />} />
          <Route path='/host/add-car' element={<AddCar />} />
          <Route path='/host/my-fleet' element={<MyFleet />} />
          <Route path='/host/requests' element={<HostBookings />} />
          <Route path='/host/edit-car/:id' element={<EditCar />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App