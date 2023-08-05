import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import './App.css';
import SideNav from './components/SideNav'; 
import Models from './pages/Models';
import Datasets from './pages/Datasets';
import Settings from './pages/Settings';
import Statistics from './pages/Statistics';

function App() {
  return (
    <div className="App">
      <SideNav/>
      <main>
        <Routes>
          <Route path="/datasets" element = {<Datasets/>}/>
          <Route path="/models" element = {<Models/>}/>
          <Route path="/statistics" element = {<Statistics/>}/>
          <Route path="/settings" element = {<Settings/>}/>
        </Routes>
      </main>
     
    </div>
  );
}

export default App;