import React, {useState, useEffect, useContext} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const NewTrainForm = ({isOpen, onRequestClose, proyectId}) => {
    const navigate = useNavigate();

    const [batchSize, setBatchSize] = useState(1); 
    const [imgSize, setImgSize] = useState(32); 
    const [epochs, setEpochs] = useState(1); 
    const [noTest, setNoTest] = useState(false); 
    
    const { authTokens, logoutUser } = useContext(AuthContext);
  

    const handleAccept = async () => {
        const requestData = {
           batchSize: batchSize, 
           imgSize : imgSize, 
           epochs : epochs, 
           noTest: noTest
        };
       
        try {
            const response = await fetch(`/proyects/${proyectId}/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que estás enviando datos en formato JSON
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(requestData) // Convierte los datos a formato JSON
            });
    
            if (response.ok) {
                onRequestClose();
                navigate(`/proyect/${proyectId}`);
            } else {
                const data = await response.json();
                console.log('Error:', data); // Manejar el error si es necesario
            }
        } catch(error) {
            console.error('Error creating proyect:', error);
        }
    };

    const handleNoTestChange = (e) => {
        setNoTest(e.target.value === "True");
    };
    
    
    return (
        <Modal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form Modal"
        className={styles.formContent}
        >
           
            <form classname={styles.formElements}>
            <h2 id={styles.headerLabel}>Create train</h2> <br></br>
            
            <label for="batchSize"> Batch size (min 1) </label>
            <input type="number" id="batchSize" name="batchSize" min="1" onChange={(e) => setBatchSize(e.target.value)}/><br /><br />
            
            <label for="imgSize"> Image size (min 32x32) </label>
            <input type="number" id="imgSize" name="imgSize" min="32" onChange={(e) => setImgSize(e.target.value)}/><br /><br />

            <label for="epochs"> Epochs(min 1) </label>
            <input type="number" id="epochs" name="epochs" min="1" onChange={(e) => setEpochs(e.target.value)}/><br /><br />

            <label htmlFor="testOption">Run test only on final epoch:</label>
            <select id="testOption" value={noTest} onChange={handleNoTestChange}>
                <option value="False">True</option>
                <option value="True">False</option>
            </select>


            <div class={styles.buttonContainer}>
            <button type="button" onClick={onRequestClose}>Close</button>
            <button type="button" onClick={() => handleAccept()}>Accept</button>
            </div>
            </form>
        </Modal>
    ); 
};
export default NewTrainForm; 