import './topNav.module.css';

import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

function TopNav() {
  const location = useLocation();
  const { id } = useParams(); // Get the 'id' from the route params
  const [selectedSplit, setSelectedSplit] = useState('train');

  const handleSplitChange = (e) => {
    setSelectedSplit(e.target.value);
  };

  return (
    <nav className='topnav'>
      {location.pathname === '/datasets' && (
        <Link to="/datasets">Create New</Link>
      )}
      {location.pathname.startsWith('/datasets/') && (
        <select
          id="splitSelect"
          value={selectedSplit}
          onChange={handleSplitChange}
        >
          <option value="train">Train</option>
          <option value="val">Validation</option>
          <option value="test">Test</option>
        </select>
         
      )}
      {/* Add other navigation elements as needed */}
    </nav>
  );
}

export default TopNav;