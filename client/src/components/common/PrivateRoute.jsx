import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'

// Accepts 'allowedRoles' as a prop (e.g., ['host', 'admin'])
const PrivateRoute = ({ allowedRoles }) => {
    const { user } = useSelector((state) => state.auth)

    // 1. If not logged in -> Go to Login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // 2. If logged in but wrong role -> Go to Home (or Unauthorized page)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />
    }

    // 3. Authorized -> Render the page (Outlet)
    return <Outlet />
}

export default PrivateRoute