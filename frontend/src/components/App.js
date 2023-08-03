import React from 'react'; 
import {Link} from 'react-router-dom'; 

const App = ({children}) => {
  return (
    <div>
    <nav>
      <ul>
        <li>
          {/* <Link to="/datasets">Blog Posts</Link> */}
        </li>
        {/* Other navigation links */}
      </ul>
    </nav>
    <main>{children}</main>
  </div>
  ); 
};
export default App; 