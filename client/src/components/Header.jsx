import { FaSignInAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'

function Header() {
    // useNavigate hook working in simple terms : it allows us to programmatically change the URL and navigate to different pages within our React application without needing to use traditional anchor tags or reload the page.
    const navigate = useNavigate()
    // useDispatch hook in simple terms : it provides a way to send actions to the Redux store, allowing us to update the application's state from within our React components.
    const dispatch = useDispatch()

    // 1. Get the user from the Redux Store
    // useSelector hook in simple terms : it allows us to extract and read 
    const { user } = useSelector((state) => state.auth)

    const onLogout = () => {
        dispatch(logout())
        dispatch(reset())
        navigate('/')
    }

    return (
        <header className='flex justify-between items-center p-5 border-b border-gray-200'>
            <div className='logo'>
                <Link to='/' className='font-bold text-xl'>RentACar</Link>
            </div>

            <ul className='flex items-center gap-5'>
                {user ? (
                    // IF USER IS LOGGED IN: Show Logout
                    <li>
                        <button className='btn flex items-center gap-2 hover:text-gray-600' onClick={onLogout}>
                            <FaSignOutAlt /> Logout
                        </button>
                    </li>
                ) : (
                    // IF USER IS NOT LOGGED IN: Show Login/Register
                    <>
                        <li>
                            <Link to='/login' className='flex items-center gap-2 hover:text-gray-600'>
                                <FaSignInAlt /> Login
                            </Link>
                        </li>
                        <li>
                            <Link to='/register' className='flex items-center gap-2 hover:text-gray-600'>
                                <FaUser /> Register
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </header>
    )
}

export default Header