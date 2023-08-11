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
            <h1>Datasets</h1>
                <ul>
                {datasets.map(dataset => (
                    <li key={datasets.id}>{datasets.name}</li>
                ))}
                </ul>
        
        </div>
    ); 
}
export default Datasets; 