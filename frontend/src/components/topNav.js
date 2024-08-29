import React, { useState, useContext } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useCheckbox } from '../context/checkboxShowLabelContext';
import { useSplitContext } from '../context/selectSplitViewContext';
import { useCreateNewButtonContext, useCreateNewProjectContext, useCreateNewTrainContext } from '../context/createNewContext';
import { useDeleteDatasetContext, useDeleteProjectContext} from '../context/deleteContext';
import { useModifyContext } from '../context/modifyContext';
import AuthContext from '../context/AuthContext';
import { navData } from '../lib/navData';
import { TopNavContainer, TopNavItem, TopNavItems, TopNavButton, LastItem, TopNavSelect, TopNavCheckbox, TopNavLabel } from '../elements/topNavContainer';
import { SideNavButton, TopNavLink, NavContainer} from '../elements/SideNavContainer';
import { useCreateSplitContext } from '../context/createSplitsContext';
import { SlMenu, SlLogout } from "react-icons/sl";
import { useSaveDatasetContext } from '../context/saveContext';
import { useTypeContext } from '../context/typeContext';


function TopNav() {
  const location = useLocation();
  const { showLabels, setShowLabels } = useCheckbox();
  const { id } = useParams();
  const { selectedSplit, setSplit } = useSplitContext();
  const { handleNewButtonClick } = useCreateNewButtonContext();
  const { handleNewProjectButtonClick } = useCreateNewProjectContext();
  const { handleNewTrainButtonClick } = useCreateNewTrainContext();
  const { handleDeleteButtonClick } = useDeleteDatasetContext();
  const { handleDeleteProjectButtonClick } = useDeleteProjectContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const {askForModify } = useModifyContext();
  const {handleCreateSplitDialog} = useCreateSplitContext(); 
  const {askForConfirmationSaveDataset} = useSaveDatasetContext();
  let { user, loginUser, logoutUser } = useContext(AuthContext); 
   
  const {type } = useTypeContext();
  console.log("type top nav", type);
  const optionsType = type === "splits" ? ['train', 'val', 'test'] : []; 
  //delete dataset 
  const {askForConfirmation} = useDeleteDatasetContext();

  const {askForConfirmationProject} = useDeleteProjectContext();

  const handleDeleteDataset = () => {
    askForConfirmation(true);
  }; 

  const handleDeleteProject = () => {
    askForConfirmationProject(true);
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
  const handleModifyDataset = () => { 
    askForModify();
  }
  const handleCreateSplits = () => {
    handleCreateSplitDialog(); 
  }
  const handleSaveDataset = () => {
    askForConfirmationSaveDataset();
  }


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

        
          {location.pathname === '/datasets' && (
            <>
            <TopNavItem>
            <TopNavButton onClick={handleButtonClick}>
              new dataset
            </TopNavButton>
            </TopNavItem>
            </>
          )}
       

        {location.pathname.startsWith('/dataset/') && (
          <><TopNavItem>
            <TopNavSelect
              id="splitSelect"
              onChange={handleSplitChange}
              value={selectedSplit}
            >
  	   { optionsType.length ===0 ? <options value="">No splits</options> 
		    : optionsType.map((option) => (
			    <option key={option} value={option}>{option}</option>
		    ))}

	      </TopNavSelect>	
          </TopNavItem>
          <TopNavItem>
          <TopNavCheckbox
              type="checkbox"
              checked={showLabels}
              onChange={handleCheckboxChange} /><TopNavLabel> Show Labels</TopNavLabel>
             
            </TopNavItem>

            <TopNavItem>
              <TopNavButton onClick={handleDeleteDataset} >
                Delete Dataset
                </TopNavButton>
            </TopNavItem>
            <TopNavItem>
              <TopNavButton onClick={handleModifyDataset} >
                Modify
              </TopNavButton>
            </TopNavItem>
              <TopNavItem>
                <TopNavButton onClick={handleCreateSplits}>
                  Create splits
                </TopNavButton>
              </TopNavItem>
              <TopNavItem>
                <TopNavButton onClick={handleSaveDataset}>
                  Save changes
                </TopNavButton>
              </TopNavItem>
            
            </>
        )}
        
        {location.pathname === '/projects' && (
          <>
         <TopNavItem>
          <TopNavButton onClick={handleNewProject} >
            create new
          </TopNavButton>
          </TopNavItem>
          </>
        )}
        

        {location.pathname.startsWith('/project/') && (
          <>
          <TopNavItem>
          <TopNavButton onClick={handleNewTrain}>
            train
          </TopNavButton>
          </TopNavItem>
          <TopNavItem>
          <TopNavButton onClick={handleDeleteProject}>
            delete project
          </TopNavButton>
          </TopNavItem>
        </>
        )}
       
     
        <LastItem>
        <SideNavButton onClick={logoutUser}>
          <SlLogout style={{fontSize: '24px' }}/>
        </SideNavButton>
        </LastItem>
     
      </TopNavItems>
    </TopNavContainer>
  );
}

export default TopNav;
