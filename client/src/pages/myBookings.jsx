import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getMyBookings } from '../features/booking/bookingSlice'
import { FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'

function MyBookings() {
    const dispatch = useDispatch()
    const { bookings, isLoading, isError, message } = useSelector((state) => state.bookings)
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        if (isError) {
            console.log(message)
        }
        // Fetch bookings when page loads
        dispatch(getMyBookings())
    }, [dispatch, isError, message])

    if (isLoading) {
        return <div className="text-center mt-20 text-xl font-bold text-gray-400">Loading your trips...</div>
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">My Trips</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <h3 className="text-xl text-gray-500 mb-4">You haven't booked any cars yet.</h3>
                    <a href="/" className="bg-slate-900 text-white px-6 py-2 rounded hover:bg-slate-700 transition">
                        Browse Cars
                    </a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <div key={booking._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col md:flex-row gap-6 items-center">

                            {/* Car Image (Thumbnail) */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                                {/* Safe check to ensure car and images exist before trying to access index 0 */}
                                {booking.car && booking.car.images && booking.car.images.length > 0 ? (
                                    <img src={booking.car.images[0]} alt="Car" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>
                                )}
                            </div>

                            {/* Booking Details */}
                            <div className="grow text-center md:text-left">
                                <h3 className="text-xl font-bold text-slate-800">
                                    {booking.car ? `${booking.car.make} ${booking.car.model}` : 'Car Listing Removed'}
                                </h3>
                                <p className="text-gray-500 text-sm mb-2">Booking ID: {booking._id}</p>

                                <div className="flex flex-col md:flex-row gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <FaCalendarAlt />
                                        <span>
                                            {new Date(booking.startDate).toLocaleDateString()} — {new Date(booking.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Status */}
                            <div className="text-center md:text-right min-w-37.5">
                                <div className="text-2xl font-bold text-emerald-600 mb-1">
                                    ${booking.totalPrice}
                                </div>
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold
                    ${booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                                        booking.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'}`}>

                                    {booking.status === 'Confirmed' && <FaCheckCircle />}
                                    {booking.status === 'Pending' && <FaClock />}
                                    {booking.status === 'Cancelled' && <FaTimesCircle />}
                                    {booking.status}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyBookings