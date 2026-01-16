import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { register, reset } from '../../features/auth/authSlice'
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSpinner, FaCar, FaKey, FaBriefcase, FaIdCard } from 'react-icons/fa'

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // Default
        businessName: '', // Host specific
        licenseNumber: '' // Host specific
    })

    const { name, email, password, confirmPassword, role, businessName, licenseNumber } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    useEffect(() => {
        if (isError) {
            console.error(message)
        }
        if (isSuccess || user) {
            navigate('/')
        }
        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const selectRole = (selectedRole) => {
        setFormData((prevState) => ({
            ...prevState,
            role: selectedRole
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            alert('Passwords do not match')
        } else {
            // Send all data. The backend will ignore host fields if role is 'user'
            const userData = {
                name,
                email,
                password,
                role,
                businessName: role === 'host' ? businessName : undefined,
                licenseNumber: role === 'host' ? licenseNumber : undefined
            }
            dispatch(register(userData))
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <div className="max-w-5xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row-reverse border border-gray-100 dark:border-slate-800">

                {/* RIGHT SIDE: IMAGE */}
                <div className="w-full md:w-5/12 bg-slate-900 relative hidden md:block">
                    {/* Fixed Image Link */}
                    <img
                        src="https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?q=80&w=1000&auto=format&fit=crop"
                        alt="Luxury Car"
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 p-6">
                        <h2 className="text-3xl font-black text-white mb-2">Drive Your Way.</h2>
                        <p className="text-slate-300 font-medium">Join the premium community.</p>
                    </div>
                </div>

                {/* LEFT SIDE: FORM */}
                <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
                    <div className="text-center md:text-left mb-6">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Create Account</h1>
                        <p className="text-slate-500 dark:text-slate-400">Choose your journey.</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">

                        {/* --- ROLE SELECTOR --- */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div
                                onClick={() => selectRole('user')}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                ${role === 'user'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                        : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-gray-300'}`}
                            >
                                <FaCar className="text-2xl" />
                                <span className="text-xs font-bold uppercase tracking-wide">I want to Rent</span>
                            </div>

                            <div
                                onClick={() => selectRole('host')}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                ${role === 'host'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                                        : 'border-gray-100 dark:border-slate-800 text-gray-400 hover:border-gray-300'}`}
                            >
                                <FaKey className="text-2xl" />
                                <span className="text-xs font-bold uppercase tracking-wide">I want to Host</span>
                            </div>
                        </div>

                        {/* --- HOST SPECIFIC FIELDS (Conditional Render) --- */}
                        {role === 'host' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20 animate-fade-in-down">
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase mb-1 ml-1">Business Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBriefcase className="text-emerald-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 dark:text-white"
                                            name="businessName"
                                            value={businessName}
                                            placeholder="Ex: John's Rentals"
                                            onChange={onChange}
                                            required={role === 'host'}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase mb-1 ml-1">License No.</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaIdCard className="text-emerald-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 dark:text-white"
                                            name="licenseNumber"
                                            value={licenseNumber}
                                            placeholder="Govt. ID / License"
                                            onChange={onChange}
                                            required={role === 'host'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {isError && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold text-center border border-red-100">
                                {message}
                            </div>
                        )}

                        {/* STANDARD FIELDS */}
                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaUser className="text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    name="name"
                                    value={name}
                                    placeholder="Full Name"
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    name="email"
                                    value={email}
                                    placeholder="Email Address"
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    name="password"
                                    value={password}
                                    placeholder="Password"
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-slate-400" />
                                </div>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium transition-all"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    placeholder="Confirm Password"
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {isLoading ? <FaSpinner className="animate-spin" /> : <FaUserPlus />}
                            Create Account
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-emerald-500 font-bold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register