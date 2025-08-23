// client/src/components/HorseCard.jsx
import React from 'react';

const HorseCard = ({ horse }) => (
  <div className="border rounded shadow p-4 max-w-sm">
    <img
      src={horse.photo_path || 'https://via.placeholder.com/300x200?text=No+Image'}
      alt={horse.name}
      className="h-48 w-full object-cover mb-2"
    />
    <h3 className="text-xl font-bold">{horse.name}</h3>
    <p><strong>Age:</strong> {horse.age}</p>
    <p><strong>Breed:</strong> {horse.breed}</p>
    <p><strong>Height:</strong> {horse.height_hh} hh</p>
    <p><strong>Color:</strong> {horse.color}</p>
    <p><strong>Price:</strong> ${horse.price}</p>
    {/* You can expose owner email later if needed */}
    {/* <p><strong>Contact:</strong> {horse.owner_id}</p> */}
    <p className="mt-2">{horse.notes}</p>
  </div>
);

export default HorseCard;