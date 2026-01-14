import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getCar } from '../features/cars/carSlice'
import { createBooking, reset as resetBooking } from '../features/booking/bookingSlice'
import { FaGasPump, FaCogs, FaTachometerAlt, FaBolt, FaStar, FaCalendarAlt, FaCheckCircle, FaUserCircle, FaArrowLeft } from 'react-icons/fa'
import Footer from '../components/Footer'

function CarDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // --- REDUX STATE ---
    const { car, isLoading, isError, message } = useSelector((state) => state.cars)
    const { user } = useSelector((state) => state.auth)
    const { isSuccess: bookingSuccess, isError: bookingError, message: bookingMessage } = useSelector((state) => state.bookings)

    // --- LOCAL STATE ---
    const [formData, setFormData] = useState({ startDate: '', endDate: '' })
    const { startDate, endDate } = formData
    const [totalPrice, setTotalPrice] = useState(0)
    const [days, setDays] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [activeImage, setActiveImage] = useState(0) // For switching main image

    // --- EFFECTS ---
    useEffect(() => { dispatch(resetBooking()) }, [dispatch])

    useEffect(() => {
        if (isError) alert(message)
        dispatch(getCar(id))
    }, [id, isError, message, dispatch])

    useEffect(() => {
        if (bookingSuccess && isSubmitted) {
            alert('Booking Successful!')
            dispatch(resetBooking())
            navigate('/mybookings')
        }
        if (bookingError && isSubmitted) {
            alert(bookingMessage)
            dispatch(resetBooking())
            setIsSubmitted(false)
        }
    }, [bookingSuccess, bookingError, bookingMessage, isSubmitted, navigate, dispatch])

    // Price Calculator
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

    // --- HANDLERS ---
    const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

    const onSubmit = (e) => {
        e.preventDefault()
        if (!user) {
            navigate('/login')
        } else {
            // --- CHANGE THIS SECTION ---
            navigate('/confirm-booking', {
                state: {
                    car,
                    startDate,
                    endDate,
                    days,
                    totalPrice // Base price (before tax/deposit)
                }
            })
            // ---------------------------
        }
    }

    if (isLoading || !car) {
        return <div className="min-h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse bg-slate-50 dark:bg-slate-950">Loading Car Details...</div>
    }

    const newLocal = "bg-slate-900 dark:bg-black rounded-3xl h-100 md:h-[500px] mb-4 overflow-hidden shadow-lg relative group border border-transparent dark:border-slate-800"
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-10 transition-colors duration-300">

            {/* Back Button */}
            <div className="app-container mx-auto px-4 pt-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition mb-6">
                    <FaArrowLeft /> BACK TO LISTING
                </button>
            </div>

            <div className="app-container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* === LEFT COLUMN (IMAGES & INFO) === */}
                <div className="lg:col-span-2">

                    {/* Main Image Stage */}
                    <div className={newLocal}>
                        {car.images && car.images.length > 0 ? (
                            <img src={car.images[activeImage]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 font-bold">No Image Available</div>
                        )}
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
                        {car.images?.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveImage(index)}
                                className={`w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 ${activeImage === index ? 'border-emerald-600 opacity-100 scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="thumb" />
                            </button>
                        ))}
                    </div>

                    {/* Title & Specs Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-8 shadow-sm border border-gray-100 dark:border-slate-800 mb-10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">{car.make} {car.model}</h1>
                                <div className="flex items-center gap-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wide border border-gray-200 dark:border-slate-700">{car.transmission}</span>
                                    <span className="bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase text-xs font-bold tracking-wide border border-gray-200 dark:border-slate-700">{car.fuelType}</span>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <FaStar /> <span className="text-slate-900 dark:text-white font-bold">4.8</span> (124 reviews)
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                            {car.description || "Experience the perfect blend of comfort and performance. This vehicle offers a smooth ride, ample legroom, and advanced safety features, making it ideal for both city commuting and long highway drives."}
                        </p>

                        {/* Specs Grid (The 4 Boxes) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                                <FaGasPump className="text-2xl text-slate-400 dark:text-slate-500 mb-2" />
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Fuel Type</span>
                                <span className="font-bold text-slate-900 dark:text-white">{car.fuelType}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                                <FaCogs className="text-2xl text-slate-400 dark:text-slate-500 mb-2" />
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Gearbox</span>
                                <span className="font-bold text-slate-900 dark:text-white">{car.transmission}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                                <FaTachometerAlt className="text-2xl text-slate-400 dark:text-slate-500 mb-2" />
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Mileage</span>
                                <span className="font-bold text-slate-900 dark:text-white">18KM/L</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 flex flex-col items-center text-center transition-colors">
                                <FaBolt className="text-2xl text-slate-400 dark:text-slate-500 mb-2" />
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Top Speed</span>
                                <span className="font-bold text-slate-900 dark:text-white">211 KMPH</span>
                            </div>
                        </div>
                    </div>

                    {/* Booking Procedure Visual */}
                    <div className="mb-10">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6">Booking Procedure</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { id: 1, title: 'Verify Identity', desc: "Upload your driver's license at checkout." },
                                { id: 2, title: 'Security Deposit', desc: "A refundable hold is placed on your card." },
                                { id: 3, title: 'Key Handoff', desc: "Meet the dealer at the designated spot." },
                            ].map((step) => (
                                <div key={step.id} className="bg-gray-100 dark:bg-slate-900 rounded-2xl p-6 relative overflow-hidden group hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition duration-300 border border-transparent dark:border-slate-800 hover:border-gray-200">
                                    <div className="absolute -right-4 -top-4 text-9xl font-black text-gray-200 dark:text-slate-800 opacity-50 select-none group-hover:text-emerald-100 dark:group-hover:text-emerald-900/20 transition">{step.id}</div>
                                    <div className="relative z-10">
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center font-bold text-sm mb-3 text-slate-900 dark:text-white">
                                            {step.id}
                                        </div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{step.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Reviews */}
                    <div className="mb-20">
                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6">User Reviews</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex gap-4 transition-colors">
                                    <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                        <FaUserCircle className="text-gray-400 dark:text-gray-600 text-3xl" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <h5 className="font-bold text-slate-900 dark:text-white">Alex Johnson</h5>
                                            <div className="flex text-yellow-400 text-xs gap-0.5">
                                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            "Car was clean and drove perfectly. The host was very responsive. Highly recommend for a weekend trip!"
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>


                {/* === RIGHT COLUMN (STICKY BOOKING WIDGET) === */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-4xl p-6 shadow-xl border border-gray-100 dark:border-slate-800 sticky top-24 transition-colors">

                        <div className="flex justify-between items-end mb-6">
                            <div className="text-3xl font-black text-slate-900 dark:text-white">
                                ₹{car.pricePerDay} <span className="text-base text-gray-400 font-medium">/day</span>
                            </div>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4">

                            {/* Date Inputs */}
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4 transition-colors">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">PICK-UP</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500">
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={startDate}
                                            onChange={onChange}
                                            className="w-full bg-transparent font-bold text-sm text-slate-900 dark:text-white outline-none dark:invert"
                                            required
                                        />
                                        <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-slate-700"></div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">DROP-OFF</label>
                                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-emerald-500">
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={endDate}
                                            onChange={onChange}
                                            className="w-full bg-transparent font-bold text-sm text-slate-900 dark:text-white outline-none dark:invert"
                                            required
                                        />
                                        <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Total Summary (Only shows if dates selected) */}
                            {days > 0 && (
                                <div className="py-4 space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>₹{car.pricePerDay} x {days} days</span>
                                        <span>₹{car.pricePerDay * days}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Service Fee</span>
                                        <span>₹500</span>
                                    </div>
                                    <div className="border-t border-dashed border-gray-300 dark:border-slate-700 my-2"></div>
                                    <div className="flex justify-between text-lg font-black text-slate-900 dark:text-white">
                                        <span>Total</span>
                                        <span>₹{totalPrice + 500}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={days <= 0 || !user}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg
                                    ${days > 0
                                        ? 'bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:shadow-emerald-500/30 hover:-translate-y-1'
                                        : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'}`}
                            >
                                {user ? (days > 0 ? 'Reserve Now' : 'Select Dates') : 'Login to Book'}
                            </button>

                            {!user && <p className="text-center text-xs text-red-500 font-bold">Please login to continue</p>}
                        </form>

                    </div>
                </div>

            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    )
}

export default CarDetails