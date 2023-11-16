import React from 'react';
import Modal from 'react-modal';
// import './forgetDatasetForm.css'; 

const ForgetForm = ({ isOpen, onRequestClose }) => {
  const handleAccept = () => {
    // Handle your accept logic here
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Form forget"
      className="custom-modal" // Apply custom class for additional styling
    >
      <h2 id="header-label">Exit page</h2>
      <p id="text-label">Are you sure you want to exit this page?</p>
      <p id="warning-label">This operation will delete all the non-saved data</p>
      <button type="button" onClick={onRequestClose}>
        Continue on page
      </button>
      <button type="button" onClick={() => handleAccept()}>
        Exit page
      </button>
    </Modal>
  );
};

export default ForgetForm;
