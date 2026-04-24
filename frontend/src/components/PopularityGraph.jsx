import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import axios from "axios";

export default function PopularityGraph({ locality = "Delhi" }) {
  const svgRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndDraw = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:4002/api/cooks/graph?locality=${locality}`,
        );
        const { nodes, links } = res.data;
        drawGraph(nodes, links);
      } catch (err) {
        setError("Could not load graph");
      } finally {
        setLoading(false);
      }
    };
    fetchAndDraw();
  }, [locality]);

  const drawGraph = (nodes, links) => {
    const width = 600;
    const height = 400;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#f97316")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", (d) => Math.sqrt(d.count) * 2);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      );

    node
      .append("circle")
      .attr("r", (d) => (d.type === "cook" ? 20 + d.totalOrders * 2 : 12))
      .attr("fill", (d) => (d.type === "cook" ? "#f97316" : "#94a3b8"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => (d.type === "cook" ? -25 : -16))
      .attr("font-size", "11px")
      .attr("fill", "#374151");

    node
      .append("title")
      .text((d) =>
        d.type === "cook" ? `${d.name} — ${d.totalOrders} orders` : d.name,
      );

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });
  };

  if (loading)
    return (
      <div className="text-center text-gray-400 py-8">Loading graph...</div>
    );
  if (error)
    return <div className="text-center text-red-400 py-8">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Cook popularity in {locality}
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        Orange = cooks (size = orders), Gray = buyers, Lines = order connections
      </p>
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
