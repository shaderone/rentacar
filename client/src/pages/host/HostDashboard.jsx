import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaCar, FaMoneyBillWave, FaChartLine, FaPlus, FaCheckCircle, FaTimesCircle, FaArrowRight, FaClock } from 'react-icons/fa'
import Footer from '../../components/common/Footer'

function HostDashboard() {
    const navigate = useNavigate()

    // --- MOCK DATA (Replace with Redux selectors later) ---
    const stats = [
        { title: 'Total Earnings', value: '₹1,24,500', icon: FaMoneyBillWave, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Active Rentals', value: '4 Cars', icon: FaCar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Views', value: '8.4k', icon: FaChartLine, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    ]

    const pendingRequests = [
        { id: 1, car: 'Toyota Camry SE', user: 'Alex Johnson', dates: '12 Dec - 14 Dec', price: '₹6,854', status: 'Pending' },
        { id: 2, car: 'Honda City', user: 'Sarah Connor', dates: '15 Dec - 18 Dec', price: '₹9,200', status: 'Pending' },
        { id: 3, car: 'Mahindra Thar', user: 'Arjun K', dates: '20 Dec - 22 Dec', price: '₹12,500', status: 'Pending' },
    ]

    const myFleet = [
        { id: 1, name: 'Toyota Camry SE', status: 'Active', earnings: '₹45k', image: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=1000&auto=format&fit=crop' },
        { id: 2, name: 'Honda City', status: 'Rented', earnings: '₹32k', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=1000&auto=format&fit=crop' },
        { id: 3, name: 'Mahindra Thar', status: 'Maintenance', earnings: '₹12k', image: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=1000&auto=format&fit=crop' },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-10 pb-20 transition-colors duration-300">
            <div className="app-container px-6">

                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs">Host Portal</span>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mt-2">Dashboard</h1>
                    </div>
                    <button
                        onClick={() => navigate('/host/add-car')}
                        className="mt-4 md:mt-0 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 dark:hover:bg-emerald-400 hover:text-white transition shadow-lg"
                    >
                        <FaPlus size={12} /> Add New Car
                    </button>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.title}</p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* --- LEFT COL: PENDING REQUESTS --- */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <FaClock className="text-amber-500" /> Pending Approvals
                            </h2>
                            <Link to="/host/bookings" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline">View All</Link>
                        </div>

                        <div className="space-y-4">
                            {pendingRequests.length === 0 ? (
                                <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-gray-200 dark:border-slate-800">
                                    <p className="text-gray-400 font-medium">No pending requests.</p>
                                </div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 transition-colors group hover:border-emerald-500/30">

                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
                                                {req.user.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-lg">{req.user}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{req.car} • {req.dates}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 dark:text-white">{req.price}</p>
                                                <p className="text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full inline-block">Action Required</p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-red-500 hover:text-white transition flex items-center justify-center" title="Reject">
                                                    <FaTimesCircle size={18} />
                                                </button>
                                                <button className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition flex items-center justify-center shadow-lg" title="Approve">
                                                    <FaCheckCircle size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT COL: FLEET WIDGET --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden h-full min-h-100">

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="flex justify-between items-end mb-8 relative z-10">
                                <h2 className="text-xl font-black">My Fleet</h2>
                                <button onClick={() => navigate('/host/my-fleet')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                    <FaArrowRight size={12} />
                                </button>
                            </div>

                            <div className="space-y-4 relative z-10">
                                {myFleet.map((car) => (
                                    <div key={car.id} className="bg-white/5 backdrop-blur-sm p-3 rounded-2xl border border-white/10 flex items-center gap-3 hover:bg-white/10 transition cursor-pointer" onClick={() => navigate('/host/my-fleet')}>
                                        <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden">
                                            <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{car.name}</h4>
                                            <p className="text-xs text-slate-400">Earned: {car.earnings}</p>
                                        </div>
                                        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase
                                            ${car.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                car.status === 'Rented' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-gray-500/20 text-gray-400'}`}>
                                            {car.status}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/host/add-car')} className="w-full mt-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-emerald-400 transition shadow-lg">
                                + Add Another Car
                            </button>

                        </div>
                    </div>

                </div>

            </div>

            <div className="mt-20 px-6">
                <Footer />
            </div>
        </div>
    )
}

export default HostDashboard