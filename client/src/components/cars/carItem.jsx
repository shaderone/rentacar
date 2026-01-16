import { Link } from 'react-router-dom'

function CarItem({ car }) {
    return (
        <div className='car bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300'>
            <div className="h-48 overflow-hidden">
                {Array.isArray(car.images) && car.images.length > 0 ? (
                    <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>
            <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {car.make} {car.model}
                    </h2>
                    {(car.pricePerDay ?? car.price) !== undefined && (
                        <span className="text-sm font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
                            ${car.pricePerDay ?? car.price}/day
                        </span>
                    )}
                </div>
                <div className="text-sm text-gray-600 mb-3">Year: {car.year}</div>
                <div className="flex gap-2 mb-3">
                    {car.fuelType && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{car.fuelType}</span>
                    )}
                    {car.transmission && (
                        <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">{car.transmission}</span>
                    )}
                </div>
                {car.description && (
                    <p className="text-gray-600 text-sm line-clamp-3">{car.description}</p>
                )}
            </div>
            <Link to={`/car/${car._id}`} className="block w-full text-center bg-slate-900 text-white py-2 rounded hover:bg-slate-700 transition">
                View Details
            </Link>
        </div>
    )
}

export default CarItem