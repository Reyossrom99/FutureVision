import React, { useContext, useState } from "react";
import Modal from 'react-modal';
import axios, { HttpStatusCode } from 'axios';
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const CreateSplitsDialog = ({ isOpen, onRequestClose, datasetId}) => {

    const [train, setTrain] = useState(70);
    const [validation, setValidation] = useState(20);
    const [test, setTest] = useState(10);

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAccept = async () => {
        
        if (train + validation + test !== 100) {
            alert("The sum of the splits must be 100");
            return;
        }
        
        try {
            const response = await fetch(`/datasets/${datasetId}/splits`, {
                method: 'PATCH', // Cambia 'POST' a 'PATCH'
                headers: {
                    'Content-Type': 'application/json',
                    // FormData establece el encabezado 'Content-Type' a 'multipart/form-data' automáticamente
                    'Authorization': 'Bearer ' + String(authContext.authTokens.access)
                },
                body: JSON.stringify({
                    trainNumber: train,
                    valNumber: validation,
                    testNumber: test
                }),
            });
    
            if (response.status == HttpStatusCode.Ok) {
                onRequestClose();
                navigate(`/dataset/${datasetId}`)
                            
            } else {
               
                const data = await response.json();
                console.log('Error:', data);
            }
        } catch (error) {
            console.log('Error creating dataset:', error);
        }
    };

    const handleTrainChange = (event) => {
        setTrain(event.target.value);
    }; 
    const handleValidationChange = (event) => {
        setValidation(event.target.value);
    }; 
    const handleTestChange = (event) => {
        setTest(event.target.value);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Form Modal"
            className={styles.formContent}
        >

            <form classname={styles.formElements}>

                <label>
                    Train:
                    <input type="number" value={train} onChange={handleTrainChange} min="0" max="100"/>
                </label>
                <label>
                    Validation:
                    <input type="number" value={validation} onChange={handleValidationChange} min="0" max="100"/>
                </label>
                <label>
                    Test:
                    <input type="number" value={test} onChange={handleTestChange} min="0" max="100"/>
                </label>

                <div class={styles.buttonContainer}>
                    <button type="button" onClick={onRequestClose}>Close</button>
                    <button type="button" onClick={() => handleAccept()}>Accept</button>

                </div>
            </form>
        </Modal>
    );
};

export default CreateSplitsDialog;