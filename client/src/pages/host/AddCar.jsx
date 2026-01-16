import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createCar, reset } from '../../features/cars/carSlice'
import { FaCloudUploadAlt, FaCar, FaCogs, FaCheck, FaTimes, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa' // Cleaned unused icons
import Footer from '../../components/common/Footer'

function AddCar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { isLoading, isError, message } = useSelector((state) => state.cars)
    // We don't need 'isSuccess' here anymore because we handle it in onSubmit

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        transmission: 'Automatic',
        fuelType: 'Petrol',
        seats: 5,
        description: '',
        features: [],
        images: [],
        plateNumber: '',
        location: '',
    })

    const [previewImages, setPreviewImages] = useState([])

    // --- EFFECTS ---
    // Fix: Only handle Errors here. Success is handled in onSubmit.
    useEffect(() => {
        if (isError) {
            alert(message)
            dispatch(reset())
        }
        // Cleanup on unmount
        return () => { dispatch(reset()) }
    }, [isError, message, dispatch])

    // --- HANDLERS ---
    const onChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const onFeatureToggle = (feature) => {
        setFormData((prev) => {
            const exists = prev.features.includes(feature)
            return {
                ...prev,
                features: exists
                    ? prev.features.filter(f => f !== feature)
                    : [...prev.features, feature]
            }
        })
    }

    const onImageChange = (e) => {
        const files = Array.from(e.target.files)
        // 1. Store files for backend
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
        // 2. Create previews for UI
        const newPreviews = files.map(file => URL.createObjectURL(file))
        setPreviewImages((prev) => [...prev, ...newPreviews])
    }

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))
        setPreviewImages(prev => prev.filter((_, i) => i !== index))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const carData = new FormData()
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                formData.images.forEach(image => carData.append('images', image))
            } else if (key === 'features') {
                carData.append('features', JSON.stringify(formData.features))
            } else {
                carData.append(key, formData[key])
            }
        })

        // --- THE FIX: Handle Success Here ---
        dispatch(createCar(carData))
            .unwrap() // This allows us to catch success/fail directly
            .then(() => {
                alert('Car added successfully!')
                navigate('/host/dashboard') // Redirect immediately
            })
            .catch((error) => {
                // Errors are handled by the slice/useEffect, but we catch here to prevent crash
                console.error(error)
            })
    }

    // Options
    const featuresList = ['GPS', 'Bluetooth', 'AC', 'Sunroof', 'Heated Seats', 'Backup Camera', 'Autopilot']

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">

                {/* Header */}
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition mb-6">
                    <FaArrowLeft /> Cancel & Go Back
                </button>

                <div className="flex flex-col md:flex-row justify-between items-end mb-10">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">Add New Car</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">List your vehicle and start earning.</p>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEFT COL: CAR DETAILS --- */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Basic Info */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaCar className="text-emerald-500" /> Basic Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Make (Brand)</label>
                                    <input type="text" name="make" value={formData.make} onChange={onChange} placeholder="e.g. Toyota" className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Model</label>
                                    <input type="text" name="model" value={formData.model} onChange={onChange} placeholder="e.g. Camry SE" className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Year</label>
                                    <input type="number" name="year" value={formData.year} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Plate Number</label>
                                    <input
                                        type="text"
                                        name="plateNumber"
                                        value={formData.plateNumber}
                                        onChange={onChange}
                                        placeholder="e.g. KL-01-AB-1234"
                                        className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white border border-transparent focus:border-emerald-500 transition uppercase placeholder:normal-case"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Daily Price (₹)</label>
                                    <div className="relative">
                                        <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={onChange} placeholder="2500" className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-10 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition" required />
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><FaMapMarkerAlt /> Location</label>
                                    <input type="text" name="location" value={formData.location} onChange={onChange} placeholder="e.g. Kochi" className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl font-bold dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none" required />
                                </div>
                            </div>
                        </div>

                        {/* 2. Specs & Features */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaCogs className="text-emerald-500" /> Specs & Features
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Transmission</label>
                                    <div className="flex gap-2">
                                        {['Automatic', 'Manual'].map(type => (
                                            <button
                                                type="button"
                                                key={type}
                                                onClick={() => setFormData({ ...formData, transmission: type })}
                                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${formData.transmission === type ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent' : 'bg-transparent text-gray-500 border-gray-200 dark:border-slate-700'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fuel Type</label>
                                    <select name="fuelType" value={formData.fuelType} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-bold text-slate-900 dark:text-white focus:outline-none text-sm">
                                        <option>Petrol</option>
                                        <option>Diesel</option>
                                        <option>Electric</option>
                                        <option>Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Seats</label>
                                    <input type="number" name="seats" value={formData.seats} onChange={onChange} className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 font-bold text-slate-900 dark:text-white focus:outline-none text-sm" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Features</label>
                                <div className="flex flex-wrap gap-2">
                                    {featuresList.map(feature => (
                                        <button
                                            type="button"
                                            key={feature}
                                            onClick={() => onFeatureToggle(feature)}
                                            className={`px-4 py-2 rounded-full text-xs font-bold border transition flex items-center gap-2
                                            ${formData.features.includes(feature)
                                                    ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                                                    : 'bg-transparent text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-emerald-400'}`}
                                        >
                                            {formData.features.includes(feature) && <FaCheck />} {feature}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                                <textarea name="description" value={formData.description} onChange={onChange} rows="4" placeholder="Tell us about your car..." className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT COL: IMAGES --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-gray-100 dark:border-slate-800 sticky top-24 transition-colors">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <FaCloudUploadAlt className="text-emerald-500" /> Car Images
                            </h3>

                            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-400 transition mb-6 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-emerald-500">
                                    <FaCloudUploadAlt className="text-3xl mb-2" />
                                    <p className="text-xs font-bold uppercase tracking-wide">Click to upload</p>
                                </div>
                                <input type="file" className="hidden" multiple accept="image/*" onChange={onImageChange} />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                {previewImages.map((img, index) => (
                                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-video border border-gray-100 dark:border-slate-700">
                                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition shadow-sm"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-lg hover:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-lg flex items-center justify-center gap-2"
                            >
                                {isLoading ? 'Publishing...' : 'Publish Car'} <FaArrowLeft className="rotate-180" />
                            </button>
                        </div>
                    </div>

                </form>
            </div>
            <div className="mt-20 px-6">
                <Footer />
            </div>
        </div>
    )
}

export default AddCar