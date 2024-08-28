import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './Tooltip';


function Filter({ label, options, value, onChange }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipText, setTooltipText] = useState('');

  useEffect(() => {
    fetch('/wp-content/reactpress/apps/data-viz-geom/build/tooltips.json')
      .then(response => response.json())
      .then(data => {
        setTooltipText(data[label.toLowerCase()])
      })
      .catch(error => console.error('Failed to load tooltips', error));
  }, [label]);

  const handleMouseEnter = (event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY - 5
    });
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };


  if (label === 'Countries') {
    const selectOptions = options.map(option => ({ value: option.value, label: option.label }));
    const selectValue = selectOptions.filter(option => value.includes(option.value));

    return (
      <div className='filter'>
        <span>{label}</span>
        <FontAwesomeIcon
          icon={faInfoCircle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
        {showTooltip && tooltipText && <Tooltip content={<div dangerouslySetInnerHTML={{ __html: tooltipText }} />} position={tooltipPosition} style={{
                    maxWidth: '400px',
                    width: 'auto',
                    whiteSpace: 'normal',
                    zIndex: 100
                }} />}
        <Select
          isMulti
          options={selectOptions}
          value={selectValue}
          onChange={selected => onChange(selected.map(s => s.value))}
        />
      </div>
    );
  }

  return (
    <div className='filter'>
      <span>{label}</span>
      <FontAwesomeIcon
        icon={faInfoCircle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {showTooltip && tooltipText && <Tooltip content={<div dangerouslySetInnerHTML={{ __html: tooltipText }} />} position={tooltipPosition} style={{
                    maxWidth: '400px',
                    width: 'auto',
                    whiteSpace: 'normal',
                    zIndex: 100
                }} />}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export default Filter;
