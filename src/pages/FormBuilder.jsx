import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormBuilderContainer } from '../components/FormBuilder';
import './FormBuilder.css';

const FormBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const handleSave = (formData) => {
    // Here you would typically save the form data to your backend
    console.log('Saving form:', formData);
    navigate('/forms');
  };

  const handleCancel = () => {
    navigate('/forms');
  };

  return (
    <div className="form-builder-page">
      <div className="form-builder-header">
        <h1>{isEditing ? 'Edit Form' : 'Create New Form'}</h1>
        <div className="form-builder-actions">
          <button className="button-outline" onClick={handleCancel}>
            Cancel
          </button>
          <button className="button-primary" onClick={() => handleSave({})}>
            Save Form
          </button>
        </div>
      </div>
      <FormBuilderContainer />
    </div>
  );
};

export default FormBuilder; 