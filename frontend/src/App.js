import {
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import './App.css';
import SideNav from './components/SideNav'; 
import TopNav from "./components/topNav";
import Datasets from './pages/Datasets';
import DatasetsDetails from './pages/DatasetsDetails'
import LoginPage from './pages/Login'
import RegisterPage from "./pages/Register";
import Profile from "./pages/profile";
import AddUserPage from "./pages/newUser";

import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'

function App() {
  const location = useLocation();
  return (
    
    <div className="App">
      <AuthProvider>
      {location.pathname !== '/register' && <PrivateRoute><SideNav /></PrivateRoute>}
      <TopNav></TopNav>
      <main>
        <Routes>
          <Route path="/datasets" element = {<PrivateRoute><Datasets/></PrivateRoute>}/>
          <Route path="/datasets/:id" element={<DatasetsDetails/>} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/profile" element = {<PrivateRoute><Profile/></PrivateRoute>}/>
          <Route path="/new-user" element = {<PrivateRoute><AddUserPage/></PrivateRoute>}/>
        </Routes>
      </main>
      </AuthProvider>
    </div>
  );
}

export default App;