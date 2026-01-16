import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
// 👇 Import Actions
import { getHostBookings, updateBookingStatus, notifyUser } from '../../features/booking/bookingSlice'
import { getMyCars } from '../../features/cars/carSlice' // Check your path: might be 'cars/carSlice'
import { FaCar, FaMoneyBillWave, FaChartLine, FaPlus, FaCheckCircle, FaTimesCircle, FaArrowRight, FaClock, FaSpinner } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function HostDashboard() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // --- REDUX STATE ---
    const { user } = useSelector((state) => state.auth)
    // Default to empty array to prevent crashes if state is loading/undefined
    const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings) || { bookings: [] }
    // Get the user's cars for the widget
    const { cars: myFleet, isLoading: carsLoading } = useSelector((state) => state.cars) || { cars: [] }

    console.log('My Fleet:', myFleet), // Debugging line

        // --- FETCH DATA ON LOAD ---
        useEffect(() => {
            dispatch(getHostBookings())
            dispatch(getMyCars()) // Fetch the host's specific cars
        }, [dispatch])

    // --- CALCULATE DYNAMIC STATS ---
    // 1. Total Earnings (Sum of all 'Completed' trips)
    const totalEarnings = bookings
        .filter(b => b.status === 'Completed')
        .reduce((acc, curr) => acc + curr.totalPrice, 0)

    // 2. Active Rentals
    const activeRentals = bookings.filter(b => b.status === 'Active').length

    // 3. Total Requests (All time)
    const totalBookings = bookings.length

    // --- FILTER PENDING REQUESTS (Top 3 Newest) ---
    const pendingList = bookings
        .filter(b => b.status === 'Pending')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Newest first
        .slice(0, 3)

    // --- ACTION HANDLER ---
    const handleAction = (id, newStatus) => {
        const actionText = newStatus === 'Approved' ? 'Approve' : 'Reject'
        if (window.confirm(`Are you sure you want to ${actionText} this request?`)) {
            dispatch(updateBookingStatus({ id, status: newStatus }))
        }
    }

    // --- STATS CONFIG FOR UI ---
    const stats = [
        {
            title: 'Total Earnings',
            // Format currency (e.g., ₹1,20,000)
            value: `₹${totalEarnings.toLocaleString('en-IN')}`,
            icon: FaMoneyBillWave,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            title: 'Active Rentals',
            value: `${activeRentals} Cars`,
            icon: FaCar,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            title: 'Total Bookings',
            value: totalBookings,
            icon: FaChartLine,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
    ]

    // --- LOADING STATE ---
    if (bookingsLoading && carsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold gap-2 bg-slate-50 dark:bg-slate-950">
                <FaSpinner className="animate-spin" /> Loading Dashboard...
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">Host Portal</span>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-2">
                            Welcome, {user ? user.name.split(' ')[0] : 'Host'}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate('/host/add-car')}
                        className="mt-4 md:mt-0 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition shadow-lg"
                    >
                        <FaPlus size={12} /> Add New Car
                    </button>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* --- LEFT COL: PENDING REQUESTS --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <FaClock className="text-amber-500" /> Pending Approvals
                            </h2>
                            <Link to="/host/requests" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {pendingList.length === 0 ? (
                                <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                                    <p className="text-gray-400 font-medium">No pending requests.</p>
                                    <p className="text-xs text-gray-400 mt-2">New bookings will appear here.</p>
                                </div>
                            ) : (
                                pendingList.map((req) => {
                                    // Handle Car Image safely
                                    const carImage = req.car?.images?.[0] || 'https://via.placeholder.com/150'

                                    // Handle User Avatar (Dicebear for deterministic avatars)
                                    const userAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${req.user?.name}`

                                    // Format Dates
                                    const startDate = new Date(req.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                                    const endDate = new Date(req.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })

                                    return (
                                        <div key={req._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors group hover:border-emerald-500/30">

                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                                                    <img src={userAvatar} alt="user" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{req.user?.name || 'Unknown User'}</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        {req.car?.make} {req.car?.model} • <span className="text-slate-400">{startDate} - {endDate}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                                <div className="text-right">
                                                    <p className="font-black text-slate-900 dark:text-white">₹{req.totalPrice}</p>
                                                    <p className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Action Required</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleAction(req._id, 'Rejected')}
                                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition flex items-center justify-center"
                                                        title="Reject"
                                                    >
                                                        <FaTimesCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(req._id, 'Approved')}
                                                        className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition flex items-center justify-center shadow-lg"
                                                        title="Approve"
                                                    >
                                                        <FaCheckCircle size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COL: FLEET WIDGET (DYNAMIC) --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full min-h-100">

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="flex justify-between items-end mb-8 relative z-10">
                                <h2 className="text-xl font-black">My Fleet</h2>
                                <button onClick={() => navigate('/host/my-fleet')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                    <FaArrowRight size={12} />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {myFleet.length === 0 ? (
                                    <div className="text-center py-6 opacity-50 text-sm">
                                        You haven't listed any cars yet.
                                    </div>
                                ) : (

                                    // Limit to top 3 cars for the widget
                                    myFleet.slice(0, 3).map((car) => {
                                        const image = car.images && car.images.length > 0 ? car.images[0] : 'https://via.placeholder.com/150'

                                        return (
                                            <div
                                                key={car._id}
                                                className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition cursor-pointer"
                                                onClick={() => navigate('/host/cars')}
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
                                                    <img src={image} alt={car.make} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-sm">{car.make} {car.model}</h4>
                                                    <p className="text-xs text-slate-400">₹{car.pricePerDay}/day</p>
                                                </div>
                                                <div className="text-[10px] font-bold px-2 py-1 rounded-lg uppercase bg-emerald-500/20 text-emerald-400">
                                                    Listed
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            <button onClick={() => navigate('/host/add-car')} className="w-full mt-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-emerald-400 transition shadow-lg">
                                + Add Another Car
                            </button>

                        </div>
                    </div>

                </div>

            </div>

            <div className="mt-20 px-6">
                <Footer />
            </div>
        </div>
    )
}

export default HostDashboard