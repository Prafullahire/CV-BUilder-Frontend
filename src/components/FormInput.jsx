import React from 'react';

const FormInput = ({ label, type='text', value, onChange, placeholder='', required=false, name }) => {
  return (
    <div className="mb-3">
      {label && <label className="form-label">{label}</label>}
      <input
        type={type}
        className="form-control"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
      />
    </div>
  );
}

export default FormInput;
