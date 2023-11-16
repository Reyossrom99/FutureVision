import React, {useState} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';


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
    className={styles.formContent}
    >
       
        <form classname={styles.formElements}>
        <h2 id={styles.headerLabel}>Create new dataset</h2> <br></br>
        <label htmlFor="name" id={styles.nameLabel}>Name</label><br></br><br></br>
        <input type="text" id={styles.nameInput} name="name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />

        <label htmlFor="description" id ={styles.descriptionLabel}>Description</label><br></br><br></br>
        <input type="text" id={styles.descriptionInput} name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />

        <label htmlFor='type' id={styles.typeLabel}>Select the type of the dataset</label>
        <select htmlFor='type-select' id={styles.typeInput} onChange={handleTypeChange}>
            <option value="splits"> splits created</option>
            <option value="no-splits"> no splits</option>
        </select> <br /><br/> 

        <label htmlFor="format" id={styles.formatLabel}>Select the format of the dataset</label>
        <select htmlFor="format-select" id={styles.formatInput} onChange={handleFormatChange}>
            <option value="yolo"> Yolo </option>
            <option value ="coco"> CoCo</option>
        </select><br /><br/> 

        <label htmlFor="dir" id ={styles.dirLabel}>Select the dataset directory</label> <br></br><br></br>
        <input type="file" id={styles.dirInput} name="dir" accept=".zip" onChange={handleDirectoryInput}/> <br></br>
       
        <div class={styles.buttonContainer}>
        <button type="button" onClick={onRequestClose}>Close</button>
        <button type="button" onClick={() => handleAccept()}>Accept</button>
       
        </div>
        </form>
    </Modal>
); 
}; 

export default FormDialog; 

