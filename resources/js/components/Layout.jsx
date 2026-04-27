import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { path: '/', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { path: '/employees', label: 'Manage Employees', icon: 'fas fa-users' },
        { path: '/positions', label: 'Designations', icon: 'fas fa-briefcase' },
        { path: '/offices', label: 'Offices', icon: 'fas fa-building' },
        { path: '/employment-status', label: 'Status', icon: 'fas fa-clipboard-list' }
    ];

    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === path ? 'bg-[#eb3505] text-white' : 'text-gray-600 hover:bg-[#eb3505] hover:text-white';
        }
        return location.pathname.startsWith(path) ? 'bg-[#eb3505] text-white' : 'text-gray-600 hover:bg-[#eb3505] hover:text-white';
    };

    return (
        <div className="min-h-screen relative">
            {/* Background Layer */}
            <div className="fixed inset-0 -z-10 animate-mesh-gradient" style={{
                backgroundColor: 'rgba(64, 64, 64, 0.5)',
                backgroundImage: `url('/assets/images/DPWH_bldg.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundBlendMode: 'overlay',
                opacity: '0.4'
            }}></div>
            {/* Top Navigation */}
            <nav className="glass-card text-dpwh-blue sticky top-0 z-40 border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <img
                                src="/assets/images/DPWH_Logo.png"
                                alt="DPWH Logo"
                                className="w-14 h-14 object-contain"
                            />
                            <Link to="/" className="font-bold text-xl hidden sm:block">
                                DPWH Service Records
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-1">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`${isActive(item.path)} px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2`}
                                    >
                                        <i className={`${item.icon} w-4 text-center`}></i>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`${isActive(item.path)} block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3`}
                                >
                                    <i className={`${item.icon} w-5 text-center`}></i>
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
                <footer className="bg-white border-t border-gray-200 mt-auto">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-sm text-gray-500">
                                © 2026 DPWH Service Record System. All rights reserved.
                            </p>
                            <p className="text-sm text-gray-400 mt-2 md:mt-0">
                                Designed and developed by Donn Aguilar
                            </p>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default Layout;
