import { useRef } from 'react';

function TableCell({ value, isSelected, isDragStart, onChange, onMouseDown, onMouseUp, onMouseEnter }) {
  const inputRef = useRef(null);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    if (inputRef.current) {
      inputRef.current.dataset.allowFocus = 'true';
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) {
          delete inputRef.current.dataset.allowFocus;
        }
      }, 0);
    }
  };

  const handleContainerMouseDown = (e) => {
    e.preventDefault();
    
    const wasInputClick = e.target.tagName.toLowerCase() === 'input';
    if (wasInputClick) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    
    onMouseDown(e);
  };

  return (
    <div 
      className={`table-cell ${isSelected ? 'selected' : ''} ${isDragStart ? 'drag-start' : ''}`}
      onMouseDown={handleContainerMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onDoubleClick={handleDoubleClick}
    >
      <input
        onFocus={(e) => {
          if (!e.target.dataset.allowFocus) {
            e.target.blur();
          }
        }}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default TableCell;