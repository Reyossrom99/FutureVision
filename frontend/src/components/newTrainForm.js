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
    const[noWeights, setNoWeights] = useState(false); 

    
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
	   weigths: weigths
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
    const handleCfgChaneg = (e) => {
    	setCfg(e.target.value); 
    }; 

   const handleNoWeigthsChange = () => {
	   setNoWeights(!noWeights); 
   }; 
    
    
    return (
        <CustomModal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form CustomModal"
        >
           
            <Form>
            <Title >Create train</Title>
            

            <Label for="imgSize"> Image size  train (min 32x32) </Label>
            <Input type="number" id="imgSize" name="imgSize" min="32" onChange={(e) => setImgSizeTrain(e.target.value)}/>

	    <Label for="imgSize"> Image size test(min 32x32) </Label>
            <Input type="number" id="imgSize" name="imgSize" min="32" onChange={(e) => setImgSizeTest(e.target.value)}/>

	     <Label for="batch"> Batch size </Label>
            <Input type="number" id="batch" name="batch" min="1" onChange={(e) => setBatch(e.target.value)}/>

	    <Label for="workers"> Workers </Label>
            <Input type="number" id="workers" name="workers" min="1" onChange={(e) => setWorkers(e.target.value)}/>

	
            <Label for="epochs"> Epochs(min 1) </Label>
            <Input type="number" id="epochs" name="epochs" min="1" onChange={(e) => setEpochs(e.target.value)}/>

            <Label htmlFor="testOption">Run test only on final epoch:</Label>
            <Select id="testOption" value={noTest} onChange={handleNoTestChange}>
                <option value="False">True</option>
                <option value="True">False</option>
            </Select>


	   <Label htmlFor="cfg">Model architecture </Label>
            <Select id="cfg" value={cfg} onChange={handleCfgChange}>
                <option value="yolov7">yolov7</option>
                <option value="yolov7-e6e">yolov7-e6e</option>
	        <option value="yolov7-e6">yolov7-e6</option>
	    	<option value="yolov7-d6">yolov7-d6</option>
	    	<option value="yolov7-tiny">yolov7-tiny</option>
	    	<option value="yolov7-w6">yolov7-w6</option>
	    	<option value="yolov7x">yolov7x</option>
            </Select> 

	    <Checkbox
	    	type="checkbox"
	    	checked={noweigths}
	    	onChange={handleNoWeigthsChange}> No weights </Checkbox>

            <ButtonContainer>
            <Button type="button" onClick={onRequestClose}>Close</Button>
            <Button type="button" onClick={() => handleAccept()}>Accept</Button>
            </ButtonContainer>
            </Form>
        </CustomModal>
    ); 
};
export default NewTrainForm; 
