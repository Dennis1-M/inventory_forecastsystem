// src/components/UI/Card.jsx
import React from "react";

function Card({ title, children }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}

export default Card;
