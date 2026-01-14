import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getCars } from '../features/cars/carSlice'
import { FaHeart, FaSearch, FaChevronLeft, FaChevronRight, FaSlidersH, FaUndo } from 'react-icons/fa'
import Footer from '../components/Footer'

function AllCars() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { cars, isLoading, isError, message } = useSelector((state) => state.cars)

    // --- LOCAL STATE ---
    const [priceRange, setPriceRange] = useState(25000)
    const [selectedTransmission, setSelectedTransmission] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const carsPerPage = 6

    useEffect(() => {
        if (isError) console.log(message)
        dispatch(getCars())
    }, [dispatch, isError, message])

    // --- FILTER LOGIC ---
    const filteredCars = cars.filter((car) => {
        const matchPrice = car.pricePerDay <= priceRange
        const matchTrans = selectedTransmission.length === 0 || selectedTransmission.includes(car.transmission)
        const matchSearch =
            car.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            car.model.toLowerCase().includes(searchQuery.toLowerCase())
        return matchPrice && matchTrans && matchSearch
    })

    // --- PAGINATION ---
    const indexOfLastCar = currentPage * carsPerPage
    const indexOfFirstCar = indexOfLastCar - carsPerPage
    const currentCars = filteredCars.slice(indexOfFirstCar, indexOfLastCar)
    const totalPages = Math.ceil(filteredCars.length / carsPerPage)

    const paginate = (pageNumber) => setCurrentPage(pageNumber)

    const toggleTransmission = (type) => {
        setSelectedTransmission(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        )
        setCurrentPage(1)
    }

    const resetFilters = () => {
        setPriceRange(25000)
        setSelectedTransmission([])
        setSearchQuery('')
        setCurrentPage(1)
    }

    return (
        // 1. OUTER CONTAINER: Fixed height (Screen - Header), No Window Scroll
        <div className="h-[calc(100vh-120px)] bg-white dark:bg-slate-950 app-container mx-auto flex overflow-hidden transition-colors duration-300">

            {/* === SIDEBAR (FIXED) === */}
            <aside className="w-80 h-full shrink-0 border-r border-gray-100 dark:border-slate-800 p-6 overflow-y-auto hidden lg:block custom-scrollbar transition-colors">

                <div className="flex justify-between items-center mb-8 sticky top-0 bg-white dark:bg-slate-950 z-10 py-2 transition-colors">
                    <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <FaSlidersH className="text-emerald-600" /> Filters
                    </h3>
                    <button onClick={resetFilters} className="text-xs font-bold text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition">
                        <FaUndo /> Reset
                    </button>
                </div>

                {/* Price Range */}
                <div className="mb-10">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
                        Max Price: <span className="text-emerald-600 dark:text-emerald-400">₹{priceRange}/day</span>
                    </label>
                    <input
                        type="range"
                        min="500"
                        max="25000"
                        step="500"
                        value={priceRange}
                        onChange={(e) => setPriceRange(Number(e.target.value))}
                        className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 font-bold mt-2">
                        <span>₹500</span>
                        <span>₹25k+</span>
                    </div>
                </div>

                {/* Transmission */}
                <div className="mb-10">
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Transmission</label>
                    <div className="flex flex-col gap-3">
                        {['Automatic', 'Manual'].map((type) => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group select-none">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
                            ${selectedTransmission.includes(type)
                                        ? 'bg-emerald-600 border-emerald-600'
                                        : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-emerald-400 dark:group-hover:border-emerald-500'}`}>
                                    {selectedTransmission.includes(type) && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={selectedTransmission.includes(type)}
                                    onChange={() => toggleTransmission(type)}
                                />
                                <span className={`text-sm font-bold transition ${selectedTransmission.includes(type) ? 'text-slate-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Car Type (Mock) */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Car Type</label>
                    <div className="flex flex-wrap gap-2">
                        {['SUV', 'Sedan', 'Hatchback', 'Coupe', 'Luxury'].map((cat) => (
                            <button key={cat} className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-xs font-bold text-gray-500 dark:text-gray-400 hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 transition">
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>


            {/* === MAIN CONTENT (SCROLLABLE) === */}
            <main className="flex-1 h-full overflow-y-auto p-6 scroll-smooth">

                {/* Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 mb-8 border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20 shadow-sm backdrop-blur-md transition-colors">
                    <div className="relative w-full md:w-96">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search cars..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-3 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition border-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                    </div>
                    <div className="pr-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        Found <span className="text-emerald-600 dark:text-emerald-400 text-sm">{filteredCars.length}</span> results
                    </div>
                </div>

                {/* Cars Grid */}
                {isLoading ? (
                    <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Loading Inventory...</div>
                ) : filteredCars.length === 0 ? (
                    <div className="text-center py-20 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800 transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No cars match your criteria</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Try resetting filters or changing the price range.</p>
                        <button onClick={resetFilters} className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold hover:underline">Clear Filters</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                        {currentCars.map((car) => (
                            <div key={car._id} className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => navigate(`/car/${car._id}`)}>
                                {/* Image */}
                                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl h-48 w-full mb-4 overflow-hidden relative">
                                    {car.images?.[0] ? (
                                        <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">NO IMAGE</div>
                                    )}
                                    <div className="absolute top-3 right-3 w-8 h-8 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white transition shadow-sm">
                                        <FaHeart size={12} />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-2 pb-2">
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{car.make} {car.model}</h3>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg">₹{car.pricePerDay}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <span className="text-[10px] font-bold uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">{car.transmission}</span>
                                        <span className="text-[10px] font-bold uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">{car.fuelType}</span>
                                        <span className="text-[10px] font-bold uppercase bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">{car.year}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mb-12">
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                        >
                            <FaChevronLeft size={12} />
                        </button>

                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition"
                        >
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                )}

                {/* Footer inside scroll area so it appears at the bottom of the list */}
                <div className="mt-auto pt-10">
                    <Footer />
                </div>
            </main>
        </div>
    )
}

export default AllCars