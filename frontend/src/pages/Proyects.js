import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 
import styles from './proyects.module.css'
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useCreateNewButtonContext } from '../context/createNewContext';
import FormDialog from '../components/newProyectForm';

function Proyects(){
    const [proyects, setProyects] = useState([]); 
    const {isDialogOpen, handleCloseDialog} = useCreateNewButtonContext(); 
    // const [formData, setFormData] = useState({
    //     name: '',
    //     description: '',
    //     type: 'bbox',
    //     selectDataset: ''
    // });
    // const handleAccept = async () => {
    //     // Your existing code for making the POST request
    //     try {
    //         const csrfToken = window.csrfToken;
    //         const uploadData = new FormData();
    //         uploadData.append('name', formData.name);
    //         uploadData.append('description', formData.description);
    //         uploadData.append('type', formData.type); 
    //         uploadData.append('dataset_id', formData.selectDataset); 
           
            
    //         const response = await axios.post('/proyects/create/', uploadData, {
    //             headers: {
    //                 'X-CSRFToken': csrfToken,
    //             },
    //         });
    //         console.log(response);
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

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
                        <p>Proyects page</p>
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