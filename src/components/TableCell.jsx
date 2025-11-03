function TableCell({ value, onChange }) {
  return (
    <div className="table-cell">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default TableCell;