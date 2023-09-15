import React, {useState} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import "./newDatasetForm.css";


const FormDialog = ( {isOpen, onRequestClose}) => {
    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    // const [cover, setCover] = useState(); 
    const [dir, setDir] = useState(); //set the url directory of the dataset

    //peticion asincrona
    const handleAccept = () => {
        //this methods works to send the cover url to the backend
    const uploadData = new FormData(); 
    uploadData.append('name', name); 
    uploadData.append('description', description); 
    // uploadData.append('cover', cover); 
    uploadData.append('url', dir); 
    const csrfToken = window.csrfToken; 
    try{
        const response =  axios.post('/datasets/', uploadData, {
        headers: {
            'X-CSRFToken': csrfToken,  // Include the csrf token in headers
        }
        }); 
        console.log(response); 

        //cerrar la ventana despues de recibir la peticion correcta
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
return (
    //Modal is a library for handling the pop-up 
    //in a way that is not blocked by the web server
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
        <label htmlFor="dir" id ="dir-label">Select the dataset directory</label>
        {/* <input type="file" id="cover" name="cover" onChange= {(e) => setCover(e.target.files[0])}/> <br /><br /> */}
        {/* <input directory="" webkitdirectory="" type="file" id="dir" name="dir"  onChange= {handleDirectoryInput}/><br /><br/> Allows to select directorys as inputs */}
        <input type="file" id="dir" name="dir" accept=".zip" onChange={handleDirectoryInput}/><br /><br/> 
        <div class="button-container">
        <button type="button" onClick={onRequestClose}>Close</button>
        <button type="button" onClick={() => handleAccept()}>Accept</button>
       
        </div>
        </form>
    </Modal>
); 
}; 
export default FormDialog; 

