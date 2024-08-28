import React, { useEffect, useState, useRef } from "react";
import * as d3 from "d3";

import Tooltip from "./Tooltip";
import "./TreeGraph.css";

function traverseTree(node, result = []) {
  if (node.children) {
    node.children.forEach((child) => {
      traverseTree(child, result);
    });
  } else {
    result.push(node.info.Relative_Type_Mean);
  }

  return result;
}

function traverseTreeGetChilds(node, result = []) {
  if (result.length === 0) result.push(node.data.id);
  if (node._children) {
    node._children.forEach((child) => {
      result.push(child.data.id);
      traverseTreeGetChilds(child, result);
    });
  }

  return result;
}

const ExtendedVarNames = {
  Ethnicity: "Ethnicity",
  Sex: "Sex",
  Father_Occ: "Father Occupation",
  Father_Edu: "Father Education",
  Mother_Edu: "Mother Education",
  Mother_Occ: "Mother Occupation",
  Birth_Area: "Birth Area",
  Pop_Share: "Population Share (%)",
  Relative_Type_Mean: "Relative Type Mean",
};

function TreeGraph({
  data,
  filters,
  hoveredNode,
  setHoveredNode,
  inactiveNodes,
  setInactiveNodes,
  visualization,
}) {
  const ref = useRef();
  const gNodeRef = useRef();
  const gLinkRef = useRef();
  const nodesThreshold = 30;

  const [tooltip, setTooltip] = useState({
    content: null,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (gNodeRef.current) {
      const node = gNodeRef.current.select(".hovered");
      if (!node.empty()) {
        const nodeClass = node.attr("class");
        node.attr("class", nodeClass.replace("hovered", ""));
        setTooltip({ content: null, position: { x: 0, y: 0 } });
      }
    }
    if (gNodeRef.current && hoveredNode) {
      const node = gNodeRef.current.select(`.${hoveredNode}`);
      if (!node.empty()) {
        node.attr("class", `node ${hoveredNode} hovered`);

        const coordinates = node.node().getBoundingClientRect();
        const content = Object.entries(node.data()[0].data.info)
          .filter(([key, value]) => (key !== "Box_Number" ? true : false))
          .map(([key, value]) => {
            return (
              <p key={key}>
                <b>{ExtendedVarNames[key]}:</b> {value}
              </p>
            );
          });

        if (!tooltip.content)
          setTooltip({
            content: content,
            position: { x: coordinates.x + 10, y: coordinates.y + 10 },
          });
      }
    }
  }, [gNodeRef, hoveredNode]);

  useEffect(() => {
    if (
      !data ||
      !Array.isArray(data) ||
      data.length === 0 ||
      !filters.country ||
      !filters.year
    ) {
      console.log("Data or filters are incomplete.");
      return;
    }

    const type = visualization === "exAnte" ? "ex-ante" : "ex-post";
    const country = data.find(
      (country) => country.value === filters.country
    ).value;
    const year = filters.year;

    const margin = { top: 40, right: 40, bottom: 40, left: 40 },
      width = 600 - margin.right - margin.left,
      height = 600 - margin.top - margin.bottom;

    // Create the SVG container, a layer for the links and a layer for the nodes.
    const svg = d3
      .select(ref.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .attr("viewBox", [
        0,
        0,
        width + margin.left + margin.right,
        height + margin.top + margin.bottom,
      ]);

    d3.json(
      `/wp-content/reactpress/apps/data-viz-geom/build/data/${type}/tree/${country}_${year}_${type.replace("-", "")}.json`
    )
      .then((data) => {
        // Traverse the tree and get the values of the child nodes that are leaves.
        const leaf = traverseTree(data);

        // Set the domain for the color scale.
        const color = d3
          .scaleSequential(d3.interpolateYlOrBr)
          .domain([d3.max(leaf), 0]);

        const root = d3.hierarchy(data);

        const dy = height / root.height; // Fit vertically
        const dx = (width / root.descendants().length) * 1.5; // Fit horizontally
        // const dx = width / leaf.length; // Fit horizontally

        // Define the tree layout and the shape for links.
        const tree = d3.tree().nodeSize([dx, dy]);
        const diagonal = d3
          .linkVertical()
          .x((d) => d.x)
          .y((d) => d.y);

        gLinkRef.current = svg
          .append("g")
          .attr("fill", "none")
          .attr("stroke", "#555")
          .attr("stroke-opacity", 0.4)
          .attr("stroke-width", 1.5)
          .attr(
            "transform",
            `translate(${width / 2 + margin.left}, ${margin.top})`
          );

        gNodeRef.current = svg
          .append("g")
          .attr("cursor", "pointer")
          .attr("pointer-events", "all")
          .attr(
            "transform",
            `translate(${width / 2 + margin.left}, ${margin.top})`
          );

        function update(event, source, duration = 500) {
          const nodes = root.descendants().reverse();
          const links = root.links();

          // Compute the new tree layout.
          tree(root);

          let left = root;
          let right = root;
          root.eachBefore((node) => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
          });

          const transition = svg
            .transition()
            .duration(duration)
            .tween(
              "resize",
              window.ResizeObserver ? null : () => () => svg.dispatch("toggle")
            );

          // Update the nodes…
          const node = gNodeRef.current.selectAll("g").data(nodes, (d) => d.id);

          // Enter any new nodes at the parent's previous position.
          const nodeEnter = node
            .enter()
            .append("g")
            .attr("class", (d) => {
              if (!d._children) {
                return `node node-${d.data.info.Box_Number}`;
              }
              return "node";
            })
            .attr("transform", (d) => `translate(${source.x0},${source.y0})`)
            .style("fill-opacity", 0)
            .style("stroke-opacity", 0)
            .on("click", (event, d) => {
              const nodeIds = traverseTreeGetChilds(d);

              setInactiveNodes((inactiveNodes) => {
                let newInactiveNodes = [...inactiveNodes];

                // collapse
                if (!nodeIds.every((node) => newInactiveNodes.includes(node))) {
                  newInactiveNodes = [...newInactiveNodes, ...nodeIds];
                  return newInactiveNodes;
                }
                // expand
                else {
                  // Count occurrences of each node
                  const nodeCount = newInactiveNodes.reduce((count, node) => {
                    count[node] = (count[node] || 0) + 1;
                    return count;
                  }, {});
                  newInactiveNodes = newInactiveNodes.filter((node) => {
                    if (nodeIds.includes(node)) {
                      if (nodeCount[node] > 1) {
                        nodeCount[node]--;
                        return true;
                      }
                      return false;
                    }
                    return true;
                  });
                  return newInactiveNodes;
                }
              });

              d.children = d.children ? null : d._children;
              update(event, d);
            })
            .on("mouseover", function (event, d) {
              if (nodes.length > nodesThreshold && d._children) {
                const content = (
                  <p>
                    <b>{ExtendedVarNames[d.data.nodeName]}</b>
                  </p>
                );
                setTooltip({
                  content: content,
                  position: { x: event.pageX + 10, y: event.pageY + 10 },
                });
              }

              if (!d._children) {
                const data = d.data.info;
                const content = Object.entries(data)
                  .filter(([key, value]) =>
                    key !== "Box_Number" ? true : false
                  )
                  .map(([key, value]) => {
                    return (
                      <p key={key}>
                        <b>{ExtendedVarNames[key]}:</b> {value}
                      </p>
                    );
                  });

                setHoveredNode(`node-${d.data.info.Box_Number}`);
                setTooltip({
                  content: content,
                  position: { x: event.pageX + 10, y: event.pageY + 10 },
                });
              }
            })
            .on("mousemove", function (event, d) {
              setTooltip((tooltip) => {
                return {
                  content: tooltip.content,
                  position: { x: event.pageX + 10, y: event.pageY + 10 },
                };
              });
            })
            .on("mouseout", function () {
              setHoveredNode("");
              setTooltip({ content: null, position: { x: 0, y: 0 } });
            });

          nodeEnter
            .append("circle")
            .attr("r", 1e-6)
            .style("fill", (d) => {
              return d._children
                ? "black"
                : `${color(d.data.info.Relative_Type_Mean)}`;
            });

          if (nodes.length <= nodesThreshold)
            nodeEnter
              .append("text")
              .attr("dy", "-1em")
              .attr("x", -5)
              .attr("text-anchor", "start")
              .text((d) => ExtendedVarNames[d.data.nodeName])
              .style("fill-opacity", 1e-6)
              .attr("stroke-linejoin", "round")
              .attr("stroke-width", 3)
              .attr("stroke", "white")
              .attr("paint-order", "stroke");

          // Transition nodes to their new position.
          const nodeUpdate = node
            .merge(nodeEnter)
            .transition(transition)
            .attr("transform", (d) => `translate(${d.x},${d.y})`)
            .style("fill-opacity", 1)
            .style("stroke-opacity", 1);

          nodeUpdate
            .select("circle")
            //.attr("r", 6)
            .attr("r", (d) => {
              if (d._children) return 6;
              else return 7;
            })
            .style("fill", (d) => {
              if (d._children) return "black";
              else return `${color(d.data.info.Relative_Type_Mean)}`;
            });

          nodeUpdate.select("text").style("fill-opacity", 1);

          // Transition exiting nodes to the parent's new position.
          const nodeExit = node
            .exit()
            .transition(transition)
            .remove()
            .attr("transform", (d) => `translate(${source.x},${source.y})`)
            .style("fill-opacity", 0)
            .style("stroke-opacity", 0);

          nodeExit.select("circle").attr("r", 1e-6);

          nodeExit.select("text").style("fill-opacity", 1e-6);

          // Update the links…
          const link = gLinkRef.current
            .selectAll("path.link")
            .data(links, (d) => d.target.id);

          // Enter any new links at the parent's previous position.
          const linkEnter = link
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", (d) => {
              const o = { x: source.x0, y: source.y0 };
              return diagonal({ source: o, target: o });
            })
            .on("mouseover", function (event, d) {
              const splitCondition = d.target.data.split_condition
                .split(" -> ")[1]
                .split(",");

              const content = splitCondition.map((condition, i) => (
                <p key={`condition-${i}`}>{condition}</p>
              ));

              setTooltip({
                content: content,
                position: { x: event.pageX + 10, y: event.pageY + 10 },
              });
            })
            .on("mousemove", function (event, d) {
              setTooltip((tooltip) => {
                return {
                  content: tooltip.content,
                  position: { x: event.pageX + 10, y: event.pageY + 10 },
                };
              });
            })
            .on("mouseout", function () {
              setTooltip({ content: null, position: { x: 0, y: 0 } });
            });

          // Transition links to their new position.
          const linkUpdate = link
            .merge(linkEnter)
            .transition(transition)
            .attr("d", diagonal);

          // Transition exiting nodes to the parent's new position.
          link
            .exit()
            .transition(transition)
            .remove()
            .attr("d", (d) => {
              const o = { x: source.x, y: source.y };
              return diagonal({ source: o, target: o });
            });

          // Stash the old positions for transition.
          root.eachBefore((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
          });
        }

        // Do the first update to the initial configuration of the tree — where a number of nodes
        // are open (arbitrarily selected as the root, plus nodes with 7 letters).
        root.x0 = dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
          d.id = i;
          d._children = d.children;
          //if (d.depth) d.children = null;
          if (inactiveNodes.includes(d.data.id)) d.children = null;
        });

        update(null, root, 0);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, filters, visualization]);

  return (
    <div className="graph-align">
      <svg ref={ref}></svg>
      <Tooltip content={tooltip.content} position={tooltip.position} />
    </div>
  );
}

export default TreeGraph;
