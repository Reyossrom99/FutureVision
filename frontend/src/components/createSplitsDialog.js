import React, { useContext, useState } from "react";
import Modal from 'react-modal';
import axios, { HttpStatusCode } from 'axios';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, Title, Label, Select, ButtonContainer, CustomModal} from '../elements/formSyles';
import {Button} from '../elements/button'; 
import {useCreateSplitContext} from '../context/createSplitsContext';
import {useTypeContext} from '../context/typeContext';


const CreateSplitsDialog = ({ isOpen, onRequestClose, datasetId}) => {

    const [train, setTrain] = useState(70);
    const [validation, setValidation] = useState(20);
    const [test, setTest] = useState(10);
    const {setReloadDataset} = useCreateSplitContext();
    const {setType} = useTypeContext();

    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAccept = async () => {
        
        if (train + validation + test !== 100) {
            alert("The sum of the splits must be 100");
            return;
        }
        
        try {
            const response = await fetch(`http://localhost:4004/datasets/${datasetId}/splits`, {
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
		//navigate(`/dataset/${datasetId}`)
		setReloadDataset(true);
		setType("splits");
                            
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
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Form Modal"
        >

            <Form>
		
		<Title>
		New Splits
		</Title>

                <Label>
                    Train
		</Label>
                <Input type="number" value={train} onChange={handleTrainChange} min="0" max="100"/>

                <Label>
                    Validation
		</Label>
                <Input type="number" value={validation} onChange={handleValidationChange} min="0" max="100"/>

                 <Label>
                    Test
		</Label>
                <Input type="number" value={test} onChange={handleTestChange} min="0" max="100"/>
                
                <ButtonContainer>
                    <Button type="button" onClick={onRequestClose}>Close</Button>
                    <Button type="button" onClick={() => handleAccept()}>Accept</Button>

                </ButtonContainer>
            </Form>
        </CustomModal>
    );
};

export default CreateSplitsDialog;
