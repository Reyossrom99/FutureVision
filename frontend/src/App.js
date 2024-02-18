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
import LoginPage from './pages/Login'
import RegisterPage from "./pages/Register";

import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  return (
    <div className="App">
      <AuthProvider>
      <SideNav></SideNav>
      <TopNav></TopNav>
      <main>
        <Routes>
          <Route path="/datasets" element = {<PrivateRoute><Datasets/></PrivateRoute>}/>
          <Route path="/datasets/:id" element={<DatasetsDetails/>} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/sign-up" element={<RegisterPage/>}></Route>
        </Routes>
      </main>
      </AuthProvider>
    </div>
  );
}

export default App;