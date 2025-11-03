import { useState, useCallback, useEffect, useRef } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

function Table() {
  const tableRef = useRef(null);
  const [copiedCells, setCopiedCells] = useState(null);
  const [headers, setHeaders] = useState(['Head 1', 'Head 2', 'Head 3', 'Head 4']);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState({});
  const [rows, setRows] = useState([
    { id: 1, label: 'Label 1', cells: ['', '', '', ''] },
    { id: 2, label: 'Label 2', cells: ['', '', '', ''] },
    { id: 3, label: 'Label 3', cells: ['', '', '', ''] },
    { id: 4, label: 'Label 4', cells: ['', '', '', ''] },
  ]);

  const addColumn = useCallback(() => {
    setHeaders(prevHeaders => [...prevHeaders, `Head ${prevHeaders.length + 1}`]);
    setRows(prevRows => prevRows.map(row => ({
      ...row,
      cells: [...row.cells, '']
    })));
  }, []);

  const addRow = useCallback(() => {
    setRows(prevRows => {
      const newRow = {
        id: prevRows.length + 1,
        label: `Label ${prevRows.length + 1}`,
        cells: Array(headers.length).fill('')
      };
      return [...prevRows, newRow];
    });
  }, [headers.length]);

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
      setSelectedCells(() => {
        const next = {};
        const startRow = Math.min(dragStartCell.row, rowIndex);
        const endRow = Math.max(dragStartCell.row, rowIndex);
        const startCol = Math.min(dragStartCell.col, cellIndex);
        const endCol = Math.max(dragStartCell.col, cellIndex);

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

  const getSelectedRange = useCallback(() => {
    if (Object.keys(selectedCells).length === 0) return null;

    const positions = Object.values(selectedCells);
    const rowIndices = positions.map(pos => pos.rowIndex);
    const colIndices = positions.map(pos => pos.cellIndex);

    return {
      startRow: Math.min(...rowIndices),
      endRow: Math.max(...rowIndices),
      startCol: Math.min(...colIndices),
      endCol: Math.max(...colIndices),
    };
  }, [selectedCells]);

  const handleCopy = useCallback(async (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key !== 'c') return;
    if (Object.keys(selectedCells).length === 0) return;

    const range = getSelectedRange();
    if (!range) return;

    e.preventDefault();

    const matrix = [];
    for (let i = range.startRow; i <= range.endRow; i++) {
      const row = [];
      for (let j = range.startCol; j <= range.endCol; j++) {
        const cellData = selectedCells[`${i}-${j}`];
        row.push(cellData ? cellData.value : '');
      }
      matrix.push(row);
    }

    // Store for internal paste operationsx
    const selectedData = {
      range,
      cells: Object.entries(selectedCells).map(([key, data]) => ({
        key,
        ...data
      }))
    };
    setCopiedCells(selectedData);

    const clipboardText = matrix.map(row => row.join('\t')).join('\n');
    
    try {
      await navigator.clipboard.writeText(clipboardText);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [selectedCells, getSelectedRange]);

  const handlePaste = useCallback(async (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key !== 'v' || !dragStartCell) return;
    e.preventDefault();

    try {
      const clipboardText = await navigator.clipboard.readText();
      const pasteData = clipboardText
        .trim()
        .split('\n')
        .map(row => row.trim().split('\t'));

      setRows(prevRows => {
        const newRows = [...prevRows];
        const targetRow = dragStartCell.row;
        const targetCol = dragStartCell.col;

        pasteData.forEach((rowData, rowOffset) => {
          const newRowIndex = targetRow + rowOffset;
          if (newRowIndex < newRows.length) {
            rowData.forEach((value, colOffset) => {
              const newColIndex = targetCol + colOffset;
              if (newColIndex < headers.length) {
                newRows[newRowIndex].cells[newColIndex] = value.trim();
              }
            });
          }
        });

        return newRows;
      });
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, [dragStartCell, headers.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedCells({});
      }
    };

    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          handleCopy(e);
        } else if (e.key === 'v') {
          handlePaste(e);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCopy, handlePaste]);

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



