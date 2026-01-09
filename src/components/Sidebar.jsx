import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS } from '../data/oouxModel';
import { useNetworkStore } from '../store/networkStore';
import CTAModal from './CTAModal';
import TeamNameModal from './TeamNameModal';

const Sidebar = ({ onFitView, onFitToFiltered, onExport, onImport, onZoomIn, onZoomOut }) => {
  const { selectedNode, deleteNode, setIsEditing, setIsCreating, clearSelection, filterNodeType, setFilterNodeType, clearFilter, nodes, edges, toggleSummaryNodes, showSummaryNodes, setShowSummaryNodes, appView, layoutDirection, toggleLayoutDirection, organizeNodes, accountTeamNames, setAccountTeamName, currentAccountId } = useNetworkStore();
  const [activeCTA, setActiveCTA] = useState(null);
  const [showTeamNameModal, setShowTeamNameModal] = useState(false);
  const teamName = accountTeamNames?.[currentAccountId] || 'My Team';

  const handleCreateNew = () => {
    clearSelection();
    setIsCreating(true);
  };

  const handleEdit = () => {
    if (selectedNode) {
      setIsEditing(true, selectedNode);
    }
  };

  const handleDelete = () => {
    if (selectedNode && window.confirm(`Delete ${selectedNode.data.label}?`)) {
      deleteNode(selectedNode.id);
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">
            Network Objects
          </p>
          <button
            onClick={() => setShowTeamNameModal(true)}
            className="w-full text-left group"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {teamName}
              </h2>
              <Icons.Edit2 className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-semibold">{nodes.length}</span> objects • <span className="font-semibold">{edges.length}</span> connections
          </p>
        </div>

        {showTeamNameModal && (
          <TeamNameModal
            currentName={teamName}
            onClose={() => setShowTeamNameModal(false)}
            onSave={(name) => setAccountTeamName(currentAccountId, name)}
          />
        )}

        <button
          onClick={handleCreateNew}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
        >
          <Icons.Plus className="w-5 h-5" />
          Create New Object
        </button>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={onExport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <Icons.Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
          <button
            onClick={onImport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <Icons.Upload className="w-4 h-4" />
            <span className="text-sm">Import</span>
          </button>
        </div>

        <div className="space-y-4">
          {appView === 'activity' ? (
            <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
              <div className="text-sm font-semibold text-gray-900 mb-1">Activity View</div>
              <div className="text-xs text-gray-600">
                Visualize simulated network activity flowing across existing connections.
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Focus on Object Type
                </h3>
                {filterNodeType && (
                  <button
                    onClick={clearFilter}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 rounded-lg border-2 border-gray-200 overflow-hidden">
                <button
                  onClick={() => {
                    if (!showSummaryNodes) {
                      clearFilter();
                      setShowSummaryNodes(true);
                      setTimeout(() => onFitView(), 300);
                    }
                  }}
                  className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    showSummaryNodes
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icons.LayoutGrid className="w-4 h-4" />
                  Summary
                </button>
                <button
                  onClick={() => {
                    if (showSummaryNodes) {
                      setShowSummaryNodes(false);
                      setTimeout(() => onFitView(), 300);
                    }
                  }}
                  className={`px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-2 border-l-2 border-gray-200 ${
                    !showSummaryNodes
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icons.Maximize2 className="w-4 h-4" />
                  
                  Expanded
                </button>
              </div>

              {!showSummaryNodes && (
                <div className="flex items-center gap-1 rounded-lg border-2 border-gray-200 p-1">
                  <button
                    onClick={onZoomIn}
                    className="flex-1 h-8 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Zoom In"
                  >
                    <Icons.ZoomIn className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={onZoomOut}
                    className="flex-1 h-8 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Zoom Out"
                  >
                    <Icons.ZoomOut className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={onFitView}
                    className="flex-1 h-8 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Fit View"
                  >
                    <Icons.Maximize className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => {
                      toggleLayoutDirection();
                      setTimeout(() => {
                        organizeNodes();
                        onFitView();
                      }, 50);
                    }}
                    className="flex-1 h-8 hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                    title="Toggle Layout Direction"
                  >
                    {layoutDirection === 'horizontal' ? (
                      <Icons.ArrowLeftRight className="w-4 h-4 text-gray-700" />
                    ) : (
                      <Icons.ArrowUpDown className="w-4 h-4 text-gray-700" />
                    )}
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  clearFilter();
                  setTimeout(() => onFitView(), 100);
                }}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  !filterNodeType
                    ? 'border-blue-500 shadow-lg bg-blue-50'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="p-1 rounded"
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    <Icons.Grid3x3 className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-semibold text-sm">All Object Types</span>
                </div>
                <p className="text-xs text-gray-600">View all objects in the network</p>
              </button>

              {Object.entries(OOUX_DEFINITIONS).map(([type, definition]) => {
                const IconComponent = Icons[definition.icon] || Icons.Circle;
                const isActive = filterNodeType === type;

                return (
                  <button
                    key={type}
                    onClick={() => {
                      // If in summary view, switch to expanded view first
                      if (showSummaryNodes) {
                        toggleSummaryNodes();
                      }
                      setFilterNodeType(type);
                      setTimeout(() => onFitToFiltered(type), 100);
                    }}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      isActive
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="p-1 rounded"
                        style={{ backgroundColor: definition.color }}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-semibold text-sm">{definition.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{definition.description}</p>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  }

  const definition = OOUX_DEFINITIONS[selectedNode.data.nodeType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: definition.color }}
          >
            <IconComponent className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase">
              {definition.name}
            </div>
            <div className="text-lg font-bold text-gray-900">
              {selectedNode.data.label}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600">{definition.description}</p>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Attributes
        </h3>
        <div className="space-y-2">
          {Object.entries(selectedNode.data.attributes).map(([key, value]) => (
            <div key={key} className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="text-sm text-gray-900 font-medium">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Relations
        </h3>
        <div className="flex flex-wrap gap-2">
          {definition.relations.map((rel) => (
            <span
              key={rel}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {OOUX_DEFINITIONS[rel]?.name || rel}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Calls to Action
        </h3>
        <div className="flex flex-wrap gap-2">
          {definition.callsToAction.map((cta) => (
            <button
              key={cta}
              onClick={() => setActiveCTA(cta)}
              className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded-lg transition-colors font-medium"
            >
              {cta.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-gray-200">
        <button
          onClick={handleEdit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Icons.Edit className="w-4 h-4" />
          Edit Object
        </button>
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Icons.Trash2 className="w-4 h-4" />
          Delete Object
        </button>
        <button
          onClick={clearSelection}
          className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>

      {activeCTA && (
        <CTAModal
          node={selectedNode}
          action={activeCTA}
          onClose={() => setActiveCTA(null)}
          onExecute={(action, data) => {
            console.log(`Executed ${action} with data:`, data);
            setTimeout(() => setActiveCTA(null), 2000);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;
