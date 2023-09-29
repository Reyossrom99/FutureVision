import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 
import FormDialog from '../components/newDatasetForm';
import './datasets.css'; 
import { Link, Route, BrowserRouter as Router, Switch } from 'react-router-dom';



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
        
        <div className='content-container'>
        <h1>Dataset Information</h1>
        
        <div className="datasets-container">
          {datasets.length > 0 ? (
            datasets.map(dataset => (
              <Link to={`/datasets/${dataset.id}`} key={dataset.id} className="dataset-card-link">
                <div key={dataset.id} className="dataset-card">
                  <img
                    src={dataset.cover_url} //dataset url
                    alt={dataset.name}
                    className="dataset-image"
                  />
                 
                  <div className="dataset-info">
                    <h2 className="dataset-name">{dataset.name}</h2>
                    <p className="dataset-description">{dataset.description}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No datasets available</p>
          )}
               
       
        </div>
       
        <button onClick={() => setIsDialogOpen(true)}>Create new</button>
        <FormDialog isOpen={isDialogOpen} onRequestClose={() => setIsDialogOpen(false)}/>
      </div>
      </div>
    ); 
}
export default Datasets; 