import React, {useEffect, useState} from 'react'; 
import axios from 'axios'; 
import Cookies from 'csrf-cookie'; 


//make http request to /datasets when enter the page 
function Datasets(){
    const [datasets, setDatasets] = useState([]); //get the data from the backend
    const [postResponse, setPostRequest] = useState(null); //send and recive post from the backend


    useEffect(() => {
        axios.get('/datasets/')
        .then(response => setDatasets(response.data))
        .catch(error => console.error(error))
    }, []); 
    const postData = {
      id: '0', 
      name: 'prueba_1', 
      description: 'descripcion', 
      formatedDate : '2023-08-10 15:30:00'
    }; 
    const handlePostRequest = () => {
      // const csrfToken = Cookies.get('csrftoken'); 
      const csrfToken = window.csrfToken;
      // axios.post('/datasets/', { data: postData})
      // .then(response => postResponse(response.data))
      // .catch(error => console.error(error))
      try {
        const response = axios.post('/datasets/', postData, {
          headers: {
            'X-CSRFToken': csrfToken,  // Include the csrf token in headers
          }
        }); 
      }catch(error){
        console.error(error); 
      }
    }

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
        <button onClick={handlePostRequest}>SEND POST</button>
      </div>
    ); 
}
export default Datasets; 