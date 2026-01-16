import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaSearch, FaCheck, FaTimes, FaCalendarAlt, FaUser, FaClock, FaCheckCircle, FaBan, FaFlagCheckered, FaBell, FaKey, FaFileInvoice, FaCarSide } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function HostBookings() {

    const [activeTab, setActiveTab] = useState('Pending')

    // --- MOCK DATA ---
    const bookings = [
        {
            id: 1,
            user: { name: 'Alex Johnson', image: null },
            car: { make: 'Toyota', model: 'Camry SE', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-12-12',
            endDate: '2025-12-14',
            totalPrice: 6854,
            status: 'Pending',
            requestedAt: '2 hours ago'
        },
        {
            id: 5,
            user: { name: 'John Doe', image: null },
            car: { make: 'Hyundai', model: 'Creta', image: 'https://images.unsplash.com/photo-1609529669235-c07e4e1bd6e9?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-12-12',
            endDate: '2025-12-14',
            totalPrice: 5500,
            status: 'Approved', // Host approved, waiting for user payment
            requestedAt: '5 hours ago'
        },
        {
            id: 2,
            user: { name: 'Sarah Connor', image: null },
            car: { make: 'Honda', model: 'City', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-12-15',
            endDate: '2025-12-18',
            totalPrice: 9200,
            status: 'Confirmed', // User paid, ready for pickup
            requestedAt: '1 day ago'
        },
        {
            id: 6,
            user: { name: 'Bruce Wayne', image: null },
            car: { make: 'Lamborghini', model: 'Urus', image: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-12-10',
            endDate: '2025-12-15',
            totalPrice: 150000,
            status: 'Active', // Car is currently out
            requestedAt: '2 days ago'
        },
        {
            id: 3,
            user: { name: 'Mike Ross', image: null },
            car: { make: 'Mahindra', model: 'Thar', image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-11-20',
            endDate: '2025-11-25',
            totalPrice: 15400,
            status: 'Completed',
            requestedAt: '2 weeks ago'
        },
        {
            id: 4,
            user: { name: 'Harvey Specter', image: null },
            car: { make: 'BMW', model: '5 Series', image: 'https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=1000&auto=format&fit=crop' },
            startDate: '2025-12-20',
            endDate: '2025-12-22',
            totalPrice: 22000,
            status: 'Cancelled',
            requestedAt: '3 days ago'
        },
    ]

    // Added 'Active' and 'Approved' to tabs logic
    const tabs = ['Pending', 'Approved', 'Confirmed', 'Active', 'Completed', 'Cancelled']
    const filteredBookings = bookings.filter(booking => booking.status === activeTab)

    const handleAction = (id, action) => {
        alert(`${action} triggered for booking #${id}`)
    }

    // --- STYLE LOGIC ---
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
            case 'Approved': // Approved but not paid
                return {
                    container: 'bg-sky-50 border-l-sky-500 dark:bg-sky-500/5 dark:border-l-sky-500',
                    text: 'text-sky-900 dark:text-sky-100',
                    subText: 'text-sky-700/60 dark:text-sky-200/60',
                    iconColor: 'text-sky-500/10 dark:text-sky-500/20',
                    Icon: FaBell
                }
            case 'Confirmed': // Paid, Ready to start
                return {
                    container: 'bg-emerald-50 border-l-emerald-500 dark:bg-emerald-500/5 dark:border-l-emerald-500',
                    text: 'text-emerald-900 dark:text-emerald-100',
                    subText: 'text-emerald-700/60 dark:text-emerald-200/60',
                    iconColor: 'text-emerald-500/10 dark:text-emerald-500/20',
                    Icon: FaCheckCircle
                }
            case 'Active': // In Trip
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
                    container: 'bg-red-50 border-l-red-500 dark:bg-red-500/5 dark:border-l-red-500',
                    text: 'text-red-900 dark:text-red-100',
                    subText: 'text-red-700/60 dark:text-red-200/60',
                    iconColor: 'text-red-500/10 dark:text-red-500/20',
                    Icon: FaBan
                }
            default: return { container: '', text: '', subText: '', iconColor: '', Icon: FaCheckCircle }
        }
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
                            className={`pb-4 px-2 text-sm font-bold transition-all relative flex-shrink-0
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
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800">
                            <p className="text-gray-400 font-medium">No {activeTab.toLowerCase()} requests found.</p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => {
                            const style = getCardStyle(booking.status)

                            return (
                                <div key={booking.id} className={`relative p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all border-l-4 overflow-hidden group ${style.container}`}>

                                    {/* --- WATERMARK ICON (Background) --- */}
                                    <div className={`absolute -right-6 -bottom-8 text-9xl transform rotate-12 select-none pointer-events-none transition-transform group-hover:scale-110 duration-700 ${style.iconColor}`}>
                                        <style.Icon />
                                    </div>

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-center">

                                        {/* 1. Car Info */}
                                        <div className="flex items-center gap-5 w-full lg:w-1/3">
                                            <div className="w-24 h-16 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                <img src={booking.car.image} alt="car" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg leading-none mb-1 ${style.text}`}>{booking.car.make} {booking.car.model}</h3>
                                                <p className={`text-xs font-bold uppercase tracking-wider ${style.subText}`}>Trip ID: #{booking.id}92</p>
                                            </div>
                                        </div>

                                        {/* 2. Renter & Dates */}
                                        <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-1/3 lg:pl-6 border-l-0 lg:border-l border-black/5 dark:border-white/5">
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase mb-1 ${style.subText}`}>Renter</p>
                                                <div className="flex items-center gap-2">
                                                    <FaUser className={`text-xs ${style.subText}`} />
                                                    <span className={`font-bold ${style.text}`}>{booking.user.name}</span>
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

                                        {/* 3. Price & DYNAMIC ACTIONS */}
                                        <div className="w-full lg:w-1/3 flex flex-row justify-between items-center lg:justify-end gap-6">
                                            <div className="text-right">
                                                <p className={`text-[10px] font-bold uppercase mb-1 ${style.subText}`}>Total Value</p>
                                                <p className={`text-2xl font-black ${style.text}`}>₹{booking.totalPrice}</p>
                                            </div>

                                            {/* --- ACTION BUTTON LOGIC --- */}

                                            {/* A. Pending -> Approve/Reject */}
                                            {booking.status === 'Pending' && (
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleAction(booking.id, 'Rejected')} className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white transition flex items-center justify-center shadow-lg" title="Reject">
                                                        <FaTimes size={18} />
                                                    </button>
                                                    <button onClick={() => handleAction(booking.id, 'Approved')} className="w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-500 dark:hover:bg-emerald-400 transition flex items-center justify-center shadow-lg" title="Approve">
                                                        <FaCheck size={18} />
                                                    </button>
                                                </div>
                                            )}

                                            {/* B. Approved -> Notify (Remind to Pay) */}
                                            {booking.status === 'Approved' && (
                                                <button onClick={() => handleAction(booking.id, 'Notified')} className="px-6 py-3 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold text-xs flex items-center gap-2 hover:bg-sky-200 dark:hover:bg-sky-500/30 transition shadow-sm">
                                                    <FaBell /> Notify
                                                </button>
                                            )}

                                            {/* C. Confirmed -> Start Trip (Handover Keys) */}
                                            {booking.status === 'Confirmed' && (
                                                <button onClick={() => handleAction(booking.id, 'Started Trip')} className="px-6 py-3 rounded-xl bg-emerald-900 dark:bg-white text-white dark:text-emerald-900 font-bold text-xs flex items-center gap-2 hover:bg-emerald-700 dark:hover:bg-gray-200 transition shadow-lg">
                                                    <FaKey /> Start Trip
                                                </button>
                                            )}

                                            {/* D. Active -> End Trip (Return Car) */}
                                            {booking.status === 'Active' && (
                                                <button onClick={() => handleAction(booking.id, 'Ended Trip')} className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 transition shadow-lg">
                                                    <FaFlagCheckered /> End Trip
                                                </button>
                                            )}

                                            {/* E. Completed -> View Invoice (Optional) */}
                                            {booking.status === 'Completed' && (
                                                <button className={`w-10 h-10 rounded-full flex items-center justify-center transition hover:bg-black/5 dark:hover:bg-white/10 ${style.text}`}>
                                                    <FaFileInvoice />
                                                </button>
                                            )}

                                        </div>

                                    </div>

                                    {/* Footer Message (Context specific) */}
                                    {booking.status === 'Pending' && (
                                        <div className={`mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2 text-xs font-bold ${style.text}`}>
                                            <FaClock className="animate-pulse" /> Action Required: Request received {booking.requestedAt}
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