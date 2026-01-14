import { useState, useEffect } from 'react'
import { FaSignInAlt } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, reset } from '../features/auth/authSlice'

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const { email, password } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    useEffect(() => {
        if (isError) {
            alert(message) // Simple alert for MVP. We can make a nice Toast later.
        }

        if (isSuccess || user) {
            navigate('/')
        }

        dispatch(reset())
    }, [user, isError, isSuccess, message, navigate, dispatch])

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault()

        const userData = {
            email,
            password,
        }

        dispatch(login(userData))
    }

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>
    }

    return (
        <div className="flex justify-center items-center h-[80vh]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">

                {/* Header Section */}
                <section className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-slate-800 flex justify-center items-center gap-2'>
                        <FaSignInAlt /> Login
                    </h1>
                    <p className='text-gray-500 mt-2'>Login to access your account</p>
                </section>

                {/* Form Section */}
                <section className='form'>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">

                        <div className='form-group'>
                            <input
                                type='email'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='email'
                                name='email'
                                value={email}
                                placeholder='Enter your email'
                                onChange={onChange}
                            />
                        </div>

                        <div className='form-group'>
                            <input
                                type='password'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='password'
                                name='password'
                                value={password}
                                placeholder='Enter password'
                                onChange={onChange}
                            />
                        </div>

                        <div className='form-group mt-2'>
                            <button type='submit' className='w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-700 transition'>
                                Submit
                            </button>
                        </div>

                    </form>
                </section>
            </div>
        </div>
    )
}

export default Login