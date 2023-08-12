import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 


//make http request to /datasets when enter the page 
function Datasets(){
    const [datasets, setDatasets] = useState([]); 

    useEffect(() => {
        axios.get('/datasets')
        .then(response => setDatasets(response.data))
        .catch(error => console.error(error))
    }, []
        ); 

    return (
        <div>
        <h1>Dataset Information</h1>
        {datasets.length > 0 ? (
          datasets.map(dataset => (
            <div key={dataset.id}>
              <h2>{dataset.name}</h2>
              <p>Description: {dataset.description}</p>
              <p>Uploaded Date: {dataset.uploaded_date}</p>
              <p>URL: <a href={dataset.url} target="_blank" rel="noopener noreferrer">{dataset.url}</a></p>
              <hr />
            </div>
          ))
        ) : (
          <p>No datasets available.</p>
        )}
      </div>
    ); 
}
export default Datasets; 