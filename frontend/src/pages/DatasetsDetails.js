import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import the useParams hook

function DatasetsDetails() {
  const { id } = useParams(); // Use the useParams hook to get the 'id' parameter
  const [dataset, setDataset] = useState(null);

  useEffect(() => {
    axios.get(`/datasets/${id}`)
      .then(response => setDataset(response.data))
      .catch(error => console.log(error));
  }, [id]); // Use 'id' in the dependency array

  return (
    <div>
      {dataset ? (
        <div>
          {/* Render the detailed information of the dataset */}
          <h1>{dataset.name}</h1>
          <p>{dataset.description}</p>
          <p>{dataset.url}</p>
          {/* Other dataset details */}
        </div>
      ) : (
        <p>Loading dataset details...</p>
      )}
    </div>
  );
}

export default DatasetsDetails;






