import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authAPI } from './api';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Feed from './pages/Feed';
import TweetDetail from './pages/TweetDetail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import EditTweet from './pages/EditTweet';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

// Auth context
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await authAPI.status();
      if (data.is_authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, checkAuth }}>
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Landing />} />

          {/* Auth */}
          <Route path="/login" element={user ? <Navigate to="/feed" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/feed" /> : <Register />} />

          {/* Main app (3-column layout) */}
          <Route element={<Layout />}>
            <Route path="/feed" element={<Feed />} />
            <Route path="/tweet/:id" element={<TweetDetail />} />
            <Route path="/tweet/:id/edit" element={user ? <EditTweet /> : <Navigate to="/login" />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
