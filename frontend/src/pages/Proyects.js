import React, {useEffect, useState, useContext} from 'react'; 
import axios from 'axios'; 
import styles from './proyects.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewProjectContext } from '../context/createNewContext';
import FormDialog from '../components/newProyectForm';
import AuthContext from '../context/AuthContext';

function Proyects(){
    const [proyects, setProyects] = useState([]); 
    const {isDialogOpen, handleCloseDialog} = useCreateNewProjectContext(); 
    const { authTokens, logoutUser} = useContext(AuthContext);

    useEffect(() => {
        // axios.get('/proyects/')
        // .then(response => setProyects(response.data))
        // .catch(error => console.error(error))
        getProyects(); 
    }, []); 
    const getProyects = async () => {
        try {
            const response = await fetch('/proyects', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens.access)
              }
            });
            if (response.ok) {
              const data = await response.json();
              setProyects(data);
            } else if (response.status === 401) {
              logoutUser();
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
    };
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h1 className={styles.pageName}>PROYECTS</h1>
                <div className={styles.proyectsContainer}>
                    {proyects.length > 0 ? (
                        proyects.map(proyect =>(
                            <Link to={`/proyects/${proyect.proyect_id}`} key={proyect.proyect_id} className={styles.proyectCardLink}>
                                <div className={styles.proeyectCard} key={proyect.proyect_id}>
                                    <div className={styles.proyectInfo}>
                                        <h2 className={styles.proyectName}>{proyect.name}</h2>
                                        <p className={styles.proyectDescription}>{proyect.description}</p>
                                        <p className={styles.proyectDescription}>{proyect.start_date}</p>
                                    </div>
                                </div>
                            </Link>
                            
                        ))
                    ) : (
                        <p>No proyects created</p>
                    )}
                </div>
                <FormDialog isOpen={isDialogOpen} onRequestClose={handleCloseDialog}/>
            </div>
        </div>
    );
}
export default Proyects; 