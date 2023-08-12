import React, {useState} from "react";
import Modal from 'react-modal'

const FormDialog = ( {isOpen, onRequestClose}) => {
    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 


const handleAccept = () => {
    //handle accept logic here
    //have to send data to component
    //can i make a post request ? 
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
        <button type="button" onClick={handleAccept}>Accept</button>
        <button type="button" onClick={onRequestClose}>Close</button>
        </form>
    </Modal>
); 
}; 
export default FormDialog; 

