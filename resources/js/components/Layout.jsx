import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { path: '/employees', label: 'Manage Employees', icon: 'fas fa-users' },
        { path: '/admin-lists', label: 'Admin Lists', icon: 'fas fa-cog' }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === path ? 'bg-[#eb3505] text-white' : 'text-gray-600 hover:bg-[#eb3505] hover:text-white';
        }
        return location.pathname.startsWith(path) ? 'bg-[#eb3505] text-white' : 'text-gray-600 hover:bg-[#eb3505] hover:text-white';
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Interactive Gradient Background */}
            <div 
                className="absolute inset-0 -z-10 transition-all duration-1000 ease-out"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, 
                        rgba(1, 0, 102, 0.4) 0%, 
                        rgba(1, 0, 102, 0.3) 15%, 
                        rgba(1, 0, 102, 0.2) 30%, 
                        rgba(1, 0, 102, 0.1) 45%, 
                        rgba(1, 0, 102, 0.05) 60%,
                        rgba(1, 0, 102, 0.02) 100%)`
                }}
            >
                {/* Background Logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img
                        src="/assets/images/DPWH_Logo.png"
                        alt="DPWH Logo"
                        className="w-[80vw] h-[80vh] object-contain opacity-10 transition-transform duration-300"
                        style={{
                            transform: `perspective(1000px) rotateX(${(mousePosition.y - window.innerHeight/2) * 0.01}deg) rotateY(${(mousePosition.x - window.innerWidth/2) * 0.01}deg) rotate(${Date.now() * 0.001}deg)`,
                            animation: 'spin 20s linear infinite'
                        }}
                    />
                </div>
            </div>
            
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-slate-200/60 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <img
                                src="/assets/images/DPWH_Logo.png"
                                alt="DPWH Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <Link to="/" className="font-semibold text-lg text-slate-800 hidden sm:block tracking-tight">
                                DPWH Service Records
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`${isActive(item.path)} px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                                >
                                    <i className={`${item.icon} text-sm`}></i>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-slate-600 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-all duration-200"
                            >
                                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-slate-200/60">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`${isActive(item.path)} block px-4 py-3 rounded-xl text-base font-medium flex items-center space-x-3 transition-all duration-200`}
                                >
                                    <i className={`${item.icon} text-sm`}></i>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer - only show on dashboard */}
            {location.pathname === '/' && (
                <footer className="bg-white/60 backdrop-blur-sm border-t border-slate-200/60 mt-auto">
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                            <p className="text-sm text-slate-600 font-medium">
                                © 2026 DPWH Service Record System
                            </p>
                            {/* <p className="text-sm text-slate-500">
                                Design
                            </p> */}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
