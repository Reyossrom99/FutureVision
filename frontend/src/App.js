import {
  BrowserRouter,
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
import NewUser from "./pages/newUser";
import ViewUsers from "./pages/viewUsers";
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import AuthContext from "./context/AuthContext";
import Proyects from './pages/Proyects'
import { useEffect } from "react";
function App() {
  const location = useLocation();

  return (
    <div className="App">
    
        <AuthProvider>
          {location.pathname !== '/sign-up' && <PrivateRoute><SideNav /></PrivateRoute>}
          <TopNav />
          <main>
            <Routes>
              <Route path="/datasets" element={<PrivateRoute><Datasets /></PrivateRoute>} />
              <Route path="/datasets/:id" element={<PrivateRoute><DatasetsDetails /></PrivateRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/sign-up" element={<RegisterPage />} />
              <Route path="/user" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/user/add" element={<PrivateRoute><NewUser /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute><ViewUsers /></PrivateRoute>} />
              <Route path="/projects" element={<PrivateRoute><Proyects /></PrivateRoute>} />
            </Routes>
          </main>
        </AuthProvider>
    
    </div>
  );
}

export default App;