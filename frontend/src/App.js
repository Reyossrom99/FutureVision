import {
	Routes,
	Route,
	useLocation
} from "react-router-dom";
import SideNav from './components/SideNav';
import TopNav from "./components/topNav";
import Datasets from './pages/Datasets';
import DatasetsDetails from './pages/DatasetsDetails'
import LoginPage from './pages/login'
import SignupPage from "./pages/signup";
import Profile from "./pages/profile";
import NewUser from "./pages/newUser";
import ViewUsers from "./pages/viewUsers";
import PrivateRoute from './utils/PrivateRoute'
import { AuthProvider } from './context/AuthContext'
import projectDetails from './pages/projectDetails'
import projects from './pages/projects';

import styled from "styled-components";
import palette from "./palette";

const Container = styled.div`
  background-color: ${props => props.palette.neutralWhite};
  font-family: 'Roboto', sans-serif;
  min-height: 100vh;
  font-size: 16px;
`;


function App() {
	const location = useLocation();

	return (
		<div className="App">
			<Container palette={palette}>
				<AuthProvider>
					{!(location.pathname === '/login' || location.pathname === '/signup') && <PrivateRoute><TopNav /></PrivateRoute>}
					<main>
						<Routes>
							<Route path="/datasets" element={<PrivateRoute><Datasets /></PrivateRoute>} />
							<Route path="/dataset/:id" element={<PrivateRoute><DatasetsDetails /></PrivateRoute>} />
							<Route path="/login" element={<LoginPage />} />
							<Route path="/signup" element={<SignupPage />} />
							<Route path="/user" element={<PrivateRoute><Profile /></PrivateRoute>} />
							<Route path="/user/add" element={<PrivateRoute><NewUser /></PrivateRoute>} />
							<Route path="/users" element={<PrivateRoute><ViewUsers /></PrivateRoute>} />
							<Route path="/projects" element={<PrivateRoute><projects /></PrivateRoute>} />
							<Route path="/project/:id" element={<PrivateRoute><projectDetails /></PrivateRoute>} />
						</Routes>
					</main>
				</AuthProvider>
			</Container>

		</div>
	);
}

export default App;
