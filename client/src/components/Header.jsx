import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { FaMoon, FaSun, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'

function Header() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)

    // --- THEME STATE ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

    useEffect(() => {
        // Apply class to HTML tag
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        // Save preference
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light')
    }

    // --- AUTH LOGIC ---
    const onLogout = () => {
        dispatch(logout())
        dispatch(reset())
        navigate('/')
    }

    const handleBookingsClick = (e) => {
        if (!user) {
            e.preventDefault()
            navigate('/login')
        }
    }

    const isActive = (path) => location.pathname === path

    return (
        <div className="pt-6 px-4 pb-4 sticky top-0 z-50">

            {/* Header Container: Added dark mode classes for demonstration */}
            <header className='app-container mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-4xl px-6 py-4 flex justify-between items-center shadow-lg shadow-slate-200/50 dark:shadow-black/50 border border-white/50 dark:border-slate-800 transition-all duration-300'>

                {/* LOGO */}
                <Link to='/' className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 font-black text-lg shadow-lg group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400 transition duration-300">
                        R
                    </div>
                    <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white hidden md:block">
                        RENTA<span className="text-emerald-600 dark:text-emerald-400">CAR</span>.
                    </span>
                </Link>

                {/* NAV LINKS */}
                <nav className='hidden md:flex items-center gap-8 font-bold text-xs tracking-widest uppercase'>
                    <Link to='/' className={`transition duration-300 hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        Home
                    </Link>
                    <Link to='/all-cars' className={`transition duration-300 hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/all-cars') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        All Cars
                    </Link>
                    <Link to={user ? '/mybookings' : '/login'} onClick={handleBookingsClick} className={`transition duration-300 hover:text-emerald-600 dark:hover:text-emerald-400 ${isActive('/mybookings') ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        Bookings
                    </Link>
                </nav>

                {/* ACTIONS */}
                <div className='flex items-center gap-4'>

                    {/* THEME TOGGLE BUTTON */}
                    <button
                        onClick={toggleTheme}
                        className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-yellow-400 flex items-center justify-center hover:bg-slate-900 hover:text-yellow-400 dark:hover:bg-slate-700 transition duration-300"
                    >
                        {theme === 'light' ? <FaMoon size={14} /> : <FaSun size={14} />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
                            <div className="text-right hidden lg:block">
                                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{user.name.split(' ')[0]}</p>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Member</p>
                            </div>

                            {/* User Avatar Group */}
                            <div className="group relative">
                                {/* Link to Profile Page */}
                                <Link to='/profile'>
                                    <button className="w-10 h-10 rounded-full bg-linear-to-br from-slate-800 to-black dark:from-emerald-500 dark:to-teal-600 text-white flex items-center justify-center font-bold shadow-md border-2 border-white dark:border-slate-800 ring-2 ring-transparent hover:ring-emerald-400 transition-all duration-300">
                                        {user.name.charAt(0).toUpperCase()}
                                    </button>
                                </Link>

                                {/* Quick Logout Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                    <Link to='/profile' className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition mb-1">
                                        <FaUserCircle /> Profile
                                    </Link>
                                    <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to='/login' className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold uppercase tracking-wide hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 shadow-md">
                                Login
                            </Link>
                        </div>
                    )}
                </div>

            </header>
        </div>
    )
}

export default Header