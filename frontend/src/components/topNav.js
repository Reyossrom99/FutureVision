import React, { useState, useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateSplitContext } from '../context/createSplitsContext';
import { useCreateNewButtonContext, useCreateNewProjectContext, useCreateNewTrainContext } from '../context/createNewContext';

import AuthContext from '../context/AuthContext';

import TopNavContainer from '../elements/topNavContainer';
import Button from '../elements/button';
import { Link } from 'react-router-dom';

import palette from '../palette';

function TopNav() {
  const location = useLocation();
  const { showLabels, setShowLabels } = useCheckbox();
  const { id } = useParams();
  const { selectedSplit, setSplit } = useSplitContext();
  const { handleNewButtonClick } = useCreateNewButtonContext();
  const { handleNewProjectButtonClick } = useCreateNewProjectContext();
  const { handleNewTrainButtonClick } = useCreateNewTrainContext();

  let { user, loginUser, logoutUser } = useContext(AuthContext)

  const handleButtonClick = () => {
    handleNewButtonClick();
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
    setShowLabels(!showLabels); 
  };


  return (
    <TopNavContainer>
      <div>
        {location.pathname === '/datasets' && (
          <Button onClick={handleButtonClick}>
            Create new
          </Button>
        )}
        {location.pathname.startsWith('/datasets/') && (
          <div>
            <select
              id="splitSelect"
              onChange={handleSplitChange}
              value={selectedSplit}
            >
              <option value="train">Train</option>
              <option value="val">Validation</option>
              <option value="test">Test</option>
            </select>

            <input
              type="checkbox"
              checked={showLabels}
              onChange={handleCheckboxChange}
            />
            <label> Show Labels</label>

            <Button onClick={() => handleButtonClick(true)}>
              Create splits
            </Button>
          </div>
        )}
        {location.pathname === '/projects' && (
          <Button onClick={handleNewProject} >
            Create new
          </Button>
        )}
        {location.pathname.startsWith('/project/') && (
          <Button onClick={handleNewTrain} >
            New training
          </Button>
        )}
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <Button onClick={logoutUser} style={{ backgroundColor: palette.neutralWhite }}>
          logout
        </Button>
      </div>
    </TopNavContainer>
  );
}

export default TopNav;