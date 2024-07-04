import React, { useContext, useState } from "react";
import Modal from 'react-modal';
import axios, { HttpStatusCode } from 'axios';
import AuthContext from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import {Form, Input, SubmitInput, Title, Label, Select, ButtonContainer, CustomModal} from '../elements/formSyles';
import {Button} from '../elements/button';

const FormDialog = ({ isOpen, onRequestClose }) => {
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    // const [cover, setCover] = useState(); 
    const [dir, setDir] = useState(); //set the url directory of the dataset
    const [type, setType] = useState("splits");
    const [format, setFormat] = useState("yolo");
    const [privacy, setPrivacy] = useState("private");
    const [isLoaded, setIsLoaded] = useState(true);

    const authContext = useContext(AuthContext);

    const handleAccept = async () => {
        setIsLoaded(false);
        const uploadData = new FormData();
        uploadData.append('name', name);
        uploadData.append('description', description);
        uploadData.append('url', dir); // 'dir' es el objeto File
        uploadData.append('type', type);
        uploadData.append('format', format);
        uploadData.append('privacy', privacy === 'public');
        
        try {
            const response = await fetch('/datasets/', {
                method: 'POST',
                headers: {
                    // No establecer 'Content-Type': 'application/json' aquí
                    // FormData establece el encabezado 'Content-Type' a 'multipart/form-data' automáticamente
                    'Authorization': 'Bearer ' + String(authContext.authTokens.access)
                },
                body: uploadData
            });
            if (response.status == HttpStatusCode.Created) {
                onRequestClose();
                setIsLoaded(true);
                navigate('/datasets')
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

    const handleDirectoryInput = (e) => {
        const directoryUrl = e.target.files[0];
        if (directoryUrl) {
            console.log(directoryUrl);
            //set the cover
            //DEBUG
            setDir(directoryUrl);

        }
        else {
            console.log("Input a directory url");
        }
    };

    const handleTypeChange = (e) => {
        setType(e.target.value);
       
    };

    const handleFormatChange = (e) => {
        setFormat(e.target.value);
    };
    const handlePrivacyChange = (e) => {
        setPrivacy(e.target.value)
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Form Modal"
        >

            <Form >
                <Title> Create new dataset </Title> 

		<Label htmlFor="name" >Name</Label>               
		<Input type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />

                <Label htmlFor="description" >Description</Label> 
		<Input type="text" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />

                <Label htmlFor='type' >Select the type of the dataset</Label>
                <Select htmlFor='type-select'  onChange={handleTypeChange}>
                    <option value="splits"> splits created</option>
                    <option value="no-splits"> no splits</option>
                </Select> 

                <Label htmlFor="format">Select the format of the dataset</Label>
                <Select htmlFor="format-select" onChange={handleFormatChange}>
                    <option value="yolo"> Yolo </option>
                    <option value="coco"> CoCo</option>
                </Select>

                <Label htmlFor="privacy" >Select how you want to share the dataset</Label>
                <Select htmlFor="privacy-select"  onChange={handlePrivacyChange}>
                    <option value="private"> Private </option>
                    <option value="public"> Public</option>
                </Select>

                <Label htmlFor="dir">Select the dataset directory</Label> 
		<Input type="file" name="dir" accept=".zip" onChange={handleDirectoryInput} />

                {isLoaded ? (
                    <ButtonContainer>
                        <Button type="button" onClick={onRequestClose}>Close</Button>
                        <Button type="button" onClick={() => handleAccept()}>Accept</Button>
			</ButtonContainer>

                    ) : <div><p>Loading data</p></div>
                }
            </Form>
        </CustomModal>
    );
};

export default FormDialog;

