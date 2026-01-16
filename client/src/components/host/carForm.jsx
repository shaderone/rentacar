import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { MdClose, MdCloudUpload } from 'react-icons/md' // Added Upload Icon for better UI
import { createCar } from '../../features/cars/carSlice'

function CarForm() {
    const [form, setForm] = useState({
        make: '',
        model: '',
        year: '',
        plateNumber: '',
        pricePerDay: '',
        fuelType: '',
        transmission: '',
        seats: '',
        description: '',
    })
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)

    const dispatch = useDispatch()

    const onChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    // 🚀 IMPROVED: Accumulate files instead of replacing them
    const onFilesChange = (e) => {
        const selected = Array.from(e.target.files || [])

        // Validation: Limit to 5 images total
        if (files.length + selected.length > 5) {
            alert('Maximum 5 images allowed')
            return
        }

        setFiles((prev) => [...prev, ...selected])

        // Reset input so user can select more files immediately
        e.target.value = ''
    }

    const removeFile = (indexToRemove) => {
        setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        if (files.length === 0) {
            alert('Please upload at least one image')
            return
        }

        const data = new FormData()
        // Append all text fields
        Object.keys(form).forEach(key => data.append(key, form[key]))

        // Append images (Matches backend: upload.array('images', 5))
        files.forEach((file) => data.append('images', file))

        dispatch(createCar(data))

        // Reset Form
        setForm({
            make: '', model: '', year: '', plateNumber: '', pricePerDay: '',
            fuelType: '', transmission: '', seats: '', description: '',
        })
        setFiles([])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <section className="my-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
                <MdCloudUpload className="text-2xl" /> Add a New Car
            </h3>

            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Standard Inputs */}
                    <input type="text" name="make" value={form.make} onChange={onChange} placeholder="Make" className="w-full p-2 border rounded" required />
                    <input type="text" name="model" value={form.model} onChange={onChange} placeholder="Model" className="w-full p-2 border rounded" required />
                    <input type="number" name="year" value={form.year} onChange={onChange} placeholder="Year" className="w-full p-2 border rounded" required />
                    <input type="text" name="plateNumber" value={form.plateNumber} onChange={onChange} placeholder="Plate Number" className="w-full p-2 border rounded" required />
                    <input type="number" name="pricePerDay" value={form.pricePerDay} onChange={onChange} placeholder="Price per Day" className="w-full p-2 border rounded" required />
                    <input type="number" name="seats" value={form.seats} onChange={onChange} placeholder="Seats" className="w-full p-2 border rounded" required />

                    <select name="fuelType" value={form.fuelType} onChange={onChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>Select Fuel Type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                    </select>

                    <select name="transmission" value={form.transmission} onChange={onChange} className="w-full p-2 border rounded bg-white" required>
                        <option value="" disabled>Select Transmission</option>
                        <option value="Manual">Manual</option>
                        <option value="Automatic">Automatic</option>
                    </select>
                </div>

                {/* 📂 MULTIPLE FILE INPUT */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                    <label className="cursor-pointer block">
                        <span className="block font-medium text-gray-700 mb-1">Car Images (Max 5)</span>
                        <span className="text-xs text-gray-500 mb-3 block">Supported: JPG, PNG, JPEG</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple // ✅ Allows multiple selection
                            onChange={onFilesChange}
                            className="hidden" // Hiding the ugly default input
                            accept="image/*"
                        />
                        <span className="inline-block bg-slate-200 text-slate-800 px-4 py-2 rounded text-sm font-semibold hover:bg-slate-300 transition">
                            Choose Files
                        </span>
                    </label>

                    {/* Image Previews */}
                    {files.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {files.map((file, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm">
                                        <span className="max-w-25 truncate">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                            title="Remove"
                                        >
                                            <MdClose />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <textarea
                    name="description"
                    value={form.description}
                    onChange={onChange}
                    placeholder="Description"
                    className="w-full p-2 border rounded"
                    rows={4}
                    required
                />

                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white font-bold rounded hover:bg-slate-700 transition shadow-lg"
                >
                    Add Car to Fleet
                </button>
            </form>
        </section>
    )
}

export default CarForm