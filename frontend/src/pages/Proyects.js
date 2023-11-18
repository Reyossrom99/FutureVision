import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 
import styles from './proyects.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewButtonContext } from '../context/createNewContext';
import FormDialog from '../components/newProyectForm';

function Proyects(){
    const [proyects, setProyects] = useState([]); 
    const {isDialogOpen, handleCloseDialog} = useCreateNewButtonContext(); 


    useEffect(() => {
        axios.get('/proyects/')
        .then(response => setProyects(response.data))
        .catch(error => console.error(error))
    }, []); 
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentContainer}>
                <h1 className={styles.pageName}>PROYECTS</h1>
                <div className={styles.proyectsContainer}>
                    {proyects.length > 0 ? (
                        proyects.map(proyect =>(
                            <Link to={`/proyects/${proyect.id}`} key={proyect.id} className={styles.proyectCardLink}>
                                <div className={styles.proeyectCard} key={proyect.id}>
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