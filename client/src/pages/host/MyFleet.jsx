import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FaPlus, FaSearch, FaGasPump, FaCogs, FaEdit, FaTrash, FaEye } from 'react-icons/fa'
import Footer from '../../components/common/Footer'
import { getCars, deleteCar, reset } from '../../features/cars/carSlice'

function MyFleet() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    // 1. Get Car State AND User State (to filter cars)
    const { cars, isLoading, isError, message } = useSelector((state) => state.cars)
    const { user } = useSelector((state) => state.auth)

    // 2. Filter: Only show cars belonging to the logged-in user
    const myCars = cars.filter(car => {
        // MATCH BACKEND FIELD NAME: Use 'owner' instead of 'user'
        const carOwner = car.owner

        if (!carOwner || !user?._id) return false

        // Handle Object vs String
        const ownerIdString = typeof carOwner === 'object' ? carOwner._id : carOwner

        // Compare Strings
        return String(ownerIdString) === String(user._id)
    })

    // 3. CLEAN SLATE PROTOCOL (Fixes the alert bug)
    useEffect(() => {
        // If there was an error left over from another page, clear it first
        if (isError) {
            dispatch(reset())
        }

        dispatch(getCars())

        // RESET on Unmount: This ensures when you leave this page, 
        // the Redux state is wiped clean. No more ghost alerts!
        return () => {
            dispatch(reset())
        }
    }, [dispatch, isError])

    // 4. Handle Delete Errors specifically for this page
    useEffect(() => {
        if (isError) {
            alert(message)
            dispatch(reset()) // Clear immediately so it doesn't pile up
        }
    }, [isError, message, dispatch])

    // --- ACTIONS ---
    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this car? This cannot be undone.')) {
            dispatch(deleteCar(id))
        }
    }

    const handleEdit = (id) => {
        navigate(`/host/edit-car/${id}`)
    }

    const handleView = (id) => {
        navigate(`/car/${id}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10">
                    <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">Management</span>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-2">My Fleet</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
                            You have {myCars.length} vehicles listed.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/host/add-car')}
                        className="mt-4 md:mt-0 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition shadow-lg"
                    >
                        <FaPlus size={12} /> Add New Car
                    </button>
                </div>

                {/* --- SEARCH BAR --- */}
                <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center mb-10 shadow-sm max-w-md transition-colors">
                    <FaSearch className="ml-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your cars..."
                        className="w-full bg-transparent px-4 py-2 font-bold text-slate-900 dark:text-white focus:outline-none placeholder-gray-400"
                    />
                </div>

                {/* --- CAR GRID --- */}
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400 font-bold animate-pulse">Loading Fleet...</div>
                ) : myCars.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-gray-200 dark:border-slate-800">
                        <p className="text-gray-400 font-medium mb-4">You haven't added any cars yet.</p>
                        <button onClick={() => navigate('/host/add-car')} className="text-emerald-600 font-bold hover:underline">Add your first car</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCars.map((car) => (
                            <div key={car._id} className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group">

                                {/* Image & Status */}
                                <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl h-48 w-full mb-5 overflow-hidden relative">
                                    {car.images?.[0] ? (
                                        <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">NO IMG</div>
                                    )}
                                    <div className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase shadow-sm">
                                        Active
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                        <span className="text-emerald-600 dark:text-emerald-400">₹{car.pricePerDay}</span>
                                        <span className="text-gray-400 text-[10px]">/day</span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="px-2">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{car.make} {car.model}</h3>
                                    <div className="flex gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mb-6">
                                        <span className="flex items-center gap-1"><FaCogs className="text-emerald-500" /> {car.transmission}</span>
                                        <span className="flex items-center gap-1"><FaGasPump className="text-blue-500" /> {car.fuelType}</span>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-slate-800 pt-4">
                                        <button
                                            onClick={() => handleView(car._id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition"
                                        >
                                            <FaEye /> View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(car._id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(car._id)}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-20 px-6">
                <Footer />
            </div>
        </div>
    )
}

export default MyFleet