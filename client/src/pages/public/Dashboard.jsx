import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { getCars } from '../../features/cars/carSlice'
import { FaArrowRight, FaHeart, FaCalendarCheck, FaCarSide, FaKey, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function Dashboard() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { cars, isLoading, isError, message } = useSelector((state) => state.cars)

    // --- 1. LOCAL STATE FOR SEARCH ---
    const [location, setLocation] = useState('')
    const [dates, setDates] = useState({ start: '', end: '' })

    useEffect(() => {
        if (isError) console.log(message)
        dispatch(getCars())
    }, [isError, message, dispatch])

    // --- 2. EXTRACT UNIQUE LOCATIONS FROM DB ---
    // This looks at all your cars and finds the unique cities
    const uniqueLocations = [...new Set(cars.map(car => car.location))].filter(Boolean)

    // --- 3. HANDLE SEARCH ---
    const handleSearch = () => {
        // Redirect to /all-cars with query params
        const queryParams = new URLSearchParams({
            location: location,
            start: dates.start,
            end: dates.end
        }).toString()

        navigate(`/all-cars?${queryParams}`)
    }

    // Get top 4 cars for display
    const featuredCars = cars.slice(0, 4)

    return (
        <div className="pb-10 min-h-screen transition-colors duration-300">

            {/* --- HERO SECTION --- */}
            <div className="relative app-container mx-auto mb-40 mt-6">

                {/* Main Hero Card */}
                {/* Added dark:border-slate-800 for better separation in dark mode */}
                <div className="bg-slate-900 rounded-3xl h-150 md:h-137.5 flex flex-col items-center justify-center text-center p-6 text-white relative z-0 overflow-hidden shadow-2xl dark:border dark:border-slate-800">

                    {/* Abstract Gradient Background */}
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 z-0"></div>

                    {/* Decorative Glow Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

                    {/* Content */}
                    <div className="relative z-10 max-w-3xl mx-auto">

                        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                            Drive the <br /> <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-teal-200">Extraordinary.</span>
                        </h1>
                        <p className="text-slate-400 max-w-lg mx-auto text-lg md:text-xl font-medium leading-relaxed">
                            Unlock a fleet of premium vehicles for your next journey. Experience comfort and performance like never before.
                        </p>
                    </div>
                </div>

                {/* --- FLOATING SEARCH BAR (UPDATED) --- */}
                <div className="absolute -bottom-20 left-0 right-0 px-4 z-20">
                    <div className="max-w-5xl mx-auto bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-slate-700 flex flex-col lg:flex-row gap-3 items-center transition-colors duration-300">

                        {/* Location Input (Dynamic) */}
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-full px-8 py-5 w-full shadow-sm border border-gray-100 dark:border-slate-700 group cursor-pointer hover:shadow-md transition-all">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide group-hover:text-emerald-600 transition">
                                <FaMapMarkerAlt /> Location
                            </label>
                            <select
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-transparent font-bold text-slate-800 dark:text-white text-lg focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="" className="dark:bg-slate-800">All Locations</option>
                                {uniqueLocations.length > 0 ? (
                                    uniqueLocations.map((loc, index) => (
                                        <option key={index} value={loc} className="dark:bg-slate-800">{loc}</option>
                                    ))
                                ) : (
                                    // Fallback if no cars have locations yet
                                    <>
                                        <option value="Kochi" className="dark:bg-slate-800">Kochi</option>
                                        <option value="Bangalore" className="dark:bg-slate-800">Bangalore</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Pick-up Date */}
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-full px-8 py-5 w-full shadow-sm border border-gray-100 dark:border-slate-700 group hover:shadow-md transition-all">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide group-hover:text-emerald-600 transition">
                                <FaCalendarAlt /> Pick-up Date
                            </label>
                            <input
                                type="date"
                                value={dates.start}
                                onChange={(e) => setDates({ ...dates, start: e.target.value })}
                                // Removed 'dark:invert', added 'dark:[color-scheme:dark]'
                                className="w-full bg-transparent font-bold text-slate-800 dark:text-white text-lg focus:outline-none font-sans dark:[color-scheme:dark]"
                            />
                        </div>

                        {/* Drop-off Date */}
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-full px-8 py-5 w-full shadow-sm border border-gray-100 dark:border-slate-700 group hover:shadow-md transition-all">
                            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide group-hover:text-emerald-600 transition">
                                <FaCalendarAlt /> Drop-off Date
                            </label>
                            <input
                                type="date"
                                value={dates.end}
                                onChange={(e) => setDates({ ...dates, end: e.target.value })}
                                // Removed 'dark:invert', added 'dark:[color-scheme:dark]'
                                className="w-full bg-transparent font-bold text-slate-800 dark:text-white text-lg focus:outline-none font-sans dark:[color-scheme:dark]"
                            />
                        </div>

                        {/* Search Button (With Handler) */}
                        <button
                            onClick={handleSearch}
                            className="w-full lg:w-24 h-20 rounded-4xl bg-slate-900 dark:bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-600 dark:hover:bg-emerald-500 transition duration-300 shadow-lg shadow-slate-900/20 group"
                        >
                            <FaArrowRight size={24} className="group-hover:-rotate-45 transition duration-300" />
                        </button>

                    </div>
                </div>
            </div>

            {/* --- FEATURED CARS --- */}
            <div className="app-container mx-auto mt-32 px-2">
                <div className="flex justify-between items-end mb-10">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">
                        Featured <span className="text-emerald-600 dark:text-emerald-400">Cars</span>
                    </h2>
                    <button onClick={() => navigate('/all-cars')} className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-slate-300 hover:translate-x-1 transition hover:text-emerald-600 dark:hover:text-emerald-400">
                        View all fleet <FaArrowRight />
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading fleet...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredCars.map((car) => (
                            // Car Card
                            <div key={car._id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group" onClick={() => navigate(`/car/${car._id}`)}>

                                {/* Image Area */}
                                <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl h-52 w-full mb-5 overflow-hidden relative">
                                    {car.images?.[0] ? (
                                        <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold tracking-widest">NO IMAGE</div>
                                    )}

                                    {/* Price Tag Overlay */}
                                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-baseline gap-1">
                                        <span className="text-emerald-600 dark:text-emerald-400 text-lg">${car.pricePerDay}</span>
                                        <span className="text-gray-400 text-xs font-medium">/day</span>
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="px-2 pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-tight mb-1">{car.make} {car.model}</h3>
                                            <p className="text-xs text-gray-400 font-medium">{car.year} Model</p>
                                        </div>
                                        <button className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-slate-700 dark:hover:text-red-400 transition shadow-sm">
                                            <FaHeart />
                                        </button>
                                    </div>

                                    {/* Specs Pills */}
                                    <div className="flex gap-2 mt-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {car.transmission}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {car.fuelType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- HOW IT WORKS --- */}
            <div className="app-container mx-auto mt-32 bg-slate-50 dark:bg-slate-900 rounded-[3rem] px-6 py-16 md:px-16 text-center mb-10 border border-slate-100 dark:border-slate-800 relative overflow-hidden transition-colors">

                {/* Decorative Blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-16 uppercase tracking-tight relative z-10">
                    How it <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Works</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4 relative z-10">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-24 h-24 bg-linear-to-br from-slate-800 to-black rounded-3xl shadow-xl mb-8 flex items-center justify-center transform group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-slate-700">
                            <FaCalendarCheck className="text-emerald-400 text-4xl drop-shadow-md" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xl">1. Choose Date</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-50 leading-relaxed font-medium">
                            Select your pickup and return dates easily.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-24 h-24 bg-linear-to-br from-slate-800 to-black rounded-3xl shadow-xl mb-8 flex items-center justify-center transform group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-slate-700 delay-100">
                            <FaCarSide className="text-emerald-400 text-4xl drop-shadow-md" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xl">2. Pick Car</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-50 leading-relaxed font-medium">
                            Choose from our premium fleet of vehicles.
                        </p>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center group">
                        <div className="w-24 h-24 bg-linear-to-br from-slate-800 to-black rounded-3xl shadow-xl mb-8 flex items-center justify-center transform group-hover:-translate-y-2 group-hover:shadow-2xl transition-all duration-300 border border-slate-700 delay-200">
                            <FaKey className="text-emerald-400 text-3xl drop-shadow-md" />
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xl">3. Book & Go</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-50 leading-relaxed font-medium">
                            Instant confirmation. Start your journey.
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Dashboard