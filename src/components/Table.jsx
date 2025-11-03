import { useState, useCallback, useEffect, useRef } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

function Table() {
  const tableRef = useRef(null);
  const [headers, setHeaders] = useState(['Head 1', 'Head 2', 'Head 3', 'Head 4']);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState({});
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

  const [dragStartCell, setDragStartCell] = useState(null);

  const handleDragStart = useCallback((rowIndex, cellIndex) => {
        // console.log('indexed cell hover', rowIndex, cellIndex);

    setIsDragging(true);
    setDragStartCell({ row: rowIndex, col: cellIndex });
    const cellKey = `${rowIndex}-${cellIndex}`;
    setSelectedCells({
      [cellKey]: {
        rowIndex,
        cellIndex,
        value: rows[rowIndex].cells[cellIndex],
      }
    });
  }, [rows]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartCell(null);
    console.log('Selected Cells Data:', selectedCells);
  }, [selectedCells]);

  const handleCellHover = useCallback((rowIndex, cellIndex) => {
    if (isDragging && dragStartCell) {
      setSelectedCells(prev => {
        const next = {};
        // Get the range of cells to select
        const startRow = Math.min(dragStartCell.row, rowIndex);
        const endRow = Math.max(dragStartCell.row, rowIndex);
        const startCol = Math.min(dragStartCell.col, cellIndex);
        const endCol = Math.max(dragStartCell.col, cellIndex);

        // Select all cells in the rectangle and store their data
        for (let r = startRow; r <= endRow; r++) {
          for (let c = startCol; c <= endCol; c++) {
            const cellKey = `${r}-${c}`;
            next[cellKey] = {
              rowIndex: r,
              cellIndex: c,
              value: rows[r].cells[c],
            };
          }
        }

        return next;
      });
    }
  }, [isDragging, dragStartCell, rows]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedCells({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="table-container" ref={tableRef}>
      <button onClick={addColumn} className="add-column">Add Column</button>
      <button onClick={addRow} className="add-row">Add Row</button>
      <div className="table">
        <TableHeader headers={headers} />
        <div className="table-body">
          {rows.map((row, rowIndex) => (
            <TableRow
              key={row.id}
              row={row}
              rowIndex={rowIndex}
              selectedCells={selectedCells}
              onCellChange={(cellIndex, value) => updateCell(rowIndex, cellIndex, value)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onCellHover={handleCellHover}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Table;



