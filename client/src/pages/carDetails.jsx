import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getCar } from '../features/cars/carSlice'
import { createBooking, reset as resetBooking } from '../features/booking/bookingSlice'
import { FaGasPump, FaCogs, FaChair, FaCheckCircle } from 'react-icons/fa'

function CarDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { car, isLoading: carLoading, isError: carError, message: carMessage } = useSelector((state) => state.cars)
    const { user } = useSelector((state) => state.auth)
    const { isSuccess: bookingSuccess, isError: bookingError, message: bookingMessage } = useSelector((state) => state.bookings)

    const [formData, setFormData] = useState({ startDate: '', endDate: '' })
    const { startDate, endDate } = formData
    const [totalPrice, setTotalPrice] = useState(0)
    const [days, setDays] = useState(0)

    // 1️⃣ NEW: Track if we actually clicked the button
    const [isSubmitted, setIsSubmitted] = useState(false)

    // Reset on mount (Good practice to keep)
    useEffect(() => {
        dispatch(resetBooking())
    }, [dispatch])

    // Fetch Car
    useEffect(() => {
        if (carError) alert(carMessage)
        dispatch(getCar(id))
    }, [id, carError, carMessage, dispatch])

    // Handle Booking Success/Error
    useEffect(() => {
        // 2️⃣ CHANGED: Only trigger IF success AND we submitted
        if (bookingSuccess && isSubmitted) {
            alert('Booking Successful!')
            dispatch(resetBooking()) // Clean up
            navigate('/mybookings')
        }

        if (bookingError && isSubmitted) {
            alert(bookingMessage)
            dispatch(resetBooking())
            setIsSubmitted(false) // Allow retrying
        }
    }, [bookingSuccess, bookingError, bookingMessage, isSubmitted, navigate, dispatch])

    // Price Calculation
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            if (diffDays > 0) {
                setDays(diffDays)
                setTotalPrice(diffDays * car.pricePerDay)
            } else {
                setDays(0)
                setTotalPrice(0)
            }
        }
    }, [startDate, endDate, car.pricePerDay])

    const onChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (!user) {
            navigate('/login')
        } else {
            // 3️⃣ NEW: Mark that we are submitting
            setIsSubmitted(true)
            dispatch(createBooking({
                carId: id,
                startDate,
                endDate,
                totalPrice
            }))
        }
    }

    if (carLoading || !car) {
        return <div className="text-center mt-20 text-2xl font-bold text-slate-400">Loading Car Details...</div>
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* LEFT COLUMN (Car Specs) */}
                <div>
                    <div className="rounded-xl overflow-hidden shadow-lg h-96 mb-6 bg-gray-100">
                        {car.images && car.images.length > 0 ? (
                            <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image Available</div>
                        )}
                    </div>

                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800">{car.make} {car.model}</h1>
                            <p className="text-gray-500 font-medium mt-1">{car.year} • {car.plateNumber}</p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-emerald-600">${car.pricePerDay}</span>
                            <span className="text-gray-500">/day</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                            <FaGasPump className="mx-auto text-slate-400 mb-2" />
                            <span className="font-semibold text-slate-700">{car.fuelType}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                            <FaCogs className="mx-auto text-slate-400 mb-2" />
                            <span className="font-semibold text-slate-700">{car.transmission}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg text-center border border-slate-100">
                            <FaChair className="mx-auto text-slate-400 mb-2" />
                            <span className="font-semibold text-slate-700">{car.seats} Seats</span>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-600">
                        <h3 className="text-xl font-bold text-slate-800 mb-3">Description</h3>
                        <p>{car.description}</p>
                    </div>
                </div>

                {/* RIGHT COLUMN (Booking Form) */}
                <div>
                    <div className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 sticky top-10">
                        <h3 className="text-2xl font-bold mb-6 text-slate-800">Book this Car</h3>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">From</label>
                                    <input type="date" name="startDate" value={startDate} onChange={onChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">To</label>
                                    <input type="date" name="endDate" value={endDate} onChange={onChange} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" required />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                <div className="flex justify-between mb-2 text-gray-600">
                                    <span>Rate per day</span>
                                    <span>${car.pricePerDay}</span>
                                </div>
                                <div className="flex justify-between mb-4 text-gray-600">
                                    <span>Duration</span>
                                    <span>{days} days</span>
                                </div>
                                <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-slate-800">Total Total</span>
                                    <span className="font-bold text-2xl text-slate-900">${totalPrice}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={days <= 0 || !user}
                                className={`w-full py-4 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2
                                    ${days > 0 ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg transform hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                            >
                                {user ? (days > 0 ? 'Confirm Booking' : 'Select Dates') : 'Login to Book'}
                                {days > 0 && <FaCheckCircle />}
                            </button>
                            {!user && <p className="text-center text-sm text-red-500">You must be logged in to book.</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CarDetails