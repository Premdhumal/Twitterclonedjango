import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Bell, User, LogOut, LogIn, Settings } from 'lucide-react';
import { useAuth } from '../App';
import { authAPI } from '../api';
import { useState, useEffect } from 'react';
import { notifAPI } from '../api';

export default function Sidebar() {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [unread, setUnread] = useState(0);

    useEffect(() => {
        if (user) {
            notifAPI.list().then(d => setUnread(d.unread_count)).catch(() => { });
        }
    }, [user]);

    const handleLogout = async () => {
        try {
            await authAPI.logout();
            setUser(null);
            navigate('/login');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo" onClick={() => navigate('/feed')} style={{ cursor: 'pointer' }}>
                <div className="sidebar-logo-icon">D</div>
                <span className="sidebar-logo-text">DjangoTweet</span>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <NavLink to="/feed" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Home className="nav-icon" />
                    <span>Home</span>
                </NavLink>

                {user && (
                    <>
                        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <Bell className="nav-icon" />
                            <span>Notifications</span>
                            {unread > 0 && <span className="nav-badge">{unread}</span>}
                        </NavLink>

                        <NavLink to={`/profile/${user.username}`} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                            <User className="nav-icon" />
                            <span>Profile</span>
                        </NavLink>
                    </>
                )}

                {!user && (
                    <NavLink to="/login" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LogIn className="nav-icon" />
                        <span>Login</span>
                    </NavLink>
                )}
            </nav>

            {/* Tweet button */}
            {user && (
                <button className="tweet-compose-btn" onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-compose'));
                    navigate('/feed');
                }}>
                    Tweet
                </button>
            )}

            {/* Profile / Logout */}
            {user && (
                <div className="sidebar-profile" onClick={handleLogout} title="Logout">
                    <div className="avatar avatar-sm">{user.username?.[0]}</div>
                    <div className="sidebar-profile-info">
                        <div style={{ fontWeight: 700, fontSize: '0.93rem' }}>{user.display_name || user.username}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>@{user.username}</div>
                    </div>
                    <LogOut size={18} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
                </div>
            )}
        </aside>
    );
}
