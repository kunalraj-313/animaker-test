# Interactive Spreadsheet Component

A React-based spreadsheet component with features similar to Excel/Google Sheets, including cell selection, copy-paste functionality, and keyboard navigation.

## Features

- 📋 Copy, Cut & Paste functionality (compatible with Excel/Sheets)
- 🖱️ Mouse drag selection
- ⌨️ Keyboard navigation (arrows, tab, enter)
- ⭐ Multi-cell selection with Shift+Click
- 📝 Double-click to edit cells
- ➕ Dynamic row and column addition
- 🔄 Excel-compatible clipboard operations

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/kunalraj-313/animaker-test.git
cd animaker-test
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The project is built with Vite for fast development and hot module replacement (HMR).

## Data Model

The spreadsheet component manages its data using several key structures:

### Headers
An array of strings representing column titles:
```javascript
const headers = ['Head 1', 'Head 2', 'Head 3', 'Head 4'];
```

### Rows
An array of objects, each representing a row with a unique ID, label, and cell values:
```javascript
const rows = [
  {
    id: 1,                    // Unique identifier for the row
    label: 'Label 1',         // Row header text
    cells: ['', '', '', '']   // Array of cell values, one per column
  }
  // ... more rows
];
```

### Selected Cells
An object tracking which cells are currently selected. Uses row-column coordinates as keys:
```javascript
const selectedCells = {
  '0-1': {                    // Key format: "rowIndex-columnIndex"
    rowIndex: 0,              // Row position
    cellIndex: 1,             // Column position
    value: 'cell content'     // Current cell value
  },
  // ... more selected cells
};
```

### Drag Start Cell
Tracks the cell where a drag operation began or the current focused cell:
```javascript
const dragStartCell = {
  row: 2,                     // Row index
  col: 3                      // Column index
};
```

### Anchor Cell
Used for shift-click range selection, marks the starting point of the range:
```javascript
const anchorCell = {
  row: 0,                     // Row index
  col: 1                      // Column index
};
```

### Example State
Here's how it all looks together in a simple example:
```javascript
{
  // Column headers
  headers: ['Head 1', 'Head 2', 'Head 3'],
  
  // Table rows with their data
  rows: [
    {
      id: 1,
      label: 'Row 1',
      cells: ['Value 1', 'Value 2', 'Value 3']
    },
    {
      id: 2,
      label: 'Row 2',
      cells: ['Value 4', 'Value 5', 'Value 6']
    }
  ],
  
  // Currently selected cells
  selectedCells: {
    '0-1': { rowIndex: 0, cellIndex: 1, value: 'Value 2' }
  },
  
  // Current focus point
  dragStartCell: { row: 0, col: 1 },
  
  // Shift-select anchor point
  anchorCell: { row: 0, col: 1 }
}
```

This structure allows the component to:
- Track and update cell values efficiently
- Handle multi-cell selection
- Support drag operations
- Enable keyboard navigation
- Manage copy/paste operations
- Maintain Excel-like selection behavior

## Component Architecture

```
Table/
├─ TableHeader      // Renders column headers
│  └─ Manages column labels and addition
├─ TableRow         // Row container component
│  └─ Handles row-level events and data
└─ TableCell        // Individual cell component
   └─ Manages cell editing, focus, and selection
```

## Key Features Guide

### Selection System
- **Single Click**: Selects a cell (blue outline)
- **Click and Drag**: Select multiple cells
- **Shift + Click**: Select a range between two points
- **Double Click**: Enter edit mode for a cell

### Keyboard Navigation
- `Arrow keys`: Move between cells
- `Tab`: Move to next cell (right)
- `Enter`: Move to cell below
- `Ctrl/Cmd + C`: Copy selected cells
- `Ctrl/Cmd + X`: Cut selected cells
- `Ctrl/Cmd + V`: Paste at current cell

### Clipboard Features
- Compatible with Excel/Google Sheets
- Preserves formatting and structure
- Auto-expands table when pasting beyond boundaries
- Supports multi-cell copy/paste operations

### Cell Editing
- Double-click to edit any cell
- Auto-blur when clicking away or navigating
- Tab/Enter navigation during editing
- Maintains cell content until explicitly changed

## Demo Usage

1. **Basic Operations**:
   - Launch the app using `npm run dev`
   - Click "Add Column" or "Add Row" to expand the table
   - Click cells to select them
   - Double-click to edit cell content

2. **Selection Operations**:
   - Click and drag to select multiple cells
   - Hold Shift and click to select ranges
   - Single click to focus a specific cell

3. **Copy-Paste Operations**:
   - Select cells and use Ctrl/Cmd + C to copy
   - Use Ctrl/Cmd + X to cut cells
   - Select a target cell and use Ctrl/Cmd + V to paste
   - Try copying from Excel/Sheets and pasting into the component

## Built With

- React + Vite
- Modern React Hooks
- CSS3 for styling
- Clipboard API for system integration

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.
