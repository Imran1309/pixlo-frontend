// EditableField.jsx
import React, { useState } from "react";
import { FaPencilAlt, FaCheck, FaTimes } from "react-icons/fa";

const EditableField = ({ label, value, onSave, type = "text", placeholder }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  const handleSave = () => {
    onSave(inputValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setEditing(false);
  };

  return (
    <div className="editable-field">
      <label>{label}</label>
      <div className="editable-container">
        {editing ? (
          <>
            <input
              type={type}
              value={inputValue}
              placeholder={placeholder || ""}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button onClick={handleSave}><FaCheck /></button>
            <button onClick={handleCancel}><FaTimes /></button>
          </>
        ) : (
          <>
            <span>{value || "Not set"}</span>
            <button onClick={() => setEditing(true)}><FaPencilAlt /></button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditableField;
