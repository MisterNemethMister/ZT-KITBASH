import React, { useMemo } from 'react';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';
import { linkVertical } from 'd3-shape';
import { OOUX_DEFINITIONS } from '../data/oouxModel';

// Custom vertical link generator for sankey
const sankeyLinkVertical = () => {
  return (link) => {
    const sourceX = link.source.x0 + (link.source.x1 - link.source.x0) / 2;
    const targetX = link.target.x0 + (link.target.x1 - link.target.x0) / 2;
    const sourceY = link.source.y1;
    const targetY = link.target.y0;
    const midY = (sourceY + targetY) / 2;
    
    // Calculate width offset for the link band
    const halfWidth = Math.max(1, link.width / 2);
    
    return `M${sourceX - halfWidth},${sourceY}
            C${sourceX - halfWidth},${midY} ${targetX - halfWidth},${midY} ${targetX - halfWidth},${targetY}
            L${targetX + halfWidth},${targetY}
            C${targetX + halfWidth},${midY} ${sourceX + halfWidth},${midY} ${sourceX + halfWidth},${sourceY}
            Z`;
  };
};

const SankeyChart = ({ nodes, edges, events, width = 600, height = 400, vertical = false, onNodeClick }) => {
  const sankeyData = useMemo(() => {
    if (!nodes || nodes.length === 0 || !events || events.length === 0) {
      return null;
    }

    // Count traffic per edge
    const edgeTraffic = new Map();
    for (const evt of events) {
      if (!evt.edgeId) continue;
      const key = `${evt.source}|${evt.target}`;
      edgeTraffic.set(key, (edgeTraffic.get(key) || 0) + (evt.bytes || 1));
    }

    // Build node index map
    const nodeMap = new Map();
    const sankeyNodes = [];
    
    // Only include nodes that have traffic
    const activeNodeIds = new Set();
    for (const evt of events) {
      if (evt.source) activeNodeIds.add(evt.source);
      if (evt.target) activeNodeIds.add(evt.target);
    }

    // Group nodes by type for better layout
    const nodesByType = new Map();
    for (const node of nodes) {
      if (!activeNodeIds.has(node.id)) continue;
      const type = node.data?.nodeType || 'unknown';
      if (!nodesByType.has(type)) {
        nodesByType.set(type, []);
      }
      nodesByType.get(type).push(node);
    }

    // Add nodes in type order
    let idx = 0;
    for (const [type, typeNodes] of nodesByType) {
      for (const node of typeNodes) {
        nodeMap.set(node.id, idx);
        sankeyNodes.push({
          id: node.id,
          name: node.data?.label || node.id,
          nodeType: node.data?.nodeType || 'unknown',
          originalId: node.id,
        });
        idx++;
      }
    }

    // Build links from traffic data using string IDs
    const sankeyLinks = [];
    for (const [key, value] of edgeTraffic) {
      const [source, target] = key.split('|');
      
      // Only add link if both nodes exist in our node set
      if (nodeMap.has(source) && nodeMap.has(target) && source !== target) {
        sankeyLinks.push({
          source: source,
          target: target,
          value: value,
        });
      }
    }

    if (sankeyNodes.length === 0 || sankeyLinks.length === 0) {
      return null;
    }

    try {
      // Create sankey generator
      const sankeyGenerator = sankey()
        .nodeId((d) => d.id)
        .nodeWidth(vertical ? 12 : 20)
        .nodePadding(vertical ? 20 : 12)
        .extent([[20, 20], [width - 20, height - 20]]);

      // Generate layout
      const { nodes: layoutNodes, links: layoutLinks } = sankeyGenerator({
        nodes: sankeyNodes.map((d) => ({ ...d })),
        links: sankeyLinks.map((d) => ({ ...d })),
      });

      return { nodes: layoutNodes, links: layoutLinks, vertical };
    } catch (err) {
      console.error('Sankey layout error:', err);
      return null;
    }
  }, [nodes, edges, events, width, height, vertical]);

  if (!sankeyData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        No traffic data to display
      </div>
    );
  }

  const { nodes: sankeyNodes, links: sankeyLinks, vertical: isVertical } = sankeyData;

  // Calculate max value for opacity scaling
  const maxValue = Math.max(...sankeyLinks.map((l) => l.value));

  const getNodeColor = (node) => {
    const def = OOUX_DEFINITIONS[node.nodeType];
    return def?.color || '#6b7280';
  };

  const formatBytes = (bytes) => {
    if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)}GB`;
    if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
    if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)}KB`;
    return `${bytes}B`;
  };

  const linkGenerator = isVertical ? sankeyLinkVertical() : sankeyLinkHorizontal();

  return (
    <svg width={width} height={height} className="block">
      <defs>
        {sankeyLinks.map((link, i) => {
          const sourceColor = getNodeColor(link.source);
          const targetColor = getNodeColor(link.target);
          return (
            <linearGradient
              key={`gradient-${i}`}
              id={`gradient-${i}`}
              gradientUnits="userSpaceOnUse"
              x1={isVertical ? (link.source.x0 + link.source.x1) / 2 : link.source.x1}
              y1={isVertical ? link.source.y1 : (link.source.y0 + link.source.y1) / 2}
              x2={isVertical ? (link.target.x0 + link.target.x1) / 2 : link.target.x0}
              y2={isVertical ? link.target.y0 : (link.target.y0 + link.target.y1) / 2}
            >
              <stop offset="0%" stopColor={sourceColor} stopOpacity={0.5} />
              <stop offset="100%" stopColor={targetColor} stopOpacity={0.5} />
            </linearGradient>
          );
        })}
      </defs>

      {/* Links */}
      <g className="links">
        {sankeyLinks.map((link, i) => {
          const opacity = 0.3 + (link.value / maxValue) * 0.5;
          return (
            <g key={`link-${i}`}>
              <path
                d={linkGenerator(link)}
                fill={isVertical ? `url(#gradient-${i})` : 'none'}
                stroke={isVertical ? 'none' : `url(#gradient-${i})`}
                strokeWidth={isVertical ? 0 : Math.max(2, link.width)}
                fillOpacity={isVertical ? opacity : 1}
                strokeOpacity={isVertical ? 1 : opacity}
                className="transition-opacity hover:opacity-80"
              />
              <title>
                {link.source.name} → {link.target.name}: {formatBytes(link.value)}
              </title>
            </g>
          );
        })}
      </g>

      {/* Nodes */}
      <g className="nodes">
        {sankeyNodes.map((node, i) => {
          const color = getNodeColor(node);
          const nodeWidth = node.x1 - node.x0;
          const nodeHeight = Math.max(node.y1 - node.y0, 8);
          return (
            <g
              key={`node-${i}`}
              transform={`translate(${node.x0}, ${node.y0})`}
              onClick={() => onNodeClick && onNodeClick(node)}
              style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            >
              <rect
                width={nodeWidth}
                height={nodeHeight}
                fill={color}
                rx={4}
                className="transition-opacity hover:opacity-80"
              />
              <title>{node.name}</title>
              <text
                x={isVertical ? nodeWidth / 2 : (node.x0 < width / 2 ? nodeWidth + 6 : -6)}
                y={isVertical ? nodeHeight + 12 : nodeHeight / 2}
                dy={isVertical ? '0' : '0.35em'}
                textAnchor={isVertical ? 'middle' : (node.x0 < width / 2 ? 'start' : 'end')}
                className="text-xs font-medium fill-gray-700"
                style={{ pointerEvents: 'none' }}
              >
                {node.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default SankeyChart;
