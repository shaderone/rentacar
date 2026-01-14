import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { createBooking } from '../features/booking/bookingSlice'
import { FaArrowLeft, FaInfoCircle } from 'react-icons/fa'

function BookingConfirmation() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const { user } = useSelector((state) => state.auth)

    // Retrieve data passed from CarDetails page
    const { car, startDate, endDate, days, totalPrice } = location.state || {}

    const [isProcessing, setIsProcessing] = useState(false)

    // Security Deposit & Tax Config (Mock Data)
    const securityDeposit = 5000
    const taxRate = 0.18 // 18% GST
    const basePrice = days * (car?.pricePerDay || 0)
    const taxAmount = Math.round(basePrice * taxRate)
    const finalTotal = basePrice + securityDeposit + taxAmount

    // Redirect if accessed directly without state
    useEffect(() => {
        if (!location.state || !user) {
            navigate('/')
        }
    }, [location.state, user, navigate])

    const handleReserve = () => {
        setIsProcessing(true)

        // Dispatch booking action
        // Note: In a real app, you'd handle the Promise resolution here
        dispatch(createBooking({
            carId: car._id,
            startDate,
            endDate,
            totalPrice: finalTotal
        }))

        // Simulate network delay for effect, then go to Success Page
        setTimeout(() => {
            navigate('/booking-success', {
                state: {
                    referenceId: 'BK-' + Math.floor(1000 + Math.random() * 9000),
                    car,
                    startDate,
                    endDate
                }
            })
        }, 1500)
    }

    if (!car) return null

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 px-6 pt-8 pb-20 transition-colors duration-300">

            <div className="app-container">

                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-8"
                >
                    <FaArrowLeft /> Back to Car
                </button>

                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">
                    confirm & Reserve
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* --- LEFT COLUMN: CAR PREVIEW --- */}
                    <div>
                        {/* Image Placeholder/Container matching screenshot */}
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-3xl aspect-4/3 w-full mb-6 overflow-hidden relative">
                            {car.images?.[0] ? (
                                <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">No Image</div>
                            )}
                        </div>

                        {/* Car Details */}
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            {car.make} {car.model}
                        </h2>

                        {/* Date Range Display */}
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
                            {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            <span className="ml-2 text-slate-400">({days} Days)</span>
                        </p>

                        {/* Attribute Pills */}
                        <div className="flex gap-3">
                            <span className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                {car.transmission || 'Manual'}
                            </span>
                            <span className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                5 Seats
                            </span>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: SUMMARY & ACTION --- */}
                    <div className="flex flex-col gap-6">

                        {/* Yellow Info Box */}
                        <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
                            <FaInfoCircle className="text-amber-600 mt-1 shrink-0" />
                            <p className="text-sm font-bold text-amber-900">
                                Response time: usually 1 hour. We’ll Notify you.
                            </p>
                        </div>

                        {/* Price Details Box */}
                        <div className="bg-gray-100 dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800">
                            <h3 className="font-black text-lg text-slate-900 dark:text-white mb-6 uppercase tracking-wide">
                                Price Details
                            </h3>

                            <div className="space-y-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <span>₹{car.pricePerDay} × {days} days</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{basePrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Security deposit (refundable)</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{securityDeposit}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Taxes (18% GST)</span>
                                    <span className="font-bold text-slate-900 dark:text-white">₹{taxAmount}</span>
                                </div>
                            </div>

                            <div className="my-6 border-t border-gray-300 dark:border-slate-700"></div>

                            <div className="flex justify-between items-center">
                                <span className="font-black text-xl text-slate-900 dark:text-white">TOTAL</span>
                                <span className="font-black text-2xl text-slate-900 dark:text-white">₹{finalTotal}</span>
                            </div>
                        </div>

                        {/* Reserve Button */}
                        <button
                            onClick={handleReserve}
                            disabled={isProcessing}
                            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-slate-900 py-4 rounded-xl font-black text-lg tracking-wide uppercase transition-all shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing...' : 'Reserve Now'}
                        </button>

                        <p className="text-center text-xs text-slate-400 font-medium">
                            You won't be charged yet.
                        </p>

                    </div>

                </div>
            </div>
        </div>
    )
}

export default BookingConfirmation