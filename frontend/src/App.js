import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import SideNav from './components/SideNav'; 
import TopNav from './components/topNav';
import Datasets from './pages/Datasets';
import DatasetsDetails from './pages/DatasetsDetails';
import Login  from './pages/Login';
import axios from 'axios';


  function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
    const handleLoginSuccess = () => {
      setIsLoggedIn(true);
    };
  
    const handleLogout = () => {
      setIsLoggedIn(false);
      // Additional logout logic here if needed
    };

  return (
    <div className="App">
      {isLoggedIn && <SideNav />}
      <TopNav isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      
        <Routes>
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/datasets/:id" element={<DatasetsDetails />} />
          <Route path="/auth/login" element={<Login onLogin={handleLoginSuccess} />} />
        </Routes>
     
    </div>
  );
}

export default App;
