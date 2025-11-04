import { useState, useCallback, useEffect, useRef, memo } from 'react';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

const Table = memo(function Table() {
  const STORAGE_KEY = 'animaker-table-data-v1';
  const tableRef = useRef(null);

  const defaultHeaders = ['Head 1', 'Head 2', 'Head 3', 'Head 4'];
  const [headers, setHeaders] = useState(defaultHeaders);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCells, setSelectedCells] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const defaultRows = [
    { id: 1, label: 'Label 1', cells: ['', '', '', ''] },
    { id: 2, label: 'Label 2', cells: ['', '', '', ''] },
    { id: 3, label: 'Label 3', cells: ['', '', '', ''] },
    { id: 4, label: 'Label 4', cells: ['', '', '', ''] },
  ];
  const [rows, setRows] = useState(defaultRows);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.headers) setHeaders(parsed.headers);
      if (parsed?.rows) setRows(parsed.rows);
    // mark hydrated on next tick so we don't overwrite storage during initial mount
    } catch {
      /* ignore parse/storage errors */
    }
    // ensure hydrated becomes true after this effect finishes (next tick)
    const t = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(t);
  }, []);

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

  const updateCell = useCallback((rowIndex, cellIndex, value) => {
    setRows(prevRows => {
      const newRows = [...prevRows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        cells: [
          ...newRows[rowIndex].cells.slice(0, cellIndex),
          value,
          ...newRows[rowIndex].cells.slice(cellIndex + 1)
        ]
      };
      return newRows;
    });
  }, []);

  const [dragStartCell, setDragStartCell] = useState(null);
  const [anchorCell, setAnchorCell] = useState(null);

  const handleDragStart = useCallback((rowIndex, cellIndex, e) => {
    if (focusedInput) {
      focusedInput.blur();
      setFocusedInput(null);
    }

    if (e && e.shiftKey && anchorCell) {
      const startRow = Math.min(anchorCell.row, rowIndex);
      const endRow = Math.max(anchorCell.row, rowIndex);
      const startCol = Math.min(anchorCell.col, cellIndex);
      const endCol = Math.max(anchorCell.col, cellIndex);
      const next = {};
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
      setSelectedCells(next);
      return;
    }
    setIsDragging(true);
    const newCell = { row: rowIndex, col: cellIndex };
    setDragStartCell(newCell);
    setAnchorCell(newCell);
    const cellKey = `${rowIndex}-${cellIndex}`;
    setSelectedCells({
      [cellKey]: {
        rowIndex,
        cellIndex,
        value: rows[rowIndex].cells[cellIndex],
      }
    });
  }, [rows, anchorCell, focusedInput]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    console.log('Selected Cells Data:', selectedCells);
  }, [selectedCells]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const data = { headers, rows };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore storage errors (e.g., quota exceeded or private mode) */
    }
  }, [headers, rows, hydrated]);

  const handleCellHover = useCallback((rowIndex, cellIndex) => {
    if (isDragging && dragStartCell) {
      if (focusedInput) {
        focusedInput.blur();
        setFocusedInput(null);
      }

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
  }, [isDragging, dragStartCell, rows, focusedInput]);

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

  const copySelectedCells = useCallback(async () => {
    if (Object.keys(selectedCells).length === 0) return null;

    const range = getSelectedRange();
    if (!range) return null;

    const matrix = [];
    for (let i = range.startRow; i <= range.endRow; i++) {
      const row = [];
      for (let j = range.startCol; j <= range.endCol; j++) {
        const cellData = selectedCells[`${i}-${j}`];
        row.push(cellData ? cellData.value : '');
      }
      matrix.push(row);
    }

    const clipboardText = matrix.map(row => row.join('\t')).join('\n');
    return { clipboardText, range, matrix };
  }, [selectedCells, getSelectedRange]);



  const handleCut = useCallback(async (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key !== 'x') return;
    
    e.preventDefault();
    const copyData = await copySelectedCells();
    if (!copyData) return;
    
    try {
      await navigator.clipboard.writeText(copyData.clipboardText);
      
      setRows(prevRows => {
        const newRows = [...prevRows];
        for (let i = copyData.range.startRow; i <= copyData.range.endRow; i++) {
          for (let j = copyData.range.startCol; j <= copyData.range.endCol; j++) {
            newRows[i].cells[j] = '';
          }
        }
        return newRows;
      });
      
      console.log('Cut to clipboard');
    } catch (err) {
      console.error('Failed to cut to clipboard:', err);
    }
  }, [copySelectedCells]);

  const handleCopy = useCallback(async (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.key !== 'c') return;
    
    e.preventDefault();
    const copyData = await copySelectedCells();
    if (!copyData) return;
    
    try {
      await navigator.clipboard.writeText(copyData.clipboardText);
      console.log('Copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [copySelectedCells]);

  const handlePaste = useCallback(async (e) => {
    if (e.type === 'keydown' && (!(e.ctrlKey || e.metaKey) || e.key !== 'v')) {
      return;
    }
    
    if (!dragStartCell) {
      console.log('No starting cell for paste');
      return;
    }
    
    e.preventDefault();

    try {
      const clipboardText = await navigator.clipboard.readText();
      console.log('Raw clipboard data:', clipboardText);
      
      const pasteData = clipboardText
        .trim()
        .split(/\r?\n/) 
        .map(row => row.trim().split(/\t/));

      const targetRow = dragStartCell.row;
      const targetCol = dragStartCell.col;
      const requiredRows = targetRow + pasteData.length;
      const requiredCols = targetCol + Math.max(...pasteData.map(row => row.length));
      
      console.log('Paste operation details:', {
        targetRow,
        targetCol,
        requiredRows,
        requiredCols,
        pasteDataLength: pasteData.length,
        maxPasteDataWidth: Math.max(...pasteData.map(row => row.length))
      });

      if (requiredCols > headers.length) {
        const newHeaders = [...headers];
        for (let i = headers.length; i < requiredCols; i++) {
          newHeaders.push(`Head ${i + 1}`);
        }
        setHeaders(newHeaders);
      }

      setRows(prevRows => {
        const newRows = [...prevRows];
        
        while (newRows.length < requiredRows) {
          newRows.push({
            id: newRows.length + 1,
            label: `Label ${newRows.length + 1}`,
            cells: Array(Math.max(requiredCols, headers.length)).fill('')
          });
        }
        
        newRows.forEach(row => {
          while (row.cells.length < requiredCols) {
            row.cells.push('');
          }
        });

        pasteData.forEach((rowData, rowOffset) => {
          const newRowIndex = targetRow + rowOffset;
          rowData.forEach((value, colOffset) => {
            const newColIndex = targetCol + colOffset;
            if (newRowIndex < requiredRows && newColIndex < requiredCols) {
              newRows[newRowIndex].cells[newColIndex] = value.trim();
              console.log(`Pasting "${value.trim()}" to [${newRowIndex}, ${newColIndex}]`);
            }
          });
        });

        return newRows;
      });
    } catch (err) {
      console.error('Failed to paste:', err);
    }
  }, [dragStartCell, headers]);



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
        } else if (e.key === 'x') {
          handleCut(e);
        } else if (e.key === 'v') {
          console.log('Paste key detected',rows)
          handlePaste(e);
        }
        return;
      }

      if (dragStartCell) {
        let newRow = dragStartCell.row;
        let newCol = dragStartCell.col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, dragStartCell.row - 1);
            e.preventDefault();
            break;
          case 'ArrowDown':
            newRow = Math.min(rows.length - 1, dragStartCell.row + 1);
            e.preventDefault();
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, dragStartCell.col - 1);
            e.preventDefault();
            break;
          case 'ArrowRight':
            newCol = Math.min(headers.length - 1, dragStartCell.col + 1);
            e.preventDefault();
            break;
          case 'Tab':
            newCol = Math.min(headers.length - 1, dragStartCell.col + 1);
            if (newCol === dragStartCell.col && !e.shiftKey) {
              newCol = 0;
              newRow = Math.min(rows.length - 1, dragStartCell.row + 1);
            }
            e.preventDefault();
            break;
          case 'Enter':
            newRow = Math.min(rows.length - 1, dragStartCell.row + 1);
            e.preventDefault();
            break;
        }

        if (newRow !== dragStartCell.row || newCol !== dragStartCell.col) {
          if (focusedInput) {
            focusedInput.blur();
            setFocusedInput(null);
          }
          setDragStartCell({ row: newRow, col: newCol });
          setSelectedCells({ [`${newRow}-${newCol}`]: { row: newRow, col: newCol, value: rows[newRow].cells[newCol] } });
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleCopy, handleCut, handlePaste, rows, dragStartCell, headers.length, focusedInput]);

  const handleInputFocus = useCallback((input) => {
    setFocusedInput(input);
  }, []);

  const handleInputBlur = useCallback(() => {
    setFocusedInput(null);
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
              dragStartCell={dragStartCell}
              onCellChange={(cellIndex, value) => updateCell(rowIndex, cellIndex, value)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onCellHover={handleCellHover}
              onInputFocus={handleInputFocus}
              onInputBlur={handleInputBlur}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Table;



