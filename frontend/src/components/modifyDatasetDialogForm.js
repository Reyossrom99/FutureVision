import React, { useContext, useState } from "react";
import Modal from 'react-modal';
import axios, { HttpStatusCode } from 'axios';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, ErrorMessage, LinkForm, Title, Label, CustomModal, Select, ButtonContainer} from '../elements/formSyles';
import {Button} from '../elements/button';

const ModifyDatasetDialog = ({ isOpen, onRequestClose, privacy, description, datasetId}) => {

    const [setDescription, setDescriptionModify] = useState(description);
    const [privacyModify, setPrivacyModify] = useState(privacy);
    const fields = []
    const values = []
    const authContext = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAccept = async () => {
        fields.length = 0
        values.length = 0
        if (description !== setDescription) {
            
            fields.push('description')
            values.push(setDescription)
        }
        if (privacy !== privacyModify) {
           
            fields.push('privacy')
            values.push(privacyModify === 'public') // 'privacy' es un booleano
        } 
        try {
            const response = await fetch(`http://localhost:4004/datasets/${datasetId}`, {
                method: 'PATCH', // Cambia 'POST' a 'PATCH'
                headers: {
                    'Content-Type': 'application/json',
                    // FormData establece el encabezado 'Content-Type' a 'multipart/form-data' automáticamente
                    'Authorization': 'Bearer ' + String(authContext.authTokens.access)
                },
                body: JSON.stringify({
                    fields: fields,
                    values: values,
                }),
            });
    
            if (response.status == HttpStatusCode.Ok) {
                onRequestClose();
                navigate(`/dataset/${datasetId}`)
                fields.length = 0
                values.length = 0
            } else {
               
                const data = await response.json();
                console.log('Error:', data);
            }
        } catch (error) {
            console.log('Error creating dataset:', error);
        }
    };

    const handlePrivacyChange = (e) => {
        setPrivacyModify(e.target.value)
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Form Modal"
                   >

            <Form>
		<Title>Modify Dataset</Title>
                <Label htmlFor="description" >Description</Label>       
		<Input type="text" name="description" value={setDescription} onChange={(e) => setDescriptionModify(e.target.value)} />

                <Label htmlFor="privacy" >Select how you want to share the dataset</Label>
                <Select htmlFor="privacy-select"  onChange={handlePrivacyChange} value={privacyModify}>
                    <option value="private"> Private </option>
                    <option value="public"> Public</option>
                </Select>      
		<ButtonContainer>
                    <Button type="button" onClick={onRequestClose}>Close</Button>
                    <Button type="button" onClick={() => handleAccept()}>Accept</Button>

                </ButtonContainer>
            </Form>
        </CustomModal>
    );
};

export default ModifyDatasetDialog;
