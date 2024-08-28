import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import * as d3 from "d3";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";
import VisualizationSelector from "./VisualizationSelector";
import Filter from "./Filter";
import Map from "./Map";
import Table from "./Table";
import TimeSeries from "./TimeSeries";
import PDFViewer from "./PDFViewer";
import Decomposition from "./Decomposition";
import ChartsWrapper from "./ChartsWrapper";
import TypesDescription from "./TypesDescription";
import CountryTable from "./CountryTable";

function App() {
  const [currentVisualization, setCurrentVisualization] = useState("");
  const [instructions, setInstructions] = useState({});
  const [worldData, setWorldData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [countryTableData, setCountryTableData] = useState([]);
  const [filters, setFilters] = useState({
    measure: "Gini",
    perspective: "Ex-Ante Random Forest",
    approach: "Absolute",
    variable: "Income",
    region: "Africa",
    countries: ["PER"],
    country: "IT",
    year: "2019",
    exAnteFormat: "chart",
    exPostFormat: "chart",
  });

  const [filterOptions, setFilterOptions] = useState({
    measure: [
      { value: "Gini", label: "Gini" },
      { value: "MLD", label: "MLD" },
    ],
    perspective: [
      { value: "Ex-Ante Random Forest", label: "Ex-Ante (Random Forest)" },
      { value: "Ex-Post Tree", label: "Ex-Post (Tree)" },
    ],
    approach: [
      { value: "Absolute", label: "Absolute" },
      { value: "Relative", label: "Relative" },
    ],
    variable: [
      { value: "Income", label: "Income" },
      { value: "Consumption", label: "Consumption" },
    ],
    year: [],
    region: [
      { value: "Africa", label: "Africa" },
      { value: "Asia + Oceania", label: "Asia + Oceania" },
      { value: "Europe", label: "Europe" },
      { value: "LATAM", label: "LATAM" },
      { value: "North America", label: "North America" },
    ],
    exAnteFormat: [
      { value: "chart", label: "Graph" },
      { value: "pdf", label: "PDF" },
      { value: "decomposition", label: "Decomposition" },
    ],
    exPostFormat: [
      { value: "chart", label: "Graph" },
      { value: "pdf", label: "PDF" },
      { value: "types", label: "Type Distribution" },
      { value: "decomposition", label: "Decomposition" },
    ],
    countries: [],
    country: [],
  });
  const [pdfs, setPdfs] = useState({
    exAnte: "",
    exPost: "",
    types: "",
    alluvial: "",
  });

  useEffect(() => {
    const path = window.location.pathname;

    if (path.includes("/world")) {
      setFilters((prevFilters) => ({
        ...prevFilters,
      }));
      setCurrentVisualization("map");
    } else if (path.includes("/country")) {
      setFilters((prevFilters) => ({
        ...prevFilters,
        exAnteFormat: "chart",
        exPostFormat: "chart",
        country: "IT",
        year: "2019",
      }));
      setCurrentVisualization("exAnte");
    }
  }, [window.location.pathname]);

  useEffect(() => {
    fetch('/wp-content/reactpress/apps/data-viz-geom/build/instructions.json')
      .then(response => response.json())
      .then(data => {
        setInstructions(data)
      })
      .catch(error => console.error('Failed to load tooltips', error));
  }, []);

  useEffect(() => {
    fetch("/wp-content/reactpress/apps/data-viz-geom/build/countryOptions.json")
      .then((response) => response.json())
      .then((data) => {
        setFilterOptions((prevOptions) => ({
          ...prevOptions,
          countries: data,
        }));
      })
      .catch((error) => console.error("Error loading country data:", error));
  }, []);

  useEffect(() => {
    fetch("/wp-content/reactpress/apps/data-viz-geom/build/data/filters/country_filters.json")
      .then((response) => response.json())
      .then((data) => {
        const countryOptions = Object.entries(data).map(([key, value]) => ({
          value: key,
          label: value.name,
          years: value.years,
        }));
        setFilterOptions((prevOptions) => ({
          ...prevOptions,
          country: countryOptions,
        }));
      })
      .catch((error) => console.error("Error loading country data:", error));
  }, []);

  useEffect(() => {
    if (filters.country) {
      const selectedCountry = filterOptions.country.find(
        (c) => c.value === filters.country
      );
      if (selectedCountry && selectedCountry.years) {
        const yearOptions = selectedCountry.years.map((year) => ({
          value: year,
          label: year.toString(),
        }));
        setFilterOptions((prevOptions) => ({
          ...prevOptions,
          year: yearOptions,
        }));
        if (
          yearOptions.length > 0 &&
          (!filters.year || !selectedCountry.years.includes(filters.year))
        ) {
          setFilters((prevFilters) => ({
            ...prevFilters,
            year: yearOptions[yearOptions.length - 1].value,
          }));
        }
      } else {
        setFilterOptions((prevOptions) => ({
          ...prevOptions,
          year: [],
        }));
        setFilters((prevFilters) => ({
          ...prevFilters,
          year: "",
        }));
      }
    }
  }, [filters.country, filterOptions.country]);

  useEffect(() => {
    const finalDataUrl = "/wp-content/reactpress/apps/data-viz-geom/build/data/processed/final.csv";
    const finalTableDataUrl = "/wp-content/reactpress/apps/data-viz-geom/build/data/processed/final_table.csv";

    Promise.all([d3.csv(finalDataUrl), d3.csv(finalTableDataUrl)])
      .then((data) => {
        setWorldData(data[0]); // final.csv data
        // console.log(data[0]);
        setTableData(data[1]); // final_table.csv data
        // console.log(data[1]);
      })
      .catch((err) => {
        console.error("Error loading CSV data:", err);
      });
  }, []);

  useEffect(() => {
    const resultsUrl = "/wp-content/reactpress/apps/data-viz-geom/build/data/processed/results.csv";

    d3.csv(resultsUrl)
      .then((data) => {
        setCountryTableData(data);
      })
      .catch((err) => {
        console.error("Error loading CSV data:", err);
      });
  }, []);

  useEffect(() => {
    if (filters.country && filters.year) {
      fetch("/wp-content/reactpress/apps/data-viz-geom/build/data/filters/descriptives.json")
        .then((response) => response.json())
        .then((data) => {
          setPdfs({
            exAnte: `/wp-content/reactpress/apps/data-viz-geom/build/pdfs/ex-ante/${filters.country}_${filters.year}_all.pdf`,
            exPost: `/wp-content/reactpress/apps/data-viz-geom/build/pdfs/ex-post/${filters.country}_${filters.year}_all.pdf`,
            types: `/wp-content/reactpress/apps/data-viz-geom/build/pdfs/types/${filters.country}_${filters.year}_all.pdf`,
            alluvial: `/wp-content/reactpress/apps/data-viz-geom/build/pdfs/alluvial/${filters.country}_${filters.year}_all.pdf`,
            descriptive: `/wp-content/reactpress/apps/data-viz-geom/build/pdfs/descriptives/Descriptives_${
              data[filters.country].name
            }_${filters.year}.pdf`,
          });
        })
        .catch((error) =>
          console.error("Error loading descriptive data:", error)
        );
    }
  }, [filters.country, filters.year]);

  const handleFilterChange = (filterName, value) => {
     //console.log(`Filter change: { filterName: ${filterName}}, value: ${value}`);
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
    if (filterName === "countries") {
      setFilters((prevFilters) => {
        const currentCountries = prevFilters[filterName];
        let newCountries;

        if (Array.isArray(value)) {
          newCountries = value;
        } else {
          if (currentCountries.includes(value)) {
            newCountries = currentCountries.filter(
              (country) => country !== value
            );
          } else {
            newCountries = [...currentCountries, value];
          }
        }

        return {
          ...prevFilters,
          [filterName]: newCountries,
        };
      });
    }
    if (filterName === "country") {
      setFilters((prevFilters) => ({
        ...prevFilters,
        year: "",
      }));
    }
  };

  const renderFilters = (route) => {
    const worldFilters = {
      map: ["measure", "perspective", "approach", "variable"],
      table: ["measure", "approach", "year", "region"],
      chart: ["measure", "perspective", "approach", "variable", "countries"],
    };
    const countryFilters = {
      exAnte: ["exAnteFormat", "country", "year"],
      exPost: ["exPostFormat", "country", "year"],
      alluvial: ["country", "year"],
      descriptive: ["country", "year"],
      countryTable: ["country", "year"],
    };

    const activeFilters =
      route === "world"
        ? worldFilters[currentVisualization]
        : countryFilters[currentVisualization];

    if (!activeFilters) return null;

    return activeFilters.map((filterKey) => (
      <Filter
        key={filterKey}
        label={
          filterKey === "exAnteFormat" || filterKey === "exPostFormat"
            ? "Format"
            : filterKey.charAt(0).toUpperCase() + filterKey.slice(1)
        }
        options={filterOptions[filterKey]}
        value={filters[filterKey]}
        onChange={(value) => handleFilterChange(filterKey, value)}
      />
    ));
  };  
  
  // //PDF Generator (JSPDF & HTM2CANVAS)
  // const [loader, setLoader] = useState(false);
  // const downloadPDF = () =>{
  //   const capture = document.querySelector('.rpv-core__canvas-layer'); //for alluvial graphs
  //   //const capture = document.querySelector('.pdfContent');
  //   setLoader(true);
  //   html2canvas(capture).then((canvas)=>{
  //     const imgData = canvas.toDataURL('img/png');
  //     const doc = new jsPDF ('p', 'px', 'a4');
  //     const componentWidth = doc.internal.pageSize.getWidth();
  //     const componentHeight = doc.internal.pageSize.getHeight('100%');
  //     doc.addImage(imgData, 'PNG', 0, 0, componentWidth, componentHeight);
  //     setLoader(false);
  //     doc.save(`${new Date().toISOString()}.pdf`);
  //     //window.open(`${worldFilters[currentVisualization]}.pdf`);
  //   })};
  
  return (
    <Router>
      <div className="App">
        <header className="Header">
          <h1>Global Estimates of Opportunity and Mobility</h1>
        </header>
        <Routes>
          <Route
            path="/world-view-2"
            element={
              <>
                <nav className="controlsRow">
                  <VisualizationSelector
                    type={"world"}
                    currentVisualization={currentVisualization || "map"}
                    setCurrentVisualization={setCurrentVisualization}
                  />
                </nav>
                <div className="visualization-filters">
                  {renderFilters("world")}
                </div>
              </>
            }
          />
          <Route
            path="/country-profile-2"
            element={
              <>
                <div className="visualization-filters">
                  {renderFilters("country")}
                </div>
                <nav className="controlsRow">
                  <VisualizationSelector
                    type={"country"}
                    currentVisualization={currentVisualization || "exAnte"}
                    setCurrentVisualization={setCurrentVisualization}
                  />
                </nav>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/country-profile-2" replace />} />

        </Routes>
        <main>
          {currentVisualization === "map" && (
            <Map data={worldData} filters={filters} />
          )}
          {currentVisualization === "table" && (
            <Table data={tableData} filters={filters} />
          )}
          {currentVisualization === "chart" && (
            <TimeSeries data={worldData} filters={filters} />
          )}
          {currentVisualization === "exAnte" &&
            filters.exAnteFormat === "chart" && (
              <ChartsWrapper
                data={filterOptions.country}
                filters={filters}
                visualization={currentVisualization}
              />
            )}
          {currentVisualization === "exAnte" &&
          filters.exAnteFormat === "pdf" ? (
            <PDFViewer fileUrl={pdfs[currentVisualization]} />
          ) : null}
          {currentVisualization === "exAnte" &&
            filters.exAnteFormat === "decomposition" && (
              <Decomposition
                data={filterOptions.country}
                filters={filters}
                visualization={currentVisualization}
              />
            )}
          {currentVisualization === "exPost" &&
            filters.exPostFormat === "decomposition" && (
              <Decomposition
                data={filterOptions.country}
                filters={filters}
                visualization={currentVisualization}
              />
            )}
          {currentVisualization === "exPost" &&
            filters.exPostFormat === "chart" && (
              <ChartsWrapper
                data={filterOptions.country}
                filters={filters}
                visualization={currentVisualization}
              />
            )}
          {currentVisualization === "exPost" &&
          filters.exPostFormat === "pdf" ? (
            <PDFViewer fileUrl={pdfs[currentVisualization]} />
          ) : null}
          {currentVisualization === "exPost" &&
          filters.exPostFormat === "types" ? (
            <>
              <PDFViewer fileUrl={pdfs["types"]} />
              <TypesDescription filters={filters} />
            </>
          ) : null}
          {currentVisualization === "alluvial" ? (
            <PDFViewer fileUrl={pdfs[currentVisualization]} />
          ) : null}
          {currentVisualization === "descriptive" && (
            <PDFViewer fileUrl={pdfs["descriptive"]} />
          )}
          {currentVisualization === "countryTable" && (
            <CountryTable data={countryTableData} filters={filters} />
          )}  
        </main>
        {/* <div className="visualization-filters" onClick={downloadPDF} disabled={!(loader===false)}>
          {loader?(<span>Downloading</span>):(<span>Download</span>)}
        </div> */}
        <footer>
          {instructions[currentVisualization] && <p>
            <strong>How to read the data: </strong> 
            <span dangerouslySetInnerHTML={{ __html: instructions[currentVisualization] }} />
          </p>}
        </footer>
      </div>
    </Router>
  );
}
export default App;
