import React from 'react';

const Button = ({ text, type='button', onClick, variant='primary', className='' }) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export default Button;
