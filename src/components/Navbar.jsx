import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isTeacher, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  const dashboardPath = isTeacher ? '/teacher/dashboard' : '/student/dashboard';

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">TC</span>
          <span className="brand-word">TutorConnect<em>Nepal</em></span>
        </Link>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/find-tutors" onClick={() => setMenuOpen(false)}>Find Tutors</NavLink>
          {isAuthenticated && (
            <NavLink to={dashboardPath} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/bookings" onClick={() => setMenuOpen(false)}>Bookings</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/chat" onClick={() => setMenuOpen(false)}>Messages</NavLink>
          )}
          {isAuthenticated && !isTeacher && (
            <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
          )}
          {isAuthenticated && (
            <NavLink to="/notifications" onClick={() => setMenuOpen(false)}>Notifications</NavLink>
          )}
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <button className="user-pill" onClick={() => setMenuOpen((v) => !v)}>
                <span className="avatar-dot">{(user?.first_name || user?.username || '?').charAt(0).toUpperCase()}</span>
                {user?.first_name || user?.username}
              </button>
              <div className="user-dropdown">
                <Link to="/account-settings">Account Settings</Link>
                <button onClick={handleLogout}>Log out</button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
          <button className="hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}
