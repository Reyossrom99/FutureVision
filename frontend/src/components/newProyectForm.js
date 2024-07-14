import React, {useState, useEffect, useContext} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const FormDialog = ({isOpen, onRequestClose}) => {
    const navigate = useNavigate();

    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [type, setType] = useState("bbox"); 
    const [datasets, setDatasets] = useState([]);
    const [selectDataset, setSelectDataset] = useState(null);
    const [privacy, setSelectPrivacy] = useState("public"); 

    
    const { authTokens, logoutUser } = useContext(AuthContext);
    //request fro the avariable datasets to the backend
    useEffect(() => {
    getDatasets();
  }, []);
  const getDatasets = async () => {
    try {
      const response = await fetch('http://localhost:8000/datasets', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + String(authTokens.access)
        }
      });
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets);
      } else if (response.status === 401) {
        logoutUser();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
    const handleAccept = async () => {
        const requestData = {
            name: name,
            description: description,
            type: type,
            is_public: privacy === 'public',
            dataset_id: selectDataset
        };
    
        try {
            const response = await fetch('http://localhost:8000/proyects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que estás enviando datos en formato JSON
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(requestData) // Convierte los datos a formato JSON
            });
    
            if (response.ok) {
                onRequestClose();
                navigate('/proyects');
            } else {
                const data = await response.json();
                console.log('Error:', data); // Manejar el error si es necesario
            }
        } catch(error) {
            console.error('Error creating proyect:', error);
        }
    };

    const handleTypeChange = (e) => {
  
        setType(e.target.value);
 
    };
    const handleDatasetChange = (e) => {
  
        setSelectDataset(e.target.value);
 
    };
    const handlePrivacyChange = (e) => {
        setSelectPrivacy(e.target.value)
    }
    
    return (
        <Modal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form Modal"
        className={styles.formContent}
        >
           
            <form classname={styles.formElements}>
            <h2 id={styles.headerLabel}>Create new proyect</h2> <br></br>
            <label htmlFor="name" id={styles.nameLabel}>Name</label><br></br><br></br>
            <input type="text" id={styles.nameInput} name="name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
    
            <label htmlFor="description" id ={styles.descriptionLabel}>Description</label><br></br><br></br>
            <input type="text" id={styles.descriptionInput} name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />
    
            <label htmlFor='type' id={styles.typeLabel}>Select the dataset label type</label>
            <select htmlFor='type-select' id={styles.typeInput} onChange={handleTypeChange}>
                <option value="bbox">bbox</option>
                <option value="mask">mask</option>
                <option value="mask+bbox"> mask + bbox</option>
            </select> <br /><br/> 
    
    
            <label htmlFor='dataset' id={styles.typeLabel}>Select an exiting dataset</label>
            <select htmlFor='dataset-select' id={styles.typeInput} onChange={handleDatasetChange}>
                <option value={null}>
	    	</option>
                {datasets.map((dataset) => (
                <option key={dataset.dataset_id} value={dataset.dataset_id}>
                    {dataset.name}
                </option>
                ))}
            </select><br /><br/> 

            <label htmlFor='privacy' id={styles.typeLabel}>Select a privacy option </label>
      
            <select htmlFor='privacy-select' id={styles.typeInput} onChange={handlePrivacyChange}>
                <option value="public">public</option>
                <option value="private">private</option>
            </select> <br /><br/> 

            <div class={styles.buttonContainer}>
            <button type="button" onClick={onRequestClose}>Close</button>
            <button type="button" onClick={() => handleAccept()}>Accept</button>
            </div>
            </form>
        </Modal>
    ); 
};
export default FormDialog; 
