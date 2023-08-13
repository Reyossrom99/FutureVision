import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import './App.css';
import SideNav from './components/SideNav'; 
import Datasets from './pages/Datasets';


function App() {
  return (
    <div className="App">
      <SideNav/>
      <main>
        <Routes>
          <Route path="/datasets" element = {<Datasets/>}/>
          {/* <Route path="/models" element = {<Models/>}/>
          <Route path="/statistics" element = {<Statistics/>}/>
          <Route path="/settings" element = {<Settings/>}/> */}
        </Routes>
      </main>
     
    </div>
  );
}

export default App;