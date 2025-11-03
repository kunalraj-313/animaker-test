import TableCell from './TableCell';

function TableRow({ row, rowIndex, selectedCells, onCellChange, onDragStart, onDragEnd, onCellHover }) {

  
  return (
    <div className="table-row">
      <div className="label-cell">{row.label}</div>
      {row.cells.map((cell, index) => (
        <TableCell
          key={index}
          value={cell}
          isSelected={`${rowIndex}-${index}` in selectedCells}
          onChange={(value) => onCellChange(index, value)}
          onMouseDown={() => onDragStart(rowIndex, index)}
          onMouseUp={onDragEnd}
          onMouseEnter={() => onCellHover(rowIndex, index)}
        />
      ))}
    </div>
  );
}

export default TableRow;