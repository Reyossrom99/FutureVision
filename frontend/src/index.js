import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CheckboxProvider } from './context/checkboxShowLabelContext';
import { SplitProvider } from './context/selectSplitViewContext';
import { CreateSplitProvider } from './context/createSplitsContext';
import { CreateNewButtonProvider, CreateNewProjectProvider, CreateNewTrainProvider } from './context/createNewContext';
import { DeleteDatasetProvider, DeleteProjectProvider } from './context/deleteContext';
import { ModifyProvider } from './context/modifyContext';
import { SaveDatasetProvider } from './context/saveContext';
import { TypeProvider } from './context/typeContext';

import palette from './palette';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
     
      <TypeProvider>	
           <SaveDatasetProvider>
      <ModifyProvider>
        <DeleteProjectProvider>
        <DeleteDatasetProvider>
          <CreateNewButtonProvider>
            <CreateNewProjectProvider>
              <CreateNewTrainProvider>
                <CheckboxProvider>
                  <SplitProvider>
                    <CreateSplitProvider>
                      <App palette={palette} />
                    </CreateSplitProvider>
                  </SplitProvider>
                </CheckboxProvider>
              </CreateNewTrainProvider>
            </CreateNewProjectProvider>
          </CreateNewButtonProvider>
        </DeleteDatasetProvider>
        </DeleteProjectProvider>
      </ModifyProvider>
      </SaveDatasetProvider>
            </TypeProvider>

    </BrowserRouter>
  </React.StrictMode>
);
