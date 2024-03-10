import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import {CheckboxProvider } from './context/checkboxShowLabelContext'; 
import { SplitProvider } from './context/selectSplitViewContext';
import { ButtonClickProvider} from './context/createSplitsContext';
import { CreateNewButtonProvider, CreateNewProjectProvider} from './context/createNewContext'; 
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
    
      <CreateNewButtonProvider>
      <CreateNewProjectProvider>
      <CheckboxProvider>
      <SplitProvider>
      <ButtonClickProvider>
        <App />
        
      </ButtonClickProvider>
      </SplitProvider>
      </CheckboxProvider>
      </CreateNewProjectProvider>
      </CreateNewButtonProvider>
     

    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
