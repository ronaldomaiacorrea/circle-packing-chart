import { useState } from 'react';
import './App.css';
import { Chart } from './Chart';
import { sampleData } from './data';

function App() {
  const [dimensions, setDimensions] = useState({
    width: 900,
    height: 700
  });

  const handleDimensionChange = (dimension: 'width' | 'height', value: number) => {
    setDimensions(prev => ({
      ...prev,
      [dimension]: value
    }));
  };


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Circle Packing Chart with D3 + ECharts</h1>
        <p>Interactive visualization of hierarchical data using D3 circle packing layout and ECharts rendering</p>
      </header>

      <div className="controls-section">
        <h3>Chart Configuration</h3>
        <div className="controls-grid">
          <div className="control-group">
            <label htmlFor="width-input">Width:</label>
            <input
              id="width-input"
              type="number"
              min="400"
              max="1400"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', parseInt(e.target.value))}
            />
            <span>px</span>
          </div>
          <div className="control-group">
            <label htmlFor="height-input">Height:</label>
            <input
              id="height-input"
              type="number"
              min="300"
              max="1000"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', parseInt(e.target.value))}
            />
            <span>px</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <h3>Research Topics by Subfield</h3>
        <div className="chart-container">
          <Chart
            data={sampleData}
          />
        </div>
      </div>

    </div>
  );
}

export default App
