import React, { useState, useEffect } from 'react';

function Table({ data, filters }) {
  const [sortedData, setSortedData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    // Filter the data based on the provided filters
    const filteredData = data.filter(row =>
      row.Measure === filters.measure &&
      row.Approach === filters.approach &&
      (filters.year === 'Latest' ? row.Latest === '1' : true) &&
      filters.region.includes(row.Region)
    );

    // Sort the data based on the sort configuration
    let sorted = [...filteredData];
    if (sortConfig.key !== null) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setSortedData(sorted);
  }, [data, filters, sortConfig]);

  // Function to handle sorting when a column header is clicked
  function handleSort(key) {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  }

  // Function to convert data to CSV format
  function convertToCSV(data) {
    const header = ['Name', 'Year', 'Total Inequality', 'IOp Ex-Ante RF', 'IOp Ex-Post'];
    const rows = data.map(item => [
      item.Name,
      item.Year,
      item['Total Inequality'],
      item['IOp Ex-Ante RF'],
      item['IOp Ex-Post']
    ]);

    const csvContent = [
      header.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  }

  // Function to handle download
  function handleDownload() {
    const csvContent = convertToCSV(sortedData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(`download`, `${filters.region}_${filters.year}_table_data.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('Name')}>Name</th>
            <th onClick={() => handleSort('Year')}>Year</th>
            <th onClick={() => handleSort('Total Inequality')}>Total Inequality</th>
            <th onClick={() => handleSort('IOp Ex-Ante RF')}>IOp Ex-Ante RF</th>
            <th onClick={() => handleSort('IOp Ex-Post')}>IOp Ex-Post</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr key={index}>
              <td>{item.Name}</td>
              <td>{item.Year}</td>
              <td>{item['Total Inequality']}</td>
              <td>{item['IOp Ex-Ante RF']}</td>
              <td>{item['IOp Ex-Post']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className='download-button' onClick={handleDownload}>Download CSV</div>
    </>
  );
}

export default Table;
