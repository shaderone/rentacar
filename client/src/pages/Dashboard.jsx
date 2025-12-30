import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Dashboard() {
    const navigate = useNavigate()

    // 1. Get the user from Redux state
    const { user } = useSelector((state) => state.auth)

    useEffect(() => {
        // 2. The Guard Clause: If no user, kick them to login
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])

    return (
        <div className='p-10 text-center'>
            <h1 className='text-3xl font-bold'>Welcome, {user && user.name}</h1>
            <p className='text-gray-500 mt-4'>This is your private dashboard.</p>
        </div>
    )
}

export default Dashboard