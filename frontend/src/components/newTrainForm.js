import React, {useState, useEffect, useContext} from "react";
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, Title, Label, Select, ButtonContainer, CustomModal, Checkbox} from '../elements/formSyles';
import {Button} from '../elements/button';


const NewTrainForm = ({isOpen, onRequestClose, proyectId}) => {
    const navigate = useNavigate();

    const [imgSizeTrain, setImgSizeTrain] = useState(640); 
    const [imgSizeTest, setImgSizeTest] = useState(640); 
    const [epochs, setEpochs] = useState(300); 
    const [noTest, setNoTest] = useState(false); 
    const [batch, setBatch] = useState(16); 
    const [workers, setWorkers] = useState(8); 
    const [cfg, setCfg] = useState("yolov7"); 
    const[noWeights, setNoWeights] = useState(true); 

    
    const { authTokens, logoutUser } = useContext(AuthContext);
  

    const handleAccept = async () => {
        const requestData = {
           imgSizeTrain: imgSizeTrain, 
	   imgSizeTest: imgSizeTest,
	   batch : batch, 
           epochs : epochs, 
           noTest: noTest, 
	   workers: workers, 
	   cfg: cfg, 
	   weights: noWeights ? 1 : 0       
	};
       
        try {
            const response = await fetch(`http://localhost:8000/proyects/${proyectId}/queue`, {
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
    const handleCfgChange = (e) => {
    	setCfg(e.target.value); 
    }; 

   const handleNoWeigthsChange = (e) => {
	   setNoWeights(e.target.checked);
  }; 
    
    
    return (
        <CustomModal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form CustomModal"
        >
           
            <Form>
            <Title >Create train</Title>
            

            <Label for="imgSizeTrain"> Image size  train  </Label>
            <Input type="number" id="imgSizeTrain" name="imgSizeTrain" min="32" value={imgSizeTrain} onChange={(e) => setImgSizeTrain(e.target.value)}/>

	    <Label for="imgSizeTest"> Image size test</Label>
            <Input type="number" id="imgSizeTest" name="imgSizeTest" min="32" value={imgSizeTest} onChange={(e) => setImgSizeTest(e.target.value)}/>

	     <Label for="batch"> Batch size </Label>
            <Input type="number" id="batch" name="batch" min="1" value={batch}onChange={(e) => setBatch(e.target.value)}/>

	    <Label for="workers"> Workers </Label>
            <Input type="number" id="workers" name="workers" min="1" value={workers} onChange={(e) => setWorkers(e.target.value)}/>

	
            <Label for="epochs"> Epochs</Label>
            <Input type="number" id="epochs" name="epochs" min="1"  value={epochs} onChange={(e) => setEpochs(e.target.value)}/>

            <Label >Run test only on final epoch</Label>
            <Select id="testOption" value={noTest} onChange={handleNoTestChange}>
                <option value="False">True</option>
                <option value="True">False</option>
            </Select>


	   <Label >Model architecture </Label>
            <Select id="cfg" value={cfg} onChange={handleCfgChange}>
                <option value="yolov7">yolov7</option>
                <option value="yolov7-e6e">yolov7-e6e</option>
	        <option value="yolov7-e6">yolov7-e6</option>
	    	<option value="yolov7-d6">yolov7-d6</option>
	    	<option value="yolov7-tiny">yolov7-tiny</option>
	    	<option value="yolov7-w6">yolov7-w6</option>
	    	<option value="yolov7x">yolov7x</option>
            </Select> 
	   
	    <Label> No weights </Label>
	    <Checkbox
	    	type="checkbox"
	    	checked={!noWeights}
	    	onChange={handleNoWeigthsChange}/> 
	

            <ButtonContainer>
            <Button type="button" onClick={onRequestClose}>Close</Button>
            <Button type="button" onClick={() => handleAccept()}>Accept</Button>
            </ButtonContainer>
            </Form>
        </CustomModal>
    ); 
};
export default NewTrainForm; 
