

import React, { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import './topNav.css'; 
import { useCheckbox } from '../context/checkboxShowLabelContext'; 
import {useSplitContext } from '../context/selectSplitViewContext'; 

function TopNav() {
  const location = useLocation();
  const {showLabels, setShowLabels} = useCheckbox(); 
  const { id } = useParams(); // Get the 'id' from the route params
  const { selectedSplit, setSplit } = useSplitContext();

  const handleSplitChange = (e) => {
    setSplit(e.target.value);
  };
  const handleCheckboxChange = () => {
    setShowLabels(!showLabels); // Toggle checkbox state
  };

  return (
    <nav className='topnav'>
      {location.pathname === '/datasets' && (
        <Link to="/datasets" className='navContainer' >Create New</Link>
      )}
      {location.pathname.startsWith('/datasets/') && (
        <div className='select-container'>
          <select
            id="splitSelect"
            onChange={handleSplitChange}
            value = {selectedSplit}
          >
            <option value="train">Train</option>
            <option value="val">Validation</option>
            <option value="test">Test</option>
          </select>
          <label>
            <input type='checkbox' checked={showLabels} onChange={handleCheckboxChange} />
            Show Labels
          </label>
        </div>
         
      )}
      {/* Add other navigation elements as needed */}
    </nav>
  );
}

export default TopNav;