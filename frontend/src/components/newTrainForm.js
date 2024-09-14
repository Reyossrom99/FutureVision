import React, {useState, useContext} from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input,  Title, Label, Select, ButtonContainer, CustomModal, Checkbox} from '../elements/formSyles';
import {Button} from '../elements/button';
import { Error } from '../elements/p';

const NewTrainForm = ({isOpen, onRequestClose, projectId}) => {
    const navigate = useNavigate();

    const [imgSizeTrain, setImgSizeTrain] = useState(640); 
    const [imgSizeTest, setImgSizeTest] = useState(640); 
    const [epochs, setEpochs] = useState(300); 
    const [noTest, setNoTest] = useState(false); 
    const [batch, setBatch] = useState(16); 
    const [workers, setWorkers] = useState(8); 
    const [cfg, setCfg] = useState("yolov7"); 
    const [error, setError] = useState(null);  
    
    const { authTokens, logoutUser } = useContext(AuthContext);
  

    const handleAccept = async () => {
        setError(null); 
        const requestData = {
           imgSizeTrain: imgSizeTrain, 
	   imgSizeTest: imgSizeTest,
	   batch : batch, 
           epochs : epochs, 
           noTest: noTest, 
	   workers: workers, 
	   cfg: cfg, 
	     
	};
       
        try {
            const response = await fetch(`http://localhost:4004/projects/${projectId}/queue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que estás enviando datos en Formato JSON
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(requestData) // Convierte los datos a Formato JSON
            });
    
            if (response.ok) {
                onRequestClose();
                navigate(`/project/${projectId}`);
            } else {
                const data = await response.json();
                setError(data.error)
            }
        } catch(error) {
            setError(error)

        }
    };

    const handleNoTestChange = (e) => {
	if (e.target.value === "false"){
		setNoTest(false); 
	}
	else {
		setNoTest(true); 
	}
    };
    const handleCfgChange = (e) => {
    	setCfg(e.target.value); 
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
            <Select id="testOption" value={noTest.toString()} onChange={handleNoTestChange}>
	    	console.log(noTest.toString()); 
                <option value="false">True</option>
                <option value="true">False</option>
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
	   
	   
            <ButtonContainer>
            <Button type="button" onClick={onRequestClose}>Close</Button>
            <Button type="button" onClick={() => handleAccept()}>Accept</Button>
            </ButtonContainer>
            <div>
            {error ? (
                            <Error style={{ color: 'red' }}>{error}</Error> 

                            ) : <div><p></p></div>
                        }
            </div>
            </Form>
        </CustomModal>
    ); 
};
export default NewTrainForm; 
