import React, {useState, useEffect, useContext} from "react";
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, Title, Label, Select, ButtonContainer, CustomModal} from '../elements/formSyles';
import {Button} from '../elements/button';


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
                    'Content-Type': 'application/json', // Indica que estás enviando datos en Formato JSON
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(requestData) // Convierte los datos a Formato JSON
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
        <CustomModal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form CustomModal"
        >
           
            <Form>
            <Title >Create train</Title>
            
            <Label for="batchSize"> Batch size (min 1) </Label>
            <Input type="number" id="batchSize" name="batchSize" min="1" onChange={(e) => setBatchSize(e.target.value)}/><br /><br />
            
            <Label for="imgSize"> Image size (min 32x32) </Label>
            <Input type="number" id="imgSize" name="imgSize" min="32" onChange={(e) => setImgSize(e.target.value)}/><br /><br />

            <Label for="epochs"> Epochs(min 1) </Label>
            <Input type="number" id="epochs" name="epochs" min="1" onChange={(e) => setEpochs(e.target.value)}/><br /><br />

            <Label htmlFor="testOption">Run test only on final epoch:</Label>
            <Select id="testOption" value={noTest} onChange={handleNoTestChange}>
                <option value="False">True</option>
                <option value="True">False</option>
            </Select>


            <ButtonContainer>
            <Button type="button" onClick={onRequestClose}>Close</Button>
            <Button type="button" onClick={() => handleAccept()}>Accept</Button>
            </ButtonContainer>
            </Form>
        </CustomModal>
    ); 
};
export default NewTrainForm; 
