import React, { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './components/CustomNode';
import SummaryNode from './components/SummaryNode';
import Sidebar from './components/Sidebar';
import NodeForm from './components/NodeForm';
import Toolbar from './components/Toolbar';
import ActivityDashboard from './components/ActivityDashboard';
import SettingsView from './components/SettingsView';
import AccountView from './components/AccountView';
import StatusWidget from './components/StatusWidget';
import { useNetworkStore } from './store/networkStore';
import { OOUX_DEFINITIONS } from './data/oouxModel';

function NetworkCanvas() {
  const nodeTypes = useMemo(() => ({
    custom: CustomNode,
    summary: SummaryNode,
  }), []);

  const {
    nodes,
    edges,
    activityEvents,
    selectedNode,
    connectedNodeIds,
    isCreating,
    isEditing,
    editingNode,
    filterNodeType,
    showSummaryNodes,
    appView,
    collapsedGroups,
    layoutDirection,
    currentAccountId,
    pendingFocusNodeId,
    setSelectedNode,
    clearSelection,
    setIsCreating,
    setIsEditing,
    onNodesChange,
    onEdgesChange,
    onConnect,
    organizeNodes,
    toggleSummaryNodes,
    clearPendingFocusNodeId,
  } = useNetworkStore();

  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();
  const fileInputRef = useRef(null);
  const pendingFocusRef = useRef(null);
  const lastAutoOrganizeKeyRef = useRef(null);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const checkNarrow = () => setIsNarrow(window.innerWidth < 900);
    checkNarrow();
    window.addEventListener('resize', checkNarrow);
    return () => window.removeEventListener('resize', checkNarrow);
  }, []);

  // Store pending focus in ref when it changes (persists across remounts)
  useEffect(() => {
    if (pendingFocusNodeId) {
      pendingFocusRef.current = pendingFocusNodeId;
      clearPendingFocusNodeId();
    }
  }, [pendingFocusNodeId]);

  // Handle ReactFlow init - center on pending focus node if any
  const onInit = useCallback(() => {
    if (pendingFocusRef.current && appView === 'objects') {
      const nodeIdToFocus = pendingFocusRef.current;
      pendingFocusRef.current = null;
      
      setTimeout(() => {
        const targetNode = nodes.find(n => n.id === nodeIdToFocus);
        if (targetNode) {
          setSelectedNode(nodeIdToFocus);
          const x = targetNode.position.x + 100;
          const y = targetNode.position.y + 50;
          setCenter(x, y, { zoom: 1, duration: 400 });
        }
      }, 100);
    }
  }, [appView, nodes, setSelectedNode, setCenter]);

  const effectiveShowSummaryNodes = appView === 'objects' ? showSummaryNodes : false;

  // Keep expanded Objects layout consistent across accounts/directions.
  // (Previously, we only auto-organized on first mount, so non-Production accounts
  // could keep their hard-coded positions and look different.)
  useEffect(() => {
    if (appView !== 'objects' || effectiveShowSummaryNodes) return;
    if (!nodes || nodes.length === 0) return;

    const key = `${currentAccountId}|${layoutDirection}|${filterNodeType || ''}`;
    if (lastAutoOrganizeKeyRef.current === key) return;
    lastAutoOrganizeKeyRef.current = key;

    organizeNodes();
    setTimeout(() => {
      if (filterNodeType) {
        const filteredNodes = nodes.filter((n) => n.data.nodeType === filterNodeType);
        if (filteredNodes.length > 0) {
          fitView({ padding: 0.2, nodes: filteredNodes.map((n) => ({ id: n.id })), duration: 800 });
          return;
        }
      }
      fitView({ padding: 0.2, duration: 800 });
    }, 200);
  }, [appView, effectiveShowSummaryNodes, nodes.length, currentAccountId, layoutDirection, filterNodeType, organizeNodes, fitView, nodes]);

  // Center on selected node when it changes (for cross-view navigation)
  useEffect(() => {
    if (selectedNode && appView === 'objects' && !showSummaryNodes) {
      // Small delay to ensure ReactFlow is ready after potential remount
      const timer = setTimeout(() => {
        const x = selectedNode.position.x + 100;
        const y = selectedNode.position.y + 50;
        setCenter(x, y, { zoom: 1, duration: 400 });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [selectedNode?.id, appView, showSummaryNodes]);

  const displayNodes = useMemo(() => {
    if (!effectiveShowSummaryNodes) {
      const selectedId = selectedNode?.id;
      return nodes.map(node => ({
        ...node,
        draggable: false,
        selected: selectedId === node.id
      }));
    }

    // In summary view, show ALL node types as summary cards (including single nodes)
    const nodesByType = {};
    nodes.forEach(node => {
      const type = node.data.nodeType;
      if (!nodesByType[type]) {
        nodesByType[type] = [];
      }
      nodesByType[type].push(node);
    });

    const summaryNodes = [];
    
    // Create summary cards for ALL node types
    Object.entries(nodesByType).forEach(([type, typeNodes]) => {
      summaryNodes.push({
        id: `summary-${type}`,
        type: 'summary',
        position: { x: 0, y: 0 }, // Will be set below
        draggable: false,
        width: 300,
        height: 140,
        data: {
          nodeType: type,
          count: typeNodes.length,
          nodes: typeNodes
        },
        style: {
          width: 300,
          height: 140
        }
      });
    });

    // Arrange summary nodes in a responsive grid
    const viewportWidth = window.innerWidth - 320; // Subtract sidebar width
    let nodesPerRow = 3;
    let cardWidth = 300;
    let spacingX = 340;
    
    if (viewportWidth < 800) {
      nodesPerRow = 1;
      cardWidth = Math.min(280, viewportWidth - 100);
      spacingX = cardWidth + 40;
    } else if (viewportWidth < 1100) {
      nodesPerRow = 2;
      spacingX = 340;
    }
    
    const spacingY = 180; // Space for 140px card + 40px gap
    
    summaryNodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      node.position = {
        x: 150 + (col * spacingX),
        y: 150 + (row * spacingY)
      };
      // Update card width for narrow views
      if (viewportWidth < 800) {
        node.width = cardWidth;
        node.style = { ...node.style, width: cardWidth };
      }
    });

    return summaryNodes;
  }, [nodes, effectiveShowSummaryNodes, selectedNode?.id, isNarrow]);
  
  const displayEdges = useMemo(() => {
    if (appView === 'objects' && effectiveShowSummaryNodes) return [];

    const shouldShowTraffic = appView === 'objects' && !effectiveShowSummaryNodes;
    const now = Date.now();
    const trafficWindowMs = 5 * 60_000;
    const trafficStart = now - trafficWindowMs;

    const trafficCounts = new Map();
    if (shouldShowTraffic && Array.isArray(activityEvents)) {
      for (const evt of activityEvents) {
        if (!evt || typeof evt.ts !== 'number') continue;
        if (evt.ts < trafficStart || evt.ts > now) continue;
        if (!evt.edgeId) continue;
        trafficCounts.set(evt.edgeId, (trafficCounts.get(evt.edgeId) || 0) + 1);
      }
    }

    const maxCount = shouldShowTraffic ? Math.max(0, ...Array.from(trafficCounts.values())) : 0;

    const fallbackWeight01 = (edgeId) => {
      // Deterministic 0..1 pseudo-random based on edgeId, so the UI always shows an example traffic state.
      // (No new state, stable across renders.)
      const str = String(edgeId || '');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
      }
      return (hash % 1000) / 999;
    };

    const baseWidthFor = (edgeId) => {
      if (!shouldShowTraffic) return 2;
      const c = trafficCounts.get(edgeId) || 0;
      const t = maxCount > 0 ? c / maxCount : fallbackWeight01(edgeId);
      return 2 + t * 6;
    };

    const selectedId = selectedNode?.id;
    const hasSelection = Boolean(selectedId);

    const sourceHandle = layoutDirection === 'horizontal' ? 'source-right' : 'source-bottom';
    const targetHandle = layoutDirection === 'horizontal' ? 'target-left' : 'target-top';

    return edges.map((edge) => {
      const isConnected = hasSelection && (edge.source === selectedId || edge.target === selectedId);
      const baseWidth = baseWidthFor(edge.id);
      return {
        ...edge,
        sourceHandle,
        targetHandle,
        style: {
          ...(edge.style || {}),
          stroke: hasSelection ? (isConnected ? '#10b981' : '#d1d5db') : '#d1d5db',
          strokeWidth: hasSelection ? (isConnected ? Math.max(3, baseWidth + 2) : baseWidth) : baseWidth,
          opacity: hasSelection ? (isConnected ? 1 : 0.3) : 1,
        },
        animated: Boolean(isConnected),
      };
    });
  }, [edges, activityEvents, selectedNode?.id, effectiveShowSummaryNodes, appView, layoutDirection]);

  useEffect(() => {
    if (nodes.length > 0 && !showSummaryNodes) {
      // Auto-organize nodes on first load to prevent overlap
      const { organizeNodes } = useNetworkStore.getState();
      organizeNodes();
      setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 200);
    }
  }, []);

  // Fit view when switching to summary view or when filter changes in expanded view
  useEffect(() => {
    if (appView === 'objects' && effectiveShowSummaryNodes && displayNodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 100);
    } else if (appView === 'objects' && !effectiveShowSummaryNodes && filterNodeType) {
      // Fit to filtered nodes when switching from summary to expanded with filter
      setTimeout(() => {
        const filteredNodes = nodes.filter(n => n.data.nodeType === filterNodeType);
        if (filteredNodes.length > 0) {
          const nodeIds = filteredNodes.map(n => n.id);
          fitView({ padding: 0.2, nodes: nodeIds.map(id => ({ id })), duration: 500 });
        }
      }, 100);
    } else if (appView === 'activity' && nodes.length > 0) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 500 });
      }, 100);
    }
  }, [appView, effectiveShowSummaryNodes, displayNodes.length, filterNodeType, nodes, fitView]);

  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    // Immediately set the selected node to show details
    setSelectedNode(node.id);
  }, [setSelectedNode]);

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleExport = () => {
    const data = {
      nodes,
      edges,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ztna-network-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);
        if (data.nodes && data.edges) {
          useNetworkStore.setState({
            nodes: data.nodes,
            edges: data.edges,
          });
          fitView();
        } else {
          alert('Invalid network file format');
        }
      } catch (error) {
        alert('Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="flex-1 relative" key={`${appView}-${effectiveShowSummaryNodes ? 'summary' : 'expanded'}`}>
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start gap-3">
          <Toolbar
            onFitView={() => fitView({ padding: 0.2 })}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onSearchNavigate={(view, params) => {
              useNetworkStore.getState().setAppView(view);
              if (view === 'objects' && params?.nodeId) {
                useNetworkStore.getState().setShowSummaryNodes(false);
                setTimeout(() => {
                  useNetworkStore.getState().setSelectedNode(params.nodeId);
                  fitView({ padding: 0.2 });
                }, 100);
              }
              if (view === 'account' && params?.switchTo) {
                useNetworkStore.getState().setCurrentAccountId(params.switchTo);
              }
            }}
          />
          <div className="flex-1">
            <StatusWidget compact iconOnly={isNarrow} />
          </div>
        </div>

        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onInit={onInit}
          nodeTypes={nodeTypes}
          className="bg-gray-50"
          defaultEdgeOptions={{ 
            animated: true,
            style: { strokeWidth: 2 },
            labelStyle: { fill: '#374151', fontWeight: 600, fontSize: 12 },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.9 }
          }}
          nodesDraggable={true}
          nodesConnectable={true}
          panOnScroll={true}
          zoomOnScroll={true}
          panOnDrag={true}
          selectionOnDrag={false}
          selectNodesOnDrag={false}
          connectionMode="loose"
          nodesFocusable={false}
          elementsSelectable={false}
          minZoom={0.1}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background color="#e5e7eb" gap={16} />
          <MiniMap
            nodeColor={(node) => {
              const def = OOUX_DEFINITIONS[node.data.nodeType];
              return def?.color || '#999';
            }}
            className="bg-white border border-gray-200"
          />
        </ReactFlow>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Sidebar 
        onFitView={() => fitView({ padding: 0.2 })}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onFitToFiltered={(nodeType) => {
          const filteredNodes = nodes.filter(n => n.data.nodeType === nodeType);
          if (filteredNodes.length > 0) {
            const nodeIds = filteredNodes.map(n => n.id);
            fitView({ padding: 0.2, nodes: nodeIds.map(id => ({ id })) });
          }
        }}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
      />

      {isCreating && (
        <NodeForm
          mode="create"
          onClose={() => setIsCreating(false)}
        />
      )}

      {isEditing && editingNode && (
        <NodeForm
          mode="edit"
          existingNode={editingNode}
          onClose={() => setIsEditing(false, null)}
        />
      )}
    </div>
  );
}

function App() {
  const appView = useNetworkStore((state) => state.appView);

  return (
    <ReactFlowProvider>
      {appView === 'activity' ? (
        <ActivityDashboard />
      ) : appView === 'settings' ? (
        <SettingsView />
      ) : appView === 'account' ? (
        <AccountView />
      ) : (
        <NetworkCanvas />
      )}
    </ReactFlowProvider>
  );
}

export default App;
