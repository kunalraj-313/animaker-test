function TableCell({ value, isSelected, onChange, onMouseDown, onMouseUp, onMouseEnter }) {
  return (
    <div 
      className={`table-cell ${isSelected ? 'selected' : ''}`}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default TableCell;