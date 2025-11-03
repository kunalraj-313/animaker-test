function TableHeader({ headers }) {
  return (
    <div className="table-header">
      <div className="label-cell">Labels</div>
      {headers.map((header, index) => (
        <div key={index} className="header-cell">
          {header}
        </div>
      ))}
    </div>
  );
}

export default TableHeader;