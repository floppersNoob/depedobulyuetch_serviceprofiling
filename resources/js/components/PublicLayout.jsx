import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const PublicLayout = () => {
    return (
        <div className="min-h-screen bg-gray-50/80 relative">
            {/* Top Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                <img
                                    src="/assets/images/DPWH_Logo.png"
                                    alt="DPWH Logo"
                                    className="w-8 h-8 object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-gray-900 font-semibold text-base tracking-tight">DPWH</h1>
                                <p className="text-gray-500 text-xs">Employee Directory</p>
                            </div>
                        </Link>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm hidden sm:inline">Public Access</span>
                            <a
                                href="/login"
                                className="px-4 py-2 bg-[#010066] hover:bg-[#000055] text-white text-sm font-medium rounded-xl transition-all shadow-sm"
                            >
                                <i className="fas fa-lock mr-2"></i>
                                Login
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200/60 mt-auto">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                        <p className="text-sm text-gray-500">
                            Department of Public Works and Highways
                        </p>
                        <p className="text-sm text-gray-400">
                            Service Profiling System - Public View
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
