import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getCar, updateCar, reset } from '../../features/cars/carSlice'
import { FaSave, FaArrowLeft, FaCar, FaMapMarkerAlt, FaIdCard, FaCamera, FaCogs, FaPlus, FaTimes, FaListUl, FaTrash } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function EditCar() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { car, isLoading, isError, message } = useSelector((state) => state.cars)

    // Form State
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', pricePerDay: '',
        transmission: '', fuelType: '', seats: '', description: '',
        location: '', plateNumber: '', features: []
    })
    const [featureInput, setFeatureInput] = useState('')

    // Image Handling State
    const [newFiles, setNewFiles] = useState([]) // Stores the actual File objects
    const [newPreviews, setNewPreviews] = useState([]) // Stores the URL strings for preview

    // 1. Clean & Load
    useEffect(() => {
        dispatch(reset())
        dispatch(getCar(id))
        return () => { dispatch(reset()) }
    }, [dispatch, id])

    // 2. Populate
    useEffect(() => {
        if (car && car._id === id) {
            setFormData({
                make: car.make || '',
                model: car.model || '',
                year: car.year || '',
                pricePerDay: car.pricePerDay || '',
                transmission: car.transmission || 'Automatic',
                fuelType: car.fuelType || 'Petrol',
                seats: car.seats || 5,
                description: car.description || '',
                location: car.location || '',
                plateNumber: car.plateNumber || '',
                features: car.features || []
            })
        }
    }, [car, id])

    // 3. Errors
    useEffect(() => {
        if (isError) {
            alert(message)
            dispatch(reset())
        }
    }, [isError, message, dispatch])

    // --- HANDLERS ---
    const onChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

    // Feature Handlers
    const handleAddFeature = (e) => {
        e.preventDefault()
        if (featureInput.trim()) {
            setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }))
            setFeatureInput('')
        }
    }
    const handleRemoveFeature = (index) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
    }

    // Image Handlers
    const onFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 5) return alert("Maximum 5 images allowed")

        setNewFiles(files) // Store files for upload

        // Generate previews
        const previewUrls = files.map(file => URL.createObjectURL(file))
        setNewPreviews(previewUrls)
    }

    const clearNewImages = () => {
        setNewFiles([])
        setNewPreviews([])
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const updateData = new FormData()
        Object.keys(formData).forEach(key => {
            if (key === 'features') {
                updateData.append('features', JSON.stringify(formData.features))
            } else {
                updateData.append(key, formData[key])
            }
        })

        // Only append images if user actually selected new ones
        if (newFiles.length > 0) {
            newFiles.forEach(file => {
                updateData.append('images', file)
            })
        }

        dispatch(updateCar({ id, carData: updateData }))
            .unwrap()
            .then(() => {
                alert("Car Updated Successfully!")
                navigate('/host/my-fleet')
            })
            .catch((err) => console.error(err))
    }

    if (isLoading && !car.make) return <div className="text-center py-20 font-bold text-gray-400 animate-pulse">Loading...</div>

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">
                <button onClick={() => navigate('/host/my-fleet')} className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 mb-6 hover:text-emerald-500 transition">
                    <FaArrowLeft /> Back to Fleet
                </button>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-10">Edit Car</h1>

                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Basic Info */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2"><FaCar className="text-emerald-500" /> Basic Info</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Inputs... (Same as before) */}
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Make</label><input type="text" name="make" value={formData.make} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Model</label><input type="text" name="model" value={formData.model} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Plate</label><input type="text" name="plateNumber" value={formData.plateNumber} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white uppercase outline-none" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Year</label><input type="number" name="year" value={formData.year} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Price</label><input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" /></div>
                                <div><label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Location</label><input type="text" name="location" value={formData.location} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" /></div>
                            </div>
                        </div>

                        {/* Features (Added Back) */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2"><FaListUl className="text-emerald-500" /> Features</h3>
                            <div className="flex gap-2 mb-4">
                                <input type="text" value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add feature..." className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white outline-none" onKeyDown={(e) => e.key === 'Enter' && handleAddFeature(e)} />
                                <button onClick={handleAddFeature} className="bg-emerald-600 text-white px-6 rounded-xl font-bold"><FaPlus /></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.features.map((f, i) => (
                                    <span key={i} className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">{f} <button onClick={(e) => { e.preventDefault(); handleRemoveFeature(i) }} className="hover:text-red-500"><FaTimes size={12} /></button></span>
                                ))}
                            </div>
                        </div>

                        {/* --- NEW IMAGE LOGIC --- */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-gray-100 dark:border-slate-800 shadow-sm">
                            <h3 className="font-black text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-2"><FaCamera className="text-blue-500" /> Update Images</h3>

                            {/* CASE A: New Images Selected */}
                            {newPreviews.length > 0 ? (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="text-xs font-bold text-emerald-500 uppercase">Pending Upload (Will Replace Old)</p>
                                        <button type="button" onClick={clearNewImages} className="text-red-500 text-xs font-bold flex items-center gap-1"><FaTrash /> Clear Selection</button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {newPreviews.map((src, i) => (
                                            <img key={i} src={src} className="w-full h-24 object-cover rounded-xl border-2 border-emerald-500" alt="New" />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* CASE B: Show Current Images */
                                <div className="mb-6">
                                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Current Images</p>
                                    <div className="flex gap-2 overflow-x-auto">
                                        {car.images?.map((img, i) => (
                                            <img key={i} src={img} className="w-20 h-20 rounded-xl object-cover opacity-60 grayscale hover:grayscale-0 transition" alt="Current" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* The File Input */}
                            <label className="block w-full cursor-pointer">
                                <div className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center hover:border-emerald-500 transition">
                                    <span className="text-sm font-bold text-gray-500">Click to Select New Images</span>
                                    <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple files</p>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={onFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                    </div>

                    {/* Right Column (Actions) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl border border-gray-100 dark:border-slate-800 shadow-xl sticky top-24">
                            <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition"><FaSave /> Save Changes</button>
                        </div>
                    </div>

                </form>
            </div>
            <div className="mt-20 px-6"><Footer /></div>
        </div>
    )
}

export default EditCar