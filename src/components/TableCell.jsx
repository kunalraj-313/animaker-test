import { useRef, memo, useCallback } from 'react';

const TableCell = memo(function TableCell({ value, isSelected, isDragStart, onChange, onMouseDown, onMouseUp, onMouseEnter, onInputFocus, onInputBlur }) {
  const inputRef = useRef(null);

  const handleDoubleClick = useCallback((e) => {
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
  }, []);

  const handleContainerMouseDown = useCallback((e) => {
    e.preventDefault();
    const wasInputClick = e.target.tagName.toLowerCase() === 'input';
    if (wasInputClick) {
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
    onMouseDown(e);
  }, [onMouseDown]);

  return (
    <div 
      className={`table-cell ${isSelected ? 'selected' : ''} ${isDragStart ? 'drag-start' : ''}`}
      onMouseDown={handleContainerMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onDoubleClick={handleDoubleClick}
    >
      <input
        onFocus={useCallback((e) => {
          if (!e.target.dataset.allowFocus) {
            e.target.blur();
          } else {
            onInputFocus?.(inputRef.current);
          }
        }, [onInputFocus])}
        onBlur={useCallback(() => onInputBlur?.(inputRef.current), [onInputBlur])}
        ref={inputRef}
        type="text"
        value={value}
        onChange={useCallback((e) => onChange(e.target.value), [onChange])}
      />
    </div>
  );
});

export default TableCell;