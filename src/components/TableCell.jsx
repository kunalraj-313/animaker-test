import { useRef, memo, useCallback } from 'react';

const TableCell = memo(function TableCell({ value, isSelected, isDragStart, onChange, onMouseDown, onMouseUp, onMouseEnter, onInputFocus, onInputBlur }) {
  const inputRef = useRef(null);


  const handleContainerMouseDown = useCallback((e) => {

    const targetTag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';

    if (targetTag === 'input' && inputRef.current && !e.shiftKey) {
      inputRef.current.dataset.allowFocus = 'true';
      setTimeout(() => {
        if (inputRef.current) delete inputRef.current.dataset.allowFocus;
      }, 0);
    }

    onMouseDown(e);
  }, [onMouseDown]);

  const handleClick = useCallback((e) => {
    if (e && e.shiftKey) return;

    if (inputRef.current) {
      inputRef.current.dataset.allowFocus = 'true';
      inputRef.current.focus();
      setTimeout(() => {
        if (inputRef.current) delete inputRef.current.dataset.allowFocus;
      }, 0);
    }
  }, []);

  return (
    <div 
      className={`table-cell ${isSelected ? 'selected' : ''} ${isDragStart ? 'drag-start' : ''}`}
      onMouseDown={handleContainerMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onClick={handleClick}
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