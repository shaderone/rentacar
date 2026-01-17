import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { login, reset } from '../../features/auth/authSlice' // Verify this path
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const { email, password } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    useEffect(() => {
        if (isError) {
            toast.error(message)
        }

        if (isSuccess || user) {
            console.log("role: " + user.role)
            if (user.role === 'host') {
                navigate('/host/dashboard')
            } else if (user.role === 'admin') {
                // navigate('/admin/dashboard') // Admin dashboard route (to be implemented)
                navigate('/')
            }
            else {
                navigate('/') // or '/my-bookings' for users
            }
        }

        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()
        const userData = { email, password }
        dispatch(login(userData))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-slate-800">

                {/* LEFT SIDE: IMAGE */}
                <div className="w-full md:w-1/2 bg-slate-900 relative hidden md:block">
                    <img
                        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1000&auto=format&fit=crop"
                        alt="Login Car"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 p-6">
                        <h2 className="text-3xl font-black text-white mb-2">Welcome Back.</h2>
                        <p className="text-slate-300 font-medium">Ready for your next journey?</p>
                    </div>
                </div>

                {/* RIGHT SIDE: FORM */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center md:text-left mb-10">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Sign In</h1>
                        <p className="text-slate-500 dark:text-slate-400">Enter your details to access your account.</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-6">
                        {isError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100">
                                {message}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    id="email"
                                    name="email"
                                    value={email}
                                    placeholder="name@example.com"
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    id="password"
                                    name="password"
                                    value={password}
                                    placeholder="••••••••"
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSignInAlt />}
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-emerald-500 font-bold hover:underline">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login