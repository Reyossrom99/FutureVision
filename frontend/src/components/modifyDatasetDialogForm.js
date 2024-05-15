import React, { useContext, useState } from "react";
import Modal from 'react-modal';
import axios, { HttpStatusCode } from 'axios';
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';

const ModifyDatasetDialog = ({ isOpen, onRequestClose, privacy, description, id}) => {

    const [setDescription, setDescriptionModify] = useState(description);
    const [privacyModify, setPrivacyModify] = useState(privacy);
    const fields = []
    const values = []
    const authContext = useContext(AuthContext);

    const handleAccept = async () => {
        
        if (description !== setDescription) {
            fields.push('description')
            values.push(setDescription)
        }
        if (privacy !== privacyModify) {
            fields.push('privacy')
            values.push(privacy === 'public') // 'privacy' es un booleano
        } 
        try {
            const response = await fetch(`dataset/${id}`, {
                method: 'PATCH', // Cambia 'POST' a 'PATCH'
                headers: {
                    // No establecer 'Content-Type': 'application/json' aquí
                    // FormData establece el encabezado 'Content-Type' a 'multipart/form-data' automáticamente
                    'Authorization': 'Bearer ' + String(authContext.authTokens.access)
                },
                body: JSON.stringify({
                    fields: fields,
                    values: values,
                }),
            });
    
            if (response.status == HttpStatusCode.Created) {
                onRequestClose();
                setIsLoaded(true);
                navigate(`/dataset/${id}`)
            } else {
                setIsLoaded(true);
                const data = await response.json();
                console.log('Error:', data);
            }
        } catch (error) {
            setIsLoaded(true);
            console.log('Error creating dataset:', error);
        }
    };

    const handlePrivacyChange = (e) => {
        setPrivacyModify(e.target.value)
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Form Modal"
            className={styles.formContent}
        >

            <form classname={styles.formElements}>

                <label htmlFor="description" id={styles.descriptionLabel}>Description</label><br></br><br></br>
                <input type="text" id={styles.descriptionInput} name="description" value={setDescription} onChange={(e) => setDescriptionModify(e.target.value)} /><br /><br />


                <label htmlFor="privacy" id={styles.formatLabel}>Select how you want to share the dataset</label>
                <select htmlFor="privacy-select" id={styles.formatInput} onChange={handlePrivacyChange} value={privacyModify}>
                    <option value="private"> Private </option>
                    <option value="public"> Public</option>
                </select><br /><br />
                <div class={styles.buttonContainer}>
                    <button type="button" onClick={onRequestClose}>Close</button>
                    <button type="button" onClick={() => handleAccept()}>Accept</button>

                </div>
            </form>
        </Modal>
    );
};

export default ModifyDatasetDialog;