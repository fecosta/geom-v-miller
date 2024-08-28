import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { legendColor } from 'd3-svg-legend';
import ResizeObserver from 'resize-observer-polyfill';

import Tooltip from './Tooltip';

const COLUMNS = {
  Name: 'name',
  ISO: 'iso',
  Year: 'y',
  Country: 'c',
  Circumstances: 'Circumstances',
  Latest: 'latest',
  Variable: 'var',
  Region: 'Region',
  Approach1: 'Approach1',
  Value: 'Value',
  Measure: 'Measure',
  Approach: 'Approach',
  Perspective: 'Perspective'
};

function filterWorldData(data, filters) {
  return data.filter(row =>
    parseInt(row[COLUMNS.Latest], 10) === 1 &&
    row[COLUMNS.Perspective] === filters.perspective &&
    row[COLUMNS.Measure] === filters.measure &&
    row[COLUMNS.Approach] === filters.approach &&
    row[COLUMNS.Variable] === filters.variable
  );
}

function Map({ data, filters }) {
  const ref = useRef();
  const wrapperRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [tooltip, setTooltip] = useState({ content: null, position: { x: 0, y: 0 } });

  useEffect(() => {
    d3.json('/wp-content/reactpress/apps/data-viz-geom/build/countries.geojson').then(data => {
      setGeoData(data);
      setLoading(false);
    }).catch(error => {
      console.error('Error loading the GeoJSON file: ', error);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      setDimensions({
        width: entries[0].contentRect.width,
        height: 600
      });
    });
    resizeObserver.observe(wrapperRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const { approach, measure, perspective, variable } = filters;
    if (!data || !geoData || !approach || !measure || !perspective || !variable) {
      console.log('Data or filters are incomplete.');
      return;
    }

    const svg = d3.select(ref.current);
    const width = dimensions.width;
    const height = dimensions.height;
    const margin = { top: 20, right: 20, bottom: 50, left: 40 };

    const filteredData = filterWorldData(data, filters);
    const colorScale = d3.scaleSequential()
      .domain(d3.extent(filteredData, d => d[COLUMNS.Value]))
      .interpolator(d3.interpolate('#ffff00', '#a62bff'));

      // remove Antarctica
      geoData.features = geoData.features.filter(feature => feature.properties.ADMIN !== 'Antarctica');

      const projection = d3.geoMercator()
        .fitSize([width - margin.left - margin.right, height - margin.top - margin.bottom], geoData);
      const pathGenerator = d3.geoPath().projection(projection);

      svg.selectAll('path').remove();  // Clear existing paths to redraw

      svg.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', pathGenerator)
        .style('fill', datum => {
          const countryData = filteredData.find(country => country[COLUMNS.ISO] === datum.properties.ISO_A3);
          return countryData ? colorScale(countryData[COLUMNS.Value]) : '#ddd';
        })
        .style('stroke-width', '1')
        .style('stroke', '#777')
        .on('mouseover', (event, datum) => {
          const countryData = filteredData.find(country => country[COLUMNS.ISO] === datum.properties.ISO_A3);
          setTooltip({
            content: `${datum.properties.ADMIN}: ${countryData ?  Math.round(countryData[COLUMNS.Value] * 100) / 100 : 'No available data'}`,
            position: { x: event.pageX, y: event.pageY }
          });
        })
        .on('mouseout', () => setTooltip({ content: null, position: { x: 0, y: 0 } }));

      createLegend(svg, colorScale, width, margin);

    return () => svg.selectAll('*').remove();
  }, [geoData, data, filters, dimensions]);

  function createLegend(svg, colorScale, width, margin) {
    const legend = svg.append("g")
      .attr("class", "legendSequential")
      .attr("transform", `translate(${(width - 300) / 2}, ${dimensions.height - 40})`);

    const legendSequential = legendColor()
      .shapeWidth(50)
      .orient('horizontal')
      .scale(colorScale)
      .labelFormat(d3.format(".2f")) 
      .cells(10);

    legend.call(legendSequential);
  }

  //download
  const handleDownload = async () => {
    const element = document.querySelector(".pdfLandscape");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `${filters.country}_${filters.year}_world_chart.png`;
      link.click();
    } catch (error) {
      console.error("Error capturing charts:", error);
    }
  };

  return (
    <>
    <div className='pdfLandscape' ref={wrapperRef} style={{ width: '100%' }}>
      {loading && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading data...
        </div>
      )}
      <svg ref={ref} width={dimensions.width} height={dimensions.height}></svg>
      <Tooltip content={tooltip.content} position={tooltip.position} />
    </div>
    <div className="download-button" onClick={handleDownload}> Download </div>
    </>
  );
}

export default Map;
