import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getMyBookings, updateBookingStatus, reset } from '../../features/booking/bookingSlice'
import { useNavigate } from 'react-router-dom'
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaFileInvoice, FaStar, FaCar, FaBan, FaSearch } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function MyBookings() {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { bookings, isLoading, isError, message } = useSelector((state) => state.bookings)
    const { user } = useSelector((state) => state.auth)



    // --- LOCAL STATE ---
    const [activeTab, setActiveTab] = useState('All')

    // --- EFFECT ---
    useEffect(() => {
        if (isError) console.log(message)
        if (!user) navigate('/login')

        dispatch(getMyBookings())

        // Optional reset
        // return () => dispatch(reset()) 
    }, [user, navigate, isError, message, dispatch])

    // --- FILTER LOGIC ---
    const tabs = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Rejected']

    const filteredBookings = bookings.filter((booking) => {
        if (activeTab === 'All') return true
        return booking.status.toLowerCase() === activeTab.toLowerCase()
    })

    // --- HELPER: STATUS COLORS ---
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
            case 'active': return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
            case 'completed': return 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20'
            case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
            case 'cancelled': return 'text-slate-600 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
            default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
        }
    }

    const getStatusStrip = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-emerald-500'
            case 'approved': return 'bg-emerald-500' // Added Approved
            case 'active': return 'bg-blue-500'
            case 'completed': return 'bg-purple-500'
            case 'pending': return 'bg-amber-400'
            case 'cancelled': return 'bg-slate-500';
            case 'rejected': return 'bg-red-500'
            default: return 'bg-gray-300 dark:bg-slate-700'
        }
    }

    const handleCancel = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel?')) {
            dispatch(updateBookingStatus({ id: bookingId, status: 'Cancelled' }))
        }
    }

    const handlePayment = (id) => {
        // Stripe/Razorpay logic goes.
        if (window.confirm("Proceed to payment simulation?")) {
            dispatch(updateBookingStatus({ id, status: 'Confirmed' }))
            alert("Payment Successful! Trip Confirmed.")
        }
    }

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse bg-slate-50 dark:bg-slate-950">Loading Your Trips...</div>
    }

    return (
        //console.log(bookings) ||
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">

            <div className="app-container mx-auto px-4">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">My Bookings</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Manage your upcoming and past journeys.</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <span className="text-6xl font-black text-slate-200 dark:text-slate-800 tracking-tighter">
                            {String(bookings.length).padStart(2, '0')}
                        </span>
                    </div>
                </div>

                {/* --- TABS --- */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 border
                            ${activeTab === tab
                                    ? 'bg-slate-900 dark:bg-emerald-600 text-white border-slate-900 dark:border-emerald-600 shadow-lg transform -translate-y-0.5'
                                    : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-white'}`}
                        >
                            {tab}
                            {tab === 'All' && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs opacity-80">{bookings.length}</span>}
                        </button>
                    ))}
                </div>

                {/* --- BOOKINGS LIST --- */}
                <div className="space-y-4">

                    {/* HEADERS (Desktop Only) */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                        <div className="col-span-4">Car Details</div>
                        <div className="col-span-3">Dates</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-3 text-right">Actions</div>
                    </div>

                    {/* EMPTY STATE */}
                    {filteredBookings.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-4xl p-16 text-center border border-dashed border-gray-300 dark:border-slate-800 shadow-sm transition-colors">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                {activeTab === 'All' ? <FaCar className="text-3xl text-gray-300 dark:text-slate-600" /> : <FaSearch className="text-3xl text-gray-300 dark:text-slate-600" />}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {activeTab === 'All' ? "No trips yet" : `No ${activeTab.toLowerCase()} trips`}
                            </h3>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">
                                {activeTab === 'All' ? "Time to start your engine! Browse our fleet now." : "Your travel history for this category is empty."}
                            </p>
                            {activeTab === 'All' && (
                                <button onClick={() => navigate('/all-cars')} className="px-8 py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-lg">
                                    Browse Cars
                                </button>
                            )}
                        </div>
                    ) : (
                        /* ROWS */
                        filteredBookings.map((booking) => (
                            <div key={booking._id} className="bg-white dark:bg-slate-900 rounded-2xl p-0 shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 overflow-hidden group">
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center relative">

                                    {/* Color Strip Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusStrip(booking.status)}`}></div>

                                    {/* 1. Car Info */}
                                    <div className="col-span-4 p-4 pl-6 flex items-center gap-4">
                                        <div className="w-16 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0">
                                            {booking.car && booking.car.images && booking.car.images[0] ? (
                                                <img src={booking.car.images[0]} alt="car" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-gray-400">NO IMG</div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                                                {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Car Removed'}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">ID: {booking._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    {/* 2. Dates */}
                                    <div className="col-span-3 p-4 md:p-0 pl-6 md:pl-0 border-t md:border-t-0 border-gray-50 dark:border-slate-800 flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                            <FaCalendarAlt size={12} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span>{new Date(booking.startDate).toLocaleDateString()}</span>
                                            <span className="text-xs text-gray-400 dark:text-gray-500">to {new Date(booking.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* 3. Status Badge */}
                                    <div className="col-span-2 p-4 md:p-0 pl-6 md:pl-0">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                                            {booking.status === 'Confirmed' && <FaCheckCircle />}
                                            {booking.status === 'Pending' && <FaClock />}
                                            {booking.status === 'Cancelled' && <FaTimesCircle />}
                                            {booking.status}
                                        </span>
                                    </div>

                                    {/* 4. Actions - Dynamic based on Workflow */}
                                    <div className="col-span-3 p-4 md:p-0 pr-6 text-right flex items-center justify-end gap-2">

                                        {/* CASE 1: PENDING (Waiting for Host) */}
                                        {booking.status === 'Pending' && (
                                            <span className="text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                                                Waiting for Host approval...
                                            </span>
                                        )}

                                        {/* CASE 2: APPROVED (Host said YES, User needs to PAY) */}
                                        {/* {booking.status === 'Approved' && (
                                            <button
                                                onClick={() => navigate(`/payment/${booking._id}`)} // You'll need a payment page
                                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-700 transition flex items-center gap-2 animate-pulse"
                                            >
                                                <FaCheckCircle /> Pay Now
                                            </button>
                                        )} */} {/* a new page will be shown later*/}

                                        {booking.status === 'Approved' && (
                                            <button
                                                onClick={() => handlePayment(booking._id)}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition shadow-md"
                                            >
                                                Pay Now
                                            </button>
                                        )}

                                        {/* CASE 3: CONFIRMED (Paid, waiting for trip start) */}
                                        {booking.status === 'Confirmed' && (
                                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                                                <FaCar /> Ready for Pickup
                                            </span>
                                        )}

                                        {/* CASE 4: ACTIVE (Driving) */}
                                        {booking.status === 'Active' && (
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 animate-pulse">
                                                Trip in Progress
                                            </span>
                                        )}

                                        {/* CASE 5: COMPLETED (Finished) */}
                                        {booking.status === 'Completed' && (
                                            <>
                                                <button className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-slate-700 transition border border-gray-200 dark:border-slate-700" title="View Receipt">
                                                    <FaFileInvoice />
                                                </button>
                                                <button className="px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition border border-yellow-100 dark:border-yellow-500/20 flex items-center gap-1">
                                                    <FaStar /> Rate
                                                </button>
                                            </>
                                        )}

                                        {/* CANCEL BUTTON (Only for Pending or Approved) */}
                                        {['Pending', 'Approved'].includes(booking.status) && (
                                            <button
                                                onClick={() => handleCancel(booking._id)}
                                                className="px-3 py-2 ml-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 text-xs font-bold hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition border border-red-100 dark:border-red-500/20 flex items-center gap-1"
                                            >
                                                <FaBan /> Cancel
                                            </button>
                                        )}

                                        {/* REJECTED STATE */}
                                        {booking.status === 'Rejected' && (
                                            <button onClick={() => navigate('/all-cars')} className="text-xs font-bold text-blue-500 hover:underline">
                                                Book Another Car
                                            </button>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                </div>

            </div>

            <div className="mt-20 px-4">
                <Footer />
            </div>

        </div>
    )
}

export default MyBookings