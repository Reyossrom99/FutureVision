import React, {useState} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import "./newDatasetForm.css";


const FormDialog = ( {isOpen, onRequestClose}) => {
    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    // const [cover, setCover] = useState(); 
    const [dir, setDir] = useState(); //set the url directory of the dataset
    const [type, setType] = useState("splits"); 
    const [format, setFormat] = useState("yolo"); 

  
    const handleAccept = () => {
        const uploadData = new FormData(); 
        uploadData.append('name', name); 
        uploadData.append('description', description);
        uploadData.append('url', dir); 
        uploadData.append('type', type); 
        uploadData.append('format', format); 
        
        const csrfToken = window.csrfToken; 

        try{
            const response =  axios.post('/datasets/', uploadData, {
            headers: {
                'X-CSRFToken': csrfToken,  // Include the csrf token in headers
            }
            }); 
            console.log(response); 
            onRequestClose(); 
           
        }catch(error){
                console.log(error); 
        }
    }; 

    const handleDirectoryInput = (e) =>{
        const directoryUrl = e.target.files[0];
        if(directoryUrl){
            console.log(directoryUrl); 
            //set the cover
            //DEBUG
           setDir(directoryUrl);
             
        }
        else{
            console.log("Input a directory url"); 
        }
    }; 

    const handleTypeChange = (e) => {
        setType(e.target.value); 
    }; 

    const handleFormatChange = (e) => {
        setFormat(e.target.value); 
    }; 

return (
    <Modal
    isOpen = {isOpen}
    onRequestClose={onRequestClose}
    contentLabel="Form Modal"
    >
        <h2 id="header-label">Create new dataset</h2>
        <form>
        
        <label htmlFor="name" id="name-label">Name</label>
        <input type="text" id="name-input" name="name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
        <label htmlFor="description" id ="description-label">Description</label>
        <input type="text" id="description-input" name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />
        <label htmlFor='type' id='type-label'>Select the type of the dataset</label>
        <select htmlFor='type-select' id='type-select' onChange={handleTypeChange}>
            <option value="splits"> splits created</option>
            <option value="no-splits"> no splits</option>
        </select> <br /><br/> 
        <label htmlFor="format" id="format-label">Select the format of the dataset</label>
        <select htmlFor="format-select" id="format-select" onChange={handleFormatChange}>
            <option value="yolo"> Yolo </option>
            <option value ="coco"> CoCo</option>
        </select><br /><br/> 
        <label htmlFor="dir" id ="dir-label">Select the dataset directory</label>
        <input type="file" id="dir" name="dir" accept=".zip" onChange={handleDirectoryInput}/><br />
        <div class="button-container">
        <button type="button" onClick={onRequestClose}>Close</button>
        <button type="button" onClick={() => handleAccept()}>Accept</button>
       
        </div>
        </form>
    </Modal>
); 
}; 

export default FormDialog; 

