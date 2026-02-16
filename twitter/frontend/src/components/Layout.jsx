import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';

export default function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-feed">
                <Outlet />
            </main>
            <RightPanel />
        </div>
    );
}
