import React, {useState} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 

const FormDialog = ( {isOpen, onRequestClose}) => {
    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [cover, setCover] = useState(); 

//peticion asincrona
const handleAccept = () => {
    //this method does not send the cover url to the back end
//    //make a post request with the book data 
//    const postData = {
//     name : name, 
//     description: description, 
//     cover : cover
//    }; 
    //this methods works to send the cover url to the backend
   const uploadData = new FormData(); 
   uploadData.append('name', name); 
   uploadData.append('description', description); 
   uploadData.append('cover', cover); 
   const csrfToken = window.csrfToken; 
   try{
    const response =  axios.post('/datasets/', uploadData, {
    headers: {
        'X-CSRFToken': csrfToken,  // Include the csrf token in headers
    }
    }); 
    console.log(response); 

    //cerrar la terminal despues de que se mande la peticion 
    onRequestClose(); 
   }catch(error){
        console.log(error); 
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
        <h2> Formulacion de datasets</h2>
        <form>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
        <label htmlFor="description">Description:</label>
        <input type="text" id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />
        <input type="file" id="cover" name="cover" onChange= {(e) => setCover(e.target.files[0])}/> <br /><br />
        <button type="button" onClick={() => handleAccept()}>Accept</button>
        <button type="button" onClick={onRequestClose}>Close</button>
        </form>
    </Modal>
); 
}; 
export default FormDialog; 

