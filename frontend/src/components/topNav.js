import React, { useContext } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import styles from './topNav.module.css';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateNewButtonContext } from '../context/createNewContext';
import AuthContext from '../context/AuthContext'; // Import AuthContext
// import { logoutUser } from '../context/AuthContext'; // You don't need to import logoutUser separately

function TopNav() {
  const { user, setUser, logoutUser } = useContext(AuthContext); // Get logoutUser from AuthContext
  const navigate = useNavigate();

  const location = useLocation();
  const { showLabels, setShowLabels } = useCheckbox();
  const { id } = useParams();
  const { selectedSplit, setSplit } = useSplitContext();
  const { handleNewButtonClick } = useCreateNewButtonContext();

  const handleButtonClick = () => {
    handleNewButtonClick();
  };

  const handleSplitChange = (e) => {
    setSplit(e.target.value);
  };

  const handleCheckboxChange = () => {
    setShowLabels(!showLabels);
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
      <span> | </span>
      {user ? (
        <button onClick={logoutUser} className={styles.navElement}>
          Logout
        </button>
      ) : (
        <Link to="/login" className={styles.Link}>
          Login
        </Link>
      )}
    </nav>
  );
}

export default TopNav;
