import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaCalendarAlt, FaShieldAlt, FaCamera, FaSave, FaSignOutAlt, FaMapMarkerAlt, FaPhone } from 'react-icons/fa'
import { logout, reset } from '../features/auth/authSlice'
import Footer from '../components/Footer'

function Profile() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    // Local state for "Edit Mode"
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: '+91 98765 43210', // Mock data
        location: 'Kochi, Kerala', // Mock data
    })

    useEffect(() => {
        if (!user) navigate('/login')
    }, [user, navigate])

    const onLogout = () => {
        dispatch(logout())
        dispatch(reset())
        navigate('/')
    }

    const handleSave = (e) => {
        e.preventDefault()
        setIsEditing(false)
        alert("Profile updated! (This is a UI demo)")
    }

    if (!user) return null

    return (
        <div className="min-h-screen pt-10 pb-20 transition-colors duration-300">
            <div className="app-container mx-auto px-4">

                {/* --- PAGE HEADER --- */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">My Profile</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your personal information and account security.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* === LEFT: ID CARD (SIDEBAR) === */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 text-center overflow-hidden sticky top-24 transition-colors duration-300">

                            {/* Background Pattern */}
                            <div className="absolute top-0 left-0 w-full h-28 bg-linear-to-r from-slate-800 to-black dark:from-emerald-900 dark:to-slate-950"></div>

                            {/* Avatar */}
                            <div className="relative w-32 h-32 mx-auto -mt-4 mb-4 z-10">
                                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-xl">
                                    <div className="w-full h-full rounded-full bg-linear-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-5xl font-black text-white uppercase shadow-inner">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                                <button className="absolute bottom-1 right-1 w-9 h-9 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center hover:bg-emerald-600 dark:hover:bg-emerald-400 transition shadow-lg border-2 border-white dark:border-slate-900 cursor-pointer" title="Change Photo">
                                    <FaCamera size={14} />
                                </button>
                            </div>

                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">{user.name}</h2>
                            <span className="inline-block px-4 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wide border border-emerald-100 dark:border-emerald-500/20 mb-8">
                                {user.role || 'Member'}
                            </span>

                            <div className="space-y-5 text-left border-t border-gray-100 dark:border-slate-800 pt-6">
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                        <FaEnvelope />
                                    </div>
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <span>{formData.location}</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                        <FaCalendarAlt />
                                    </div>
                                    <span>Joined Dec 2025</span>
                                </div>
                            </div>

                            <button onClick={onLogout} className="w-full mt-8 py-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition flex items-center justify-center gap-2 cursor-pointer">
                                <FaSignOutAlt /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* === RIGHT: EDIT DETAILS (WIDE AREA) === */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <FaUser className="text-emerald-500" /> Account Details
                                </h3>
                                {!isEditing && (
                                    <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline cursor-pointer">
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                {/* Row 1 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                            className={`w-full p-4 rounded-xl font-bold text-slate-900 dark:text-white border outline-none transition duration-200
                                    ${isEditing
                                                    ? 'bg-white dark:bg-slate-950 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                                                    : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled={true}
                                            className="w-full p-4 rounded-xl font-bold text-gray-500 dark:text-gray-400 bg-slate-50 dark:bg-slate-800 border border-transparent cursor-not-allowed"
                                        />
                                        {isEditing && <p className="text-[10px] text-gray-400 mt-2 pl-1 flex items-center gap-1"><FaShieldAlt /> Email cannot be changed.</p>}
                                    </div>
                                </div>

                                {/* Row 2 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={!isEditing}
                                                className={`w-full p-4 pl-12 rounded-xl font-bold text-slate-900 dark:text-white border outline-none transition duration-200
                                        ${isEditing
                                                        ? 'bg-white dark:bg-slate-950 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
                                            />
                                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Location</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={formData.location}
                                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                disabled={!isEditing}
                                                className={`w-full p-4 pl-12 rounded-xl font-bold text-slate-900 dark:text-white border outline-none transition duration-200
                                        ${isEditing
                                                        ? 'bg-white dark:bg-slate-950 border-emerald-500 ring-1 ring-emerald-500 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-800 border-transparent'}`}
                                            />
                                            <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="border-t border-gray-100 dark:border-slate-800 pt-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <FaShieldAlt />
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Security</h4>
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">Password</p>
                                            <p className="text-xs text-gray-400">Last changed 3 months ago</p>
                                        </div>
                                        <button type="button" className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer">
                                            Change Password
                                        </button>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                                        <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition cursor-pointer">
                                            Cancel
                                        </button>
                                        <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg cursor-pointer">
                                            <FaSave /> Save Changes
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    )
}

export default Profile