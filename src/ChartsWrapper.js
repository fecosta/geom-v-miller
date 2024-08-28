import React, { useState } from "react";
import html2canvas from "html2canvas";
import BubblePlot from "./BubblePlot";
import TreeGraph from "./TreeGraph";
import "./ChartsWrapper.css";

function ChartsWrapper(props) {
  const [hoveredNode, setHoveredNode] = useState("");
  const [inactiveNodes, setInactiveNodes] = useState([]);

  //download
  const handleDownload = async () => {
    const element = document.querySelector(".chart-container");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.href = canvas.toDataURL("image/png");
      link.download = `_chart.png`;
      link.click();
    } catch (error) {
      console.error("Error capturing charts:", error);
    }
  };

  return (
    <>
      <div className="chart-container pdfLandscape">
        <TreeGraph
          {...props}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          inactiveNodes={inactiveNodes}
          setInactiveNodes={setInactiveNodes}
        />
        <BubblePlot
          {...props}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
          inactiveNodes={inactiveNodes}
        />
      </div>
      <div className="download-button" onClick={handleDownload}> Download </div>
    </>
  ); 
}
export default ChartsWrapper;
