import React from 'react';
import Button from './Button';

const Card = ({ title, subtitle, content, onEdit, onDownload, onShare }) => {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        {subtitle && <h6 className="card-subtitle mb-2 text-muted">{subtitle}</h6>}
        <p className="card-text">{content}</p>
        <Button text="Edit" variant="warning" onClick={onEdit} className="me-2"/>
        <Button text="Download" variant="success" onClick={onDownload} className="me-2"/>
        <Button text="Share" variant="info" onClick={onShare}/>
      </div>
    </div>
  );
}

export default Card;
