import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import './App.css';
import SideNav from './components/SideNav'; 
import TopNav from "./components/topNav";
import Datasets from './pages/Datasets';
import DatasetsDetails from './pages/DatasetsDetails'


function App() {
  return (
    <div className="App">
      <SideNav></SideNav>
      <TopNav></TopNav>
      <main>
        <Routes>
          <Route path="/datasets" element = {<Datasets/>}/>
          <Route path="/datasets/:id" element={<DatasetsDetails/>} />
       
        </Routes>
      </main>
     
    </div>
  );
}

export default App;