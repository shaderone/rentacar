import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
// 👇 IMPORT REDUX ACTIONS
import { getHostBookings, updateBookingStatus, reset, notifyUser } from '../../features/booking/bookingSlice'
import { FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaUser, FaClock, FaCheckCircle, FaBan, FaFlagCheckered, FaBell, FaKey, FaFileInvoice, FaCarSide, FaSpinner } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function HostBookings() {
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('Pending');

    // --- REDUX STATE ---
    const { bookings, isLoading, isError, message } = useSelector((state) => state.bookings);

    // --- FETCH DATA ON LOAD ---
    useEffect(() => {
        if (isError) {
            console.error(message)
        }
        dispatch(getHostBookings())

        // Optional: Reset on unmount if you want clear state every time
        // return () => { dispatch(reset()) }
    }, [dispatch, isError, message])

    // --- FILTER LOGIC ---
    // Added 'Rejected' to tabs so you can see history
    const tabs = ['All', 'Pending', 'Approved', 'Confirmed', 'Active', 'Completed', 'Cancelled (by user)', 'Rejected']

    const filteredBookings = bookings.filter(booking => {
        // Case-insensitive comparison just to be safe
        if (activeTab === 'All') return true // Show everything
        if (activeTab === 'Cancelled (by user)') {
            return booking.status === 'Cancelled'
        }
        return booking.status.toLowerCase() === activeTab.toLowerCase()
    })

    // --- ACTION HANDLER ---
    const handleAction = (id, newStatus) => {
        if (newStatus === 'Notified') {
            dispatch(notifyUser(id)) // <--- Dispatches to backend now
            alert("Notification request sent to server!")
            return
        }

        const confirmMsg = `Are you sure you want to change status to ${newStatus}?`
        if (window.confirm(confirmMsg)) {
            dispatch(updateBookingStatus({ id, status: newStatus }))
        }
    }

    // --- STYLE LOGIC (Kept exactly as yours) ---
    const getCardStyle = (status) => {
        switch (status) {
            case 'Pending':
                return {
                    container: 'bg-amber-50 border-l-amber-400 dark:bg-amber-500/5 dark:border-l-amber-500',
                    text: 'text-amber-900 dark:text-amber-100',
                    subText: 'text-amber-700/60 dark:text-amber-200/60',
                    iconColor: 'text-amber-500/10 dark:text-amber-500/20',
                    Icon: FaClock
                }
            case 'Approved':
                return {
                    container: 'bg-sky-50 border-l-sky-500 dark:bg-sky-500/5 dark:border-l-sky-500',
                    text: 'text-sky-900 dark:text-sky-100',
                    subText: 'text-sky-700/60 dark:text-sky-200/60',
                    iconColor: 'text-sky-500/10 dark:text-sky-500/20',
                    Icon: FaBell
                }
            case 'Confirmed':
                return {
                    container: 'bg-emerald-50 border-l-emerald-500 dark:bg-emerald-500/5 dark:border-l-emerald-500',
                    text: 'text-emerald-900 dark:text-emerald-100',
                    subText: 'text-emerald-700/60 dark:text-emerald-200/60',
                    iconColor: 'text-emerald-500/10 dark:text-emerald-500/20',
                    Icon: FaCheckCircle
                }
            case 'Active':
                return {
                    container: 'bg-blue-50 border-l-blue-600 dark:bg-blue-600/5 dark:border-l-blue-500',
                    text: 'text-blue-900 dark:text-blue-100',
                    subText: 'text-blue-700/60 dark:text-blue-200/60',
                    iconColor: 'text-blue-600/10 dark:text-blue-500/20',
                    Icon: FaCarSide
                }
            case 'Completed':
                return {
                    container: 'bg-purple-50 border-l-purple-500 dark:bg-purple-500/5 dark:border-l-purple-500',
                    text: 'text-purple-900 dark:text-purple-100',
                    subText: 'text-purple-700/60 dark:text-purple-200/60',
                    iconColor: 'text-purple-500/10 dark:text-purple-500/20',
                    Icon: FaFlagCheckered
                }
            case 'Cancelled':
                return {
                    container: 'bg-slate-100 border-l-slate-500 dark:bg-slate-800 dark:border-l-slate-500',
                    text: 'text-slate-700 dark:text-slate-300',
                    subText: 'text-slate-500 dark:text-slate-400',
                    iconColor: 'text-slate-500/10 dark:text-slate-500/20',
                    Icon: FaTimes
                }
            case 'Rejected': // Added Rejected styling (same as Cancelled)
                return {
                    container: 'bg-red-50 border-l-red-500 dark:bg-red-500/5 dark:border-l-red-500',
                    text: 'text-red-900 dark:text-red-100',
                    subText: 'text-red-700/60 dark:text-red-200/60',
                    iconColor: 'text-red-500/10 dark:text-red-500/20',
                    Icon: FaBan
                }
            default: return { container: '', text: '', subText: '', iconColor: '', Icon: FaCheckCircle }
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold animate-pulse gap-2">
            <FaSpinner className="animate-spin" /> Loading Requests...
        </div>
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10">
                    <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">Management</span>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Requests</h1>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 dark:border-slate-800 pb-1 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-bold transition-all relative shrink-0
                                ${activeTab === tab
                                    ? 'text-slate-900 dark:text-white'
                                    : 'text-gray-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-900 dark:bg-white rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {/* --- BOOKINGS LIST --- */}
                <div className="space-y-6">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-gray-200 dark:border-slate-800">
                            <p className="text-gray-400 font-medium">No {activeTab.toLowerCase()} requests found.</p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => {
                            const style = getCardStyle(booking.status)

                            // Backend uses '_id', not 'id'
                            // Backend uses 'images' array, not 'image' string
                            const carImage = booking.car?.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'

                            return (
                                <div key={booking._id} className={`relative p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border-l-4 overflow-hidden group ${style.container}`}>

                                    {/* --- WATERMARK ICON --- */}
                                    <div className={`absolute -right-6 -bottom-8 text-9xl transform rotate-12 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700 ${style.iconColor}`}>
                                        <style.Icon />
                                    </div>

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">

                                        {/* 1. Car Info */}
                                        <div className="flex items-center gap-5 w-full lg:w-1/3">
                                            <div className="w-24 h-16 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm shrink-0">
                                                <img src={carImage} alt="car" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg leading-none mb-1 ${style.text}`}>
                                                    {booking.car?.make} {booking.car?.model}
                                                </h3>
                                                <p className={`text-xs font-bold uppercase tracking-wider ${style.subText}`}>
                                                    Trip ID: #{booking._id.slice(-6).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 2. Renter & Dates */}
                                        <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-1/3 lg:pl-6 border-l-0 lg:border-l border-black/5 dark:border-white/5">
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase mb-1 ${style.subText}`}>Renter</p>
                                                <div className="flex items-center gap-2">
                                                    <FaUser className={`text-xs ${style.subText}`} />
                                                    <span className={`font-bold ${style.text}`}>
                                                        {booking.user?.name || 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase mb-1 ${style.subText}`}>Schedule</p>
                                                <div className="flex items-center gap-2">
                                                    <FaCalendarAlt className={`text-xs ${style.subText}`} />
                                                    <span className={`font-bold ${style.text}`}>
                                                        {new Date(booking.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(booking.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Price & ACTIONS */}
                                        <div className="w-full lg:w-1/3 flex flex-row justify-between items-center lg:justify-end gap-6">
                                            <div className="text-right">
                                                <p className={`text-[10px] font-bold uppercase mb-1 ${style.subText}`}>Total Value</p>
                                                <p className={`text-2xl font-black ${style.text}`}>₹{booking.totalPrice}</p>
                                            </div>

                                            {/* --- ACTIONS --- */}

                                            {/* A. Pending -> Approve/Reject */}
                                            {booking.status === 'Pending' && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleAction(booking._id, 'Rejected')} className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center shadow-lg" title="Reject">
                                                        <FaTimes size={18} />
                                                    </button>
                                                    <button onClick={() => handleAction(booking._id, 'Approved')} className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition flex items-center justify-center shadow-lg" title="Approve">
                                                        <FaCheck size={18} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* B. Approved -> Notify */}
                                            {booking.status === 'Approved' && (
                                                <button onClick={() => handleAction(booking._id, 'Notified')} className="px-6 py-3 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-2 hover:bg-sky-200 dark:hover:bg-sky-500/30 transition shadow-sm">
                                                    <FaBell /> Notify
                                                </button>
                                            )}

                                            {/* C. Confirmed -> Start Trip */}
                                            {booking.status === 'Confirmed' && (
                                                <button onClick={() => handleAction(booking._id, 'Active')} className="px-6 py-3 rounded-xl bg-emerald-900 dark:bg-white text-white dark:text-emerald-900 font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 dark:hover:bg-gray-200 transition shadow-lg">
                                                    <FaKey /> Start Trip
                                                </button>
                                            )}

                                            {/* D. Active -> End Trip */}
                                            {booking.status === 'Active' && (
                                                <button onClick={() => handleAction(booking._id, 'Completed')} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition shadow-lg">
                                                    <FaFlagCheckered /> End Trip
                                                </button>
                                            )}

                                            {/* E. Completed */}
                                            {booking.status === 'Completed' && (
                                                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-black/5 dark:hover:bg-white/10 ${style.text}`}>
                                                    <FaFileInvoice />
                                                </button>
                                            )}

                                        </div>
                                    </div>

                                    {/* Footer Message */}
                                    {booking.status === 'Pending' && (
                                        <div className={`mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-xs font-bold ${style.text}`}>
                                            <FaClock className="animate-pulse" /> Action Required: Request received {new Date(booking.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                    {booking.status === 'Approved' && (
                                        <div className={`mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-xs font-bold ${style.text}`}>
                                            <FaBell /> Waiting for user payment
                                        </div>
                                    )}

                                </div>
                            )
                        })
                    )}
                </div>
            </div>
            <div className="mt-20 px-6">
                <Footer />
            </div>
        </div>
    )
}

export default HostBookings