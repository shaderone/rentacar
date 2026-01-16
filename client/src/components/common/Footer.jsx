import { Link } from 'react-router-dom'
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaHeart } from 'react-icons/fa'

function Footer() {
    return (
        // Added 'px-6' so the floating card doesn't touch screen edges on mobile
        <div className="px-6 pb-6 mt-20">

            {/* 'app-container' handles max-width & centering. Removed redundant 'mx-auto' */}
            <div className="app-container bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-slate-300 relative overflow-hidden border border-transparent dark:border-slate-800 shadow-2xl transition-colors">

                {/* Decorative Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* 1. Brand Section */}
                    <div className="space-y-6">
                        <Link to='/' className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 font-black text-lg shadow-lg group-hover:bg-emerald-400 transition duration-300">
                                R
                            </div>
                            <span className="font-black text-xl tracking-tighter text-white">
                                RENTA<span className="text-emerald-500">CAR</span>.
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Premium car rentals for those who appreciate quality and comfort. Drive your dream car today.
                        </p>
                        <div className="flex gap-4">
                            {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn].map((Icon, idx) => (
                                <a key={idx} href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-300">
                                    <Icon size={14} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* 2. Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><Link to="/" className="hover:text-emerald-400 transition">Home</Link></li>
                            <li><Link to="/all-cars" className="hover:text-emerald-400 transition">Browse Fleet</Link></li>
                            <li><Link to="/about" className="hover:text-emerald-400 transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-emerald-400 transition">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* 3. Legal */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4 text-sm font-medium">
                            <li><a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-emerald-400 transition">Cookie Policy</a></li>
                        </ul>
                    </div>

                    {/* 4. Newsletter */}
                    <div>
                        <h4 className="text-white font-bold mb-6">Stay Updated</h4>
                        <p className="text-slate-400 text-sm mb-4">Subscribe for the latest offers and new fleet additions.</p>
                        <div className="flex items-center bg-slate-800 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-emerald-500 transition">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="bg-transparent w-full text-sm font-bold text-white placeholder-slate-500 focus:outline-none"
                            />
                            <button className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition shadow-lg font-bold">
                                <FaHeart size={12} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        &copy; {new Date().getFullYear()} Rentacar Inc.
                    </p>
                    <p className="text-slate-500 text-xs font-bold flex items-center gap-1">
                        Made with <FaHeart className="text-red-500 animate-pulse" /> in Kochi, India
                    </p>
                </div>

            </div>
        </div>
    )
}

export default Footer