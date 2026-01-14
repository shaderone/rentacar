import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import CarForm from '../components/carForm'
import CarItem from '../components/carItem'
import { getCars, reset } from '../features/cars/carSlice'

function Dashboard() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user } = useSelector((state) => state.auth)
    const { cars, isLoading, isError, message } = useSelector((state) => state.cars)

    useEffect(() => {
        if (isError) {
            console.log(message)
        }

        if (!user) {
            navigate('/login')
        }

        // Fetch cars from backend
        dispatch(getCars())

        // Reset state on unmount
        return () => {
            dispatch(reset())
        }
    }, [user, navigate, isError, message, dispatch])

    if (isLoading) {
        return <div className="text-center mt-20 text-xl">Loading Cars...</div>
    }

    return (
        <section className='content p-4'>
            <section className="heading mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Welcome, {user && user.name}</h1>
                <p className="text-gray-500">Dashboard</p>
            </section>

            {/* Show Form ONLY if user is a host (Optional Logic, good for later) */}
            {/* For MVP, let's just show it so you can test adding cars easily */}
            <CarForm />

            <section className="content">
                {cars.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.map((car, index) => (
                            <CarItem key={car._id || car.id || index} car={car} />
                        ))}
                    </div>
                ) : (
                    <h3 className="text-gray-500 mt-10 text-center">No cars found. Add one above!</h3>
                )}
            </section>
        </section>
    )
}

export default Dashboard