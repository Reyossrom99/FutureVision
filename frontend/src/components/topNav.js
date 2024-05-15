import React, { useState, useContext } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateNewButtonContext, useCreateNewProjectContext, useCreateNewTrainContext } from '../context/createNewContext';
import { useDeleteDatasetContext } from '../context/deleteContext';
import AuthContext from '../context/AuthContext';
import { navData } from '../lib/navData';
import { TopNavContainer, TopNavItem, TopNavItems, TopNavButton, LastItem } from '../elements/topNavContainer';
import { SideNavButton, TopNavLink, NavContainer} from '../elements/SideNavContainer';

import { SlMenu, SlLogout } from "react-icons/sl";

function TopNav() {
  const location = useLocation();
  const { showLabels, setShowLabels } = useCheckbox();
  const { id } = useParams();
  const { selectedSplit, setSplit } = useSplitContext();
  const { handleNewButtonClick } = useCreateNewButtonContext();
  const { handleNewProjectButtonClick } = useCreateNewProjectContext();
  const { handleNewTrainButtonClick } = useCreateNewTrainContext();
  const { handleDeleteButtonClick } = useDeleteDatasetContext();
  const [menuVisible, setMenuVisible] = useState(false);

  let { user, loginUser, logoutUser } = useContext(AuthContext); 

  //delete dataset 
  const {askForConfirmation} = useDeleteDatasetContext();

  const handleDeleteDataset = () => {
    askForConfirmation(true);
  }; 

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
  const handleDeleteProject = () => { 
    handleDeleteButtonClick();
  };


  return (
    <TopNavContainer>
      <TopNavItems>
        <TopNavItem>
          <SideNavButton onClick={() => setMenuVisible(!menuVisible)}>
            <SlMenu style={{fontSize: '16px'}}/>
          </SideNavButton>
          {
            menuVisible && (
              <NavContainer open={menuVisible}>
                {/* Mapea los elementos de navData para renderizar los enlaces */}
                {navData.map(item => (
                  <TopNavLink key={item.id} to={item.link} onClick={() => setMenuVisible(!menuVisible)}>
                    {item.icon}
                    <span id={item.text} style={{marginLeft:'10px', fontSize:'16px'}}>{item.text}</span>
                  </TopNavLink>
                ))}
              </NavContainer>
            )
          }
        </TopNavItem>
        <TopNavItem>
          {location.pathname === '/datasets' && (
            <TopNavButton onClick={handleButtonClick}>
              new dataset
            </TopNavButton>
          )}
        </TopNavItem>
        {location.pathname.startsWith('/dataset/') && (
          <><TopNavItem>
            <select
              id="splitSelect"
              onChange={handleSplitChange}
              value={selectedSplit}
            >
              <option value="">Select Split</option>
              <option value="train">Train</option>
              <option value="val">Validation</option>
              <option value="test">Test</option>
            </select>
          </TopNavItem>
          <TopNavItem>
          <input
              type="checkbox"
              checked={showLabels}
              onChange={handleCheckboxChange} /><label> Show Labels</label>
              <TopNavButton onClick={() => handleButtonClick(true)}>
              create splits
            </TopNavButton>
            </TopNavItem>
            <TopNavItem>
              <TopNavButton onClick={handleDeleteDataset} >
                Delete Dataset
                </TopNavButton>
            </TopNavItem>
            </>
        )}
        {location.pathname === '/projects' && (
          <TopNavItem>
          <TopNavButton onClick={handleNewProject} >
            create new
          </TopNavButton>
          </TopNavItem>
        )}
        {location.pathname.startsWith('/project/') && (
          <TopNavItem>
          <TopNavButton onClick={handleNewTrain} >
            new training
          </TopNavButton>
          </TopNavItem>
        )}
     
     
      <LastItem style={{marginLeft:'auto'}}>
        <SideNavButton onClick={logoutUser}>
          <SlLogout style={{fontSize: '24px' }}/>
        </SideNavButton>
        </LastItem>
     
      </TopNavItems>
    </TopNavContainer>
  );
}

export default TopNav;