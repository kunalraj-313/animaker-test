import { memo, useCallback } from 'react';
import TableCell from './TableCell';

const TableRow = memo(function TableRow({ row, rowIndex, selectedCells, dragStartCell, onCellChange, onDragStart, onDragEnd, onCellHover, onInputFocus, onInputBlur }) {
  const handleCellChange = useCallback((index, value) => {
    onCellChange(index, value);
  }, [onCellChange]);

  const handleDragStart = useCallback((index, e) => {
    onDragStart(rowIndex, index, e);
  }, [onDragStart, rowIndex]);

  const handleCellHover = useCallback((index) => {
    onCellHover(rowIndex, index);
  }, [onCellHover, rowIndex]);

  return (
    <div className="table-row">
      <div className="label-cell">{row.label}</div>
      {row.cells.map((cell, index) => (
        <TableCell
          key={index}
          value={cell}
          isSelected={`${rowIndex}-${index}` in selectedCells}
          isDragStart={dragStartCell && dragStartCell.row === rowIndex && dragStartCell.col === index}
          onChange={(value) => handleCellChange(index, value)}
          onMouseDown={(e) => handleDragStart(index, e)}
          onMouseUp={onDragEnd}
          onMouseEnter={() => handleCellHover(index)}
          onInputFocus={onInputFocus}
          onInputBlur={onInputBlur}
        />
      ))}
    </div>
  );
});

export default TableRow;