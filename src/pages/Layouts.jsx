import React from 'react';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLayout } from '../store/slices/layoutSlice';

const layouts = [
  { id: 1, name: 'Simple Layout', description: 'Minimal and clean CV' },
  { id: 2, name: 'Professional Layout', description: 'Detailed and professional look' },
  { id: 3, name: 'Creative Layout', description: 'Colorful and modern design' },
];

const Layouts = () => {
  const navigate = useNavigate();  
  const dispatch = useDispatch(); // <-- Must be inside the component

  const handleSelect = (layoutId) => {
    dispatch(setLayout(layoutId));   // Save selected layout in Redux
    navigate(`/editor/${layoutId}`); // Navigate to Editor page
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2>Select a Layout</h2>
        <div className="row mt-3">
          {layouts.map(layout => (
            <div className="col-md-4 mb-3" key={layout.id}>
              <div className="card p-3">
                <h5>{layout.name}</h5>
                <p>{layout.description}</p>
                <Button text="Select" onClick={() => handleSelect(layout.id)} variant="primary"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Layouts;
