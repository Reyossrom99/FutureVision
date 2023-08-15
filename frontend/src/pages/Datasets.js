import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 
import FormDialog from '../components/newDatasetForm';
import './datasets.css'
import SideNav from '../components/SideNav'


//make http request to /datasets when enter the page 
function Datasets(){
    const [datasets, setDatasets] = useState([]); //get the data from the backend
    const [postResponse, setPostRequest] = useState(null); //send and recive post from the backend
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        axios.get('/datasets/')
        .then(response => setDatasets(response.data))
        .catch(error => console.error(error))
    }, []); 
 
    return (
      <div className='page-container'>
        <div className="sidenav">
        <SideNav /> {/* Use the SideNav component */}
      </div>
        <div className='content-container'>
        <h1>Dataset Information</h1>
        <div className="datasets-container">
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <div key={dataset.id} className="dataset-card">
                <img
                  src={dataset.cover} //dataset url
                  alt={dataset.name}
                  className="dataset-image"
                />
                <div className="dataset-info">
                  <h2 className="dataset-name">{dataset.name}</h2>
                  <p className="dataset-description">{dataset.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No datasets available</p>
          )}
        </div>
        <button onClick={() => setIsDialogOpen(true)}>Open Form Dialog</button>
        <FormDialog isOpen={isDialogOpen} onRequestClose={() => setIsDialogOpen(false)} />
      </div>
      </div>
    ); 
}
export default Datasets; 