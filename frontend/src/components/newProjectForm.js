import React, {useState, useEffect, useContext} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, Title, Label, Select, ButtonContainer, CustomModal} from '../elements/formSyles';
import {Button} from '../elements/button';
import { Error } from '../elements/p';

const FormDialog = ({isOpen, onRequestClose}) => {
    const navigate = useNavigate();

    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [type, setType] = useState("bbox"); 
    const [datasets, setDatasets] = useState([]);
    const [SelectDataset, setSelectDataset] = useState(null);
    const [privacy, setSelectPrivacy] = useState("public"); 
    const [error, setError] = useState(null);  
    
    const { authTokens, logoutUser } = useContext(AuthContext);
    //request fro the avariable datasets to the backend
    useEffect(() => {
    getDatasets();
  }, []);
  const getDatasets = async () => {
    try {
      const response = await fetch(`http://localhost:4004/datasets?page=${0}`, {
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
        setError(error); 
    }
  };
    const handleAccept = async () => {
        setError(null); 
        const requestData = {
            name: name,
            description: description,
            type: type,
            is_public: privacy === 'public',
            dataset_id: SelectDataset
        };
    
        try {
            const response = await fetch('http://localhost:4004/projects/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Indica que estás enviando datos en formato JSON
                    'Authorization': 'Bearer ' + String(authTokens.access)
                },
                body: JSON.stringify(requestData) // Convierte los datos a formato JSON
            });
    
            if (response.ok) {
                onRequestClose();
                navigate('/projects');
            } else {
                const data = await response.json();
                setError(data.error); 
            }
        } catch(error) {
           setError(error);
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
        <CustomModal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form Modal"
        >
           
            <Form>
            <Title>Create new project</Title>

            <Label htmlFor="name">Name</Label>
            <Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)}/>
    
            <Label htmlFor="description">Description</Label>
            <Input type="text"  name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
    
            <Label htmlFor='dataset' >Select an exiting dataset</Label>
            <Select htmlFor='dataset-select'  onChange={handleDatasetChange}>
                <option value={null}>
	    	</option>
                {datasets.map((dataset) => (
                <option key={dataset.dataset_id} value={dataset.dataset_id}>
                    {dataset.name}
                </option>
                ))}
            </Select>

            <Label htmlFor='privacy' >Select a privacy option </Label>
      
            <Select htmlFor='privacy-select'  onChange={handlePrivacyChange}>
                <option value="public">public</option>
                <option value="private">private</option>
            </Select>  

	    <ButtonContainer>
            <Button type="button" onClick={onRequestClose}>Close</Button>
            <Button type="button" onClick={() => handleAccept()}>Accept</Button>
            </ButtonContainer>
            </Form>
            <div>
            {error ? (
                            <Error style={{ color: 'red' }}>{error}</Error> 

                            ) : <div><p></p></div>
                        }
            </div>
        </CustomModal>
    ); 
};
export default FormDialog; 
