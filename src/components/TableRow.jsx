import TableCell from './TableCell';

function TableRow({ row, onCellChange }) {
  return (
    <div className="table-row">
      <div className="label-cell">{row.label}</div>
      {row.cells.map((cell, index) => (
        <TableCell
          key={index}
          value={cell}
          onChange={(value) => onCellChange(index, value)}
        />
      ))}
    </div>
  );
}

export default TableRow;