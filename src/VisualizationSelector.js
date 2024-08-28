import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTable, faGlobe, faChartLine, faChartPie, faChartSimple, faSquarePollVertical, faFileText } from '@fortawesome/free-solid-svg-icons';
import './VisualizationSelector.css';

function VisualizationSelector({ setCurrentVisualization, currentVisualization, type }) {
  const buttons = {
    world: [
      { key: 'map', icon: faGlobe, label: 'Map' },
      { key: 'table', icon: faTable, label: 'Table' },
      { key: 'chart', icon: faChartLine, label: 'Chart' }
    ],
    country: [
      { key: 'exAnte', icon: faChartPie, label: 'Ex-Ante' },
      { key: 'exPost', icon: faChartPie, label: 'Ex-Post' },
      { key: 'alluvial', icon: faSquarePollVertical, label: 'Alluvial' },
      { key: 'descriptive', icon: faFileText, label: 'Descriptive' },
      { key: 'countryTable', icon: faTable, label: 'Table' }
    ]
  };
  return (
    <div className="visualization-selector">
      {
        buttons[type].map(button => (
          <div
            key={button.key}
            className={`visualization-option ${currentVisualization === button.key ? 'active' : ''}`}
            onClick={() => setCurrentVisualization(button.key)}
          >
            <FontAwesomeIcon icon={button.icon} />
            <span>{button.label}</span>
          </div>
        ))
      }
    </div>
  );
}

export default VisualizationSelector;
