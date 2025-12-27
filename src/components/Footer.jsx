import React from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#F0F2F4] pt-24 pb-12 border-t border-slate-200">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">

                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">

                    {/* Brand & Newsletter */}
                    <div className="md:col-span-4">
                        <h2 className="font-serif text-2xl tracking-widest mb-6">CEREMONY</h2>
                        <p className="text-slate-500 mb-8 font-light text-sm leading-relaxed max-w-xs">
                            Join our newsletter for brewing guides, new release alerts, and exclusive events.
                        </p>
                        <form className="flex border-b border-slate-300 pb-2 max-w-xs" onSubmit={(e) => e.preventDefault()}>
                            <input type="email" placeholder="Email Address" className="bg-transparent w-full outline-none text-sm placeholder:text-slate-400 text-slate-900" />
                            <button type="submit" className="text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-orange-700">Join</button>
                        </form>
                    </div>

                    {/* Links 1 */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Shop</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">All Coffee</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Subscriptions</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Equipment</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Merch</a></li>
                        </ul>
                    </div>

                    {/* Links 2 */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Company</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Our Story</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Locations</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    {/* Links 3 */}
                    <div className="md:col-span-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Wholesale</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Partner with Us</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Client Login</a></li>
                            <li><a href="#" className="text-sm text-slate-600 hover:text-black transition-colors">Training</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-200 gap-6">
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-black transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-black transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-slate-400 hover:text-black transition-colors"><Twitter className="w-5 h-5" /></a>
                    </div>
                    <div className="flex gap-8 text-[10px] uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-slate-600">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-600">Terms of Service</a>
                        <span>© 2024 Ceremony Coffee</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
