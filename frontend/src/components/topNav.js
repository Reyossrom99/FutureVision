import React, { useState , useContext} from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './topNav.module.css'
import { useCheckbox } from '../context/checkboxShowLabelContext'; 
import {useSplitContext } from '../context/selectSplitViewContext'; 
import { useCreateSplitContext } from '../context/createSplitsContext';
import {useCreateNewButtonContext, useCreateNewProjectContext, useCreateNewTrainContext} from '../context/createNewContext'; 

import AuthContext from '../context/AuthContext';

function TopNav() {
  const location = useLocation();
  const {showLabels, setShowLabels} = useCheckbox(); 
  const { id } = useParams(); // Get the 'id' from the route params
  const { selectedSplit, setSplit } = useSplitContext();
  // const { buttonClicked, handleButtonClick } = useCreateSplitContext();
  const { handleNewButtonClick} = useCreateNewButtonContext(); 
  const {handleNewProjectButtonClick} = useCreateNewProjectContext(); 
  const {handleNewTrainButtonClick} = useCreateNewTrainContext(); 

  let { user, loginUser, logoutUser} = useContext(AuthContext)
 
  const handleButtonClick = () => {
    handleNewButtonClick(); 
    // setIsDialogOpen(true); 
  };
  const handleNewTrain = () => {
    handleNewTrainButtonClick(); 
  }

  const handleNewProject = () => {
    handleNewProjectButtonClick(); 
  }
  const handleSplitChange = (e) => {
    setSplit(e.target.value);
  };
  const handleCheckboxChange = () => {
    setShowLabels(!showLabels); // Toggle checkbox state
  };
  

  return (
    <nav className={styles.topNavContainer}>
      {location.pathname === '/datasets' && (
        <button onClick={handleButtonClick} className={styles.navElement}>
          Create new
        </button>
      )}
      {location.pathname.startsWith('/datasets/') && (
        <div className={styles.elementContainer}>
          <select
            id="splitSelect"
            onChange={handleSplitChange}
            value={selectedSplit}
            className={styles.navElement}
          >
            <option value="train">Train</option>
            <option value="val">Validation</option>
            <option value="test">Test</option>
          </select>

          <input
            type="checkbox"
            checked={showLabels}
            onChange={handleCheckboxChange}
            className={styles.navElement}
          />
          <label id={styles.showLabels}> Show Labels</label>

          <button onClick={() => handleButtonClick(true)} className={styles.navElement}>
            Create splits
          </button>
        </div>
      )}
      {
        location.pathname === '/projects' && (
          <button onClick={handleNewProject} className={styles.navElement}>
          Create new
        </button>
        )

      }
      {
        location.pathname.startsWith('/project/') &&(
          <button onClick={handleNewTrain} className={styles.navElement}>
              New training
        </button>
        )
      }
      <span> | </span>
      {user ? (
        <button onClick={logoutUser} className={styles.navElement}>
          Logout
        </button>
      ) : (
        <Link to="/login" id={styles.login}>
          Login
        </Link>
      )}
    </nav>
  );
}

export default TopNav;