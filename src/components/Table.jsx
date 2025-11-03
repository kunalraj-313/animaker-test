import { useState } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

function Table() {
  const [headers, setHeaders] = useState(['Head 1', 'Head 2', 'Head 3', 'Head 4']);
  const [rows, setRows] = useState([
    { id: 1, label: 'Label 1', cells: ['', '', '', ''] },
    { id: 2, label: 'Label 2', cells: ['', '', '', ''] },
    { id: 3, label: 'Label 3', cells: ['', '', '', ''] },
    { id: 4, label: 'Label 4', cells: ['', '', '', ''] },
  ]);

  const addColumn = () => {
    setHeaders([...headers, `Head ${headers.length + 1}`]);
    setRows(rows.map(row => ({
      ...row,
      cells: [...row.cells, '']
    })));
  };

  const addRow = () => {
    const newRow = {
      id: rows.length + 1,
      label: `Label ${rows.length + 1}`,
      cells: Array(headers.length).fill('')
    };
    setRows([...rows, newRow]);
  };

  const updateCell = (rowIndex, cellIndex, value) => {
    const newRows = [...rows];
    newRows[rowIndex].cells[cellIndex] = value;
    setRows(newRows);
  };

  return (
    <div className="table-container">
      <button onClick={addColumn} className="add-column">Add Column</button>
      <button onClick={addRow} className="add-row">Add Row</button>
      <div className="table">
        <TableHeader headers={headers} />
        <div className="table-body">
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.id}
              row={row}
              onCellChange={(cellIndex, value) => updateCell(rowIndex, cellIndex, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Table;