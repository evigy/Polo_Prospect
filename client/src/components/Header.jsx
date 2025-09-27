// client/src/components/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, signOut } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setOpen(false);
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  const linkCls = 'block px-1 py-2 md:py-0 hover:underline underline-offset-4';

  return (
    <header className="bg-blue-900 text-white">
      {/* Top bar */}
      <div className="p-4 flex justify-between items-center">
        {/* Brand (unchanged styling, just wrapped for layout) */}
        <h1 className="text-2xl font-extrabold flex items-center">
          <Link to="/" className="flex items-center" onClick={() => setOpen(false)}>
            Polo Prospect
            <img
              src="/logo/PP_logo.png"
              alt="Polo Prospect Logo"
              className="h-16 w-auto inline-block ml-0.5"
              style={{ fontWeight: 900 }}
            />
          </Link>
        </h1>

        {/* Desktop nav (unchanged) */}
        <nav className="hidden md:flex space-x-5">
          <NavLink to="/" className="hover:underline">Home</NavLink>
          <NavLink to="/list" className="hover:underline">List Your Horse</NavLink>
          <NavLink to="/horses" className="hover:underline">Horses for Sale</NavLink>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-white underline">
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="text-white underline">
              Sign In / Create Account
            </NavLink>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-white/60"
          aria-label="Toggle menu"
          aria-expanded={open ? 'true' : 'false'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 pb-3">
          <nav className="flex flex-col pt-2 space-y-1">
            <NavLink to="/" className={linkCls} onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/list" className={linkCls} onClick={() => setOpen(false)}>
              List Your Horse
            </NavLink>
            <NavLink to="/horses" className={linkCls} onClick={() => setOpen(false)}>
              Horses for Sale
            </NavLink>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-left px-1 py-2 hover:underline underline-offset-4"
              >
                Logout
              </button>
            ) : (
              <NavLink to="/login" className={linkCls} onClick={() => setOpen(false)}>
                Sign In / Create Account
              </NavLink>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;