import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { CheckboxProvider } from './context/checkboxShowLabelContext';
import { SplitProvider } from './context/selectSplitViewContext';
import { ButtonClickProvider } from './context/createSplitsContext';
import { CreateNewButtonProvider, CreateNewProjectProvider, CreateNewTrainProvider } from './context/createNewContext';
import { DeleteDatasetProvider } from './context/deleteContext';

import palette from './palette';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>

      <DeleteDatasetProvider>
        <CreateNewButtonProvider>
          <CreateNewProjectProvider>
            <CreateNewTrainProvider>
              <CheckboxProvider>
                <SplitProvider>
                  <ButtonClickProvider>
                    <App palette={palette} />
                  </ButtonClickProvider>
                </SplitProvider>
              </CheckboxProvider>
            </CreateNewTrainProvider>
          </CreateNewProjectProvider>
        </CreateNewButtonProvider>

      </DeleteDatasetProvider>



    </BrowserRouter>
  </React.StrictMode>
);