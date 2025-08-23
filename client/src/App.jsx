import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ListHorse from './pages/ListHorse';
import HorsesForSale from './pages/HorsesForSale';
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HorseDetail from './pages/HorseDetail'; // NEW

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/list"
                element={
                  <ProtectedRoute>
                    <ListHorse />
                  </ProtectedRoute>
                }
              />
              <Route path="/horses" element={<HorsesForSale />} />
              <Route path="/horse/:id" element={<HorseDetail />} /> {/* NEW */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;