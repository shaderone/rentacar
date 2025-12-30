import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaBuilding } from 'react-icons/fa' // Added FaBuilding icon
import { register, reset } from '../features/auth/authSlice'

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',     // Default role
        businessName: '',     // Host specific
        licenseNumber: '',    // Host specific
    })

    const { name, email, password, confirmPassword, role, businessName, licenseNumber } = formData

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    )

    useEffect(() => {
        if (isError) {
            alert(message)
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

        if (password !== confirmPassword) {
            alert('Passwords do not match')
        } else {
            // 1. Base User Data
            const userData = {
                name,
                email,
                password,
                role,
            }

            // 2. Add Host Data ONLY if role is host
            if (role === 'host') {
                userData.businessName = businessName
                userData.licenseNumber = licenseNumber
            }

            dispatch(register(userData))
        }
    }

    if (isLoading) {
        return <div className="text-center mt-20">Loading...</div>
    }

    return (
        <div className="flex justify-center items-center py-10 min-h-[80vh]"> {/* increased padding for taller form */}
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md border border-gray-100">

                <section className='text-center mb-8'>
                    <h1 className='text-3xl font-bold text-slate-800 flex justify-center items-center gap-2'>
                        {role === 'host' ? <FaBuilding /> : <FaUser />}
                        {role === 'host' ? 'Host Registration' : 'Register'}
                    </h1>
                    <p className='text-gray-500 mt-2'>
                        {role === 'host' ? 'List your fleet with us' : 'Create an account to start renting'}
                    </p>
                </section>

                <section className='form'>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">

                        {/* ROLE SELECTOR */}
                        <div className="form-group mb-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">I want to:</label>
                            <select
                                name="role"
                                value={role}
                                onChange={onChange}
                                className="w-full p-3 border border-gray-300 rounded bg-white focus:outline-none focus:border-slate-800"
                            >
                                <option value="customer">Rent a Car (Customer)</option>
                                <option value="host">List my Cars (Host)</option>
                            </select>
                        </div>

                        <div className='form-group'>
                            <input
                                type='text'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='name'
                                name='name'
                                value={name}
                                placeholder='Full Name'
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <input
                                type='email'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='email'
                                name='email'
                                value={email}
                                placeholder='Email Address'
                                onChange={onChange}
                                required
                            />
                        </div>

                        {/* 🚀 CONDITIONAL HOST FIELDS */}
                        {role === 'host' && (
                            <div className="animate-fade-in space-y-4 p-4 bg-gray-50 rounded border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-500 uppercase">Host Details</h3>
                                <input
                                    type='text'
                                    className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800'
                                    name='businessName'
                                    value={businessName}
                                    placeholder='Business Name (e.g. Hertz)'
                                    onChange={onChange}
                                    required
                                />
                                <input
                                    type='text'
                                    className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800'
                                    name='licenseNumber'
                                    value={licenseNumber}
                                    placeholder='Business License Number'
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        )}

                        <div className='form-group'>
                            <input
                                type='password'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='password'
                                name='password'
                                value={password}
                                placeholder='Password'
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className='form-group'>
                            <input
                                type='password'
                                className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-slate-800 transition'
                                id='confirmPassword'
                                name='confirmPassword'
                                value={confirmPassword}
                                placeholder='Confirm password'
                                onChange={onChange}
                                required
                            />
                        </div>

                        <div className='form-group mt-2'>
                            <button type='submit' className='w-full bg-slate-900 text-white p-3 rounded font-bold hover:bg-slate-700 transition'>
                                {role === 'host' ? 'Register as Host' : 'Register as Customer'}
                            </button>
                        </div>

                    </form>
                </section>
            </div>
        </div>
    )
}

export default Register