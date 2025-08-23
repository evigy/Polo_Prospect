// client/src/components/Header.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { isAuthenticated, signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Logout failed:', err.message);
    }
  };

  return (
    <header className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-extrabold flex items-center">
        <Link to="/" className="flex items-center">
          Polo Prospect
          <img
            src="/logo/PP_logo.png"
            alt="Polo Prospect Logo"
            className="h-16 w-auto inline-block ml-0.5"
            style={{ fontWeight: 900 }}
          />
        </Link>
      </h1>
      <nav className="space-x-5">
        <Link to="/">Home</Link>
        <Link to="/list">List Your Horse</Link>
        <Link to="/horses">Horses for Sale</Link>
        {isAuthenticated ? (
          <button onClick={handleLogout} className="text-white underline">
            Logout
          </button>
        ) : (
          <Link to="/login" className="text-white underline">
            Sign In / Create Account
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;