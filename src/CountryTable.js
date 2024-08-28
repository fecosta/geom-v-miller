import React, { useState, useEffect } from "react";

function CountryTable({ data, filters }) {
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    if (!data || !filters.country || !filters.year) {
      console.log("Data or filters are incomplete.");
      setFilteredData(null);
      return;
    }

    const country = filters.country;
    const year = filters.year.toString();

    const filtered = data.filter(
      (row) => row.c === country && row.y === year
    )[0];

    setFilteredData(filtered);
  }, [data, filters]);

  if (!filteredData) {
    return <div>No data available for the selected filters.</div>;
  }

  const getValue = (value) => (value ? Number(value).toFixed(4) : "N/A");

  const csvHeaders = [
    "Metric",
    "Total Sample Inequality",
    "Ex-Ante Tree",
    "Ex-Ante RF",
    "Ex-Post"
  ];

  const csvData = [
    {
      metric: "Gini",
      totalSampleInequality: filteredData["Gini"],
      exAnteTree: getValue(filteredData["Gini_trees_exante"]),
      exAnteRF: getValue(filteredData["Gini_rforest_exante"]),
      exPost: getValue(filteredData["Gini_trees_expost"]),
    },
    {
      metric: "MLD",
      totalSampleInequality: filteredData["MLD"],
      exAnteTree: getValue(filteredData["MLD_trees_exante"]),
      exAnteRF: getValue(filteredData["MLD_rforest_exante"]),
      exPost: getValue(filteredData["MLD_trees_expost"]),
    },
    {
      metric: "Relative Gini",
      totalSampleInequality: filteredData["Gini"],
      exAnteTree: getValue(filteredData["Gini_trees_exante_rel"]),
      exAnteRF: getValue(filteredData["Gini_rforest_exante_rel"]),
      exPost: getValue(filteredData["Gini_trees_expost_rel"]),
    },
    {
      metric: "Relative MLD",
      totalSampleInequality: filteredData["MLD"],
      exAnteTree: getValue(filteredData["MLD_trees_exante_rel"]),
      exAnteRF: getValue(filteredData["MLD_rforest_exante_rel"]),
      exPost: getValue(filteredData["MLD_trees_expost_rel"]),
    }
  ];

  const convertToCSV = (data) => {
    const headers = csvHeaders.join(",");
    const rows = data.map(row => [
      row.metric,
      row.totalSampleInequality,
      row.exAnteTree,
      row.exAnteRF,
      row.exPost
    ].join(","));

    return [headers, ...rows].join("\n");
  };

  const downloadCSV = () => {
    const csvString = convertToCSV(csvData);
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filters.country}_${filters.year}_inequality_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
    <div className="pdfLandscape">
      <p>Absolute Inequality of Opportunity</p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Total Sample Inequality</th>
              <th>Ex-Ante Tree</th>
              <th>Ex-Ante RF</th>
              <th>Ex-Post</th>
            </tr>
          </thead>
          <tbody>
            <tr key="gini">
              <td>Gini</td>
              <td>{filteredData["Gini"]}</td>
              <td>{getValue(filteredData["Gini_trees_exante"])}</td>
              <td>{getValue(filteredData["Gini_rforest_exante"])}</td>
              <td>{getValue(filteredData["Gini_trees_expost"])}</td>
            </tr>
            <tr key="MLD">
              <td>MLD</td>
              <td>{filteredData["MLD"]}</td>
              <td>{getValue(filteredData["MLD_trees_exante"])}</td>
              <td>{getValue(filteredData["MLD_rforest_exante"])}</td>
              <td>{getValue(filteredData["MLD_trees_expost"])}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Relative Inequality of Opportunity</p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Total Sample Inequality</th>
              <th>Ex-Ante Tree</th>
              <th>Ex-Ante RF</th>
              <th>Ex-Post</th>
            </tr>
          </thead>
          <tbody>
            <tr key="gini">
              <td>Gini</td>
              <td>{filteredData["Gini"]}</td>
              <td>{getValue(filteredData["Gini_trees_exante_rel"])}</td>
              <td>{getValue(filteredData["Gini_rforest_exante_rel"])}</td>
              <td>{getValue(filteredData["Gini_trees_expost_rel"])}</td>
            </tr>
            <tr key="MLD">
              <td>MLD</td>
              <td>{filteredData["MLD"]}</td>
              <td>{getValue(filteredData["MLD_trees_exante_rel"])}</td>
              <td>{getValue(filteredData["MLD_rforest_exante_rel"])}</td>
              <td>{getValue(filteredData["MLD_trees_expost_rel"])}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div className="download-button" onClick={downloadCSV}>Download CSV</div>
    </>
  );
}

export default CountryTable;
