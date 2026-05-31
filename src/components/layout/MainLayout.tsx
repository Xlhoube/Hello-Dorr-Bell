import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function MainLayout() {

    return (
        <div className="min-h-screen flex flex-col pt-4 px-4 bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-500">
            <Navbar />
            <main className="flex-grow mt-4 mb-8 rounded-[2.5rem] bg-[var(--bg-card)] border border-[var(--border-dim)] overflow-hidden transition-all duration-500 shadow-sm relative">
                <Outlet />
            </main>

        </div>
    );
}

