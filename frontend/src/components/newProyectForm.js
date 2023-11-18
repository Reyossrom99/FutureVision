import React, {useState, useEffect} from "react";
import Modal from 'react-modal'; 
import axios from 'axios'; 
import styles from './newDatasetForm.module.css';

const FormDialog = ({isOpen, onRequestClose}) => {
    const [name, setName] = useState(''); 
    const [description, setDescription] = useState(''); 
    const [type, setType] = useState("bbox"); 
    const [datasets, setDatasets] = useState([]);
    const [selectDataset, setSelectDataset] = useState(null);
    

    //request fro the avariable datasets to the backend
    useEffect(() => {
        const fetchDatasets = async () => {
            try {
                const response = await axios.get('/datasets/get_datasets/');
                setDatasets(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchDatasets();
    }, []);

    const handleAccept = () => {
        const uploadData = new FormData (); 
        uploadData.append('name', name);
        uploadData.append('description', description);
        uploadData.append('type', type); 
        if (selectDataset != null){
            uploadData.append('dataset_id', selectDataset); 
            const csrfToken = window.csrfToken; 

            try{
                const response =  axios.post('/proyects/create/', uploadData, {
                headers: {
                    'X-CSRFToken': csrfToken,  // Include the csrf token in headers
                }
                }); 
                console.log(response); 
                onRequestClose(); 
            
            }catch(error){
                    console.log(error); 
            }
        }
        else {
            alert("Select a correct dataset value"); 
        }
    };

    const handleTypeChange = (e) => {
        setType(e.target.value); 
    };

    const handleDatasetChange = (e) => {
  
        setSelectDataset(e.target.value);
 
    };
    
    return (
        <Modal
        isOpen = {isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Form Modal"
        className={styles.formContent}
        >
           
            <form classname={styles.formElements}>
            <h2 id={styles.headerLabel}>Create new proyect</h2> <br></br>
            <label htmlFor="name" id={styles.nameLabel}>Name</label><br></br><br></br>
            <input type="text" id={styles.nameInput} name="name" value={name} onChange={(e) => setName(e.target.value)} /><br /><br />
    
            <label htmlFor="description" id ={styles.descriptionLabel}>Description</label><br></br><br></br>
            <input type="text" id={styles.descriptionInput} name="description" value={description} onChange={(e) => setDescription(e.target.value)} /><br /><br />
    
            <label htmlFor='type' id={styles.typeLabel}>Select the dataset label type</label>
            <select htmlFor='type-select' id={styles.typeInput} onChange={handleTypeChange}>
                <option value="bbox">bbox</option>
                <option value="mask">mask</option>
                <option value="mask+bbox"> mask + bbox</option>
            </select> <br /><br/> 
    
    
            <label htmlFor='dataset' id={styles.typeLabel}>Select an exiting dataset</label>
            <select htmlFor='dataset-select' id={styles.typeInput} onChange={handleDatasetChange}>
                <option value={null}>-</option>
                {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                    {dataset.name}
                </option>
                ))}
            </select>

            <div class={styles.buttonContainer}>
            <button type="button" onClick={onRequestClose}>Close</button>
            <button type="button" onClick={() => handleAccept()}>Accept</button>
            </div>
            </form>
        </Modal>
    ); 
};
export default FormDialog; 