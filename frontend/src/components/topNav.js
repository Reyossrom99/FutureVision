import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import styles from './topNav.module.css'
import { useCheckbox } from '../context/checkboxShowLabelContext'; 
import {useSplitContext } from '../context/selectSplitViewContext'; 
import { useCreateSplitContext } from '../context/createSplitsContext';
import {useCreateNewButtonContext} from '../context/createNewContext'; 
import { Nav } from 'react-bootstrap';

function TopNav() {
  const location = useLocation();
  const {showLabels, setShowLabels} = useCheckbox(); 
  const { id } = useParams(); // Get the 'id' from the route params
  const { selectedSplit, setSplit } = useSplitContext();
  // const { buttonClicked, handleButtonClick } = useCreateSplitContext();
  const { handleNewButtonClick } = useCreateNewButtonContext(); 

  const [isAuth, setIsAuth] = useState(false); 
  useEffect(() => {     
    if (localStorage.getItem('access_token') !== null) {        setIsAuth(true); 
  }    }, [isAuth]);


  const handleButtonClick = () => {
    handleNewButtonClick(); 
    // setIsDialogOpen(true); 
  };

  const handleSplitChange = (e) => {
    setSplit(e.target.value);
  };
  const handleCheckboxChange = () => {
    setShowLabels(!showLabels); // Toggle checkbox state
  };

  return (
    <nav className={styles.topNavContainer}>
      {location.pathname === '/datasets' && (
        // <Link to="/datasets" className={styles.navElement} >CREATE NEW</Link>
        <button onClick={handleButtonClick} className={styles.navElement}>
        Create new
      </button>
      )}
      {location.pathname.startsWith('/datasets/')  && (
        <div className={styles.elementContainer}>
          
            <select
              id="splitSelect"
              onChange={handleSplitChange}
              value = {selectedSplit}
              className={styles.navElement}
            >
              <option value="train">Train</option>
              <option value="val">Validation</option>
              <option value="test">Test</option>
            </select>
           
            <input type='checkbox' checked={showLabels} onChange={handleCheckboxChange}className={styles.navElement} />
            <label id={styles.showLabels}> Show Labels</label>
           
             
          
            <button onClick={() => handleButtonClick(true)} className={styles.navElement}>
            Create splits</button>
          
          </div>
        
         
      )}
      {
        isAuth ? <Nav.Link href="/auth/logout">Logout</Nav.Link> :  
        <Nav.Link as={Link} to="/auth/login">Login</Nav.Link>

      }
    </nav>
  );
}

export default TopNav;