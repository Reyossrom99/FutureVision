import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import indexPost from './views/datasets/index_datasets'; 
import App from './components/App'; 

ReactDOM.render(
  <Router>
    <App>
      <Routes>
        <Route path='/datasets' Component={indexPost}/>
      </Routes>
    </App>
  </Router>,
  document.getElementById('root')
);