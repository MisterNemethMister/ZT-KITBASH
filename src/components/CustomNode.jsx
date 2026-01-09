import React from 'react';
import { Handle, Position } from 'reactflow';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS } from '../data/oouxModel';
import { useNetworkStore } from '../store/networkStore';

const CustomNode = ({ data, selected, id }) => {
  const filterNodeType = useNetworkStore((state) => state.filterNodeType);
  const connectedNodeIds = useNetworkStore((state) => state.connectedNodeIds || []);
  const selectedNode = useNetworkStore((state) => state.selectedNode);
  const layoutDirection = useNetworkStore((state) => state.layoutDirection);
  const definition = OOUX_DEFINITIONS[data.nodeType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;
  
  const isFiltered = filterNodeType && filterNodeType !== data.nodeType;
  const isHighlighted = filterNodeType && filterNodeType === data.nodeType;
  const isConnected = connectedNodeIds.includes(id);

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px] transition-all cursor-pointer ${
        selected
          ? 'border-blue-500 shadow-xl scale-105'
          : isConnected
          ? 'border-green-500 shadow-xl scale-105'
          : isHighlighted
          ? 'border-blue-400 shadow-xl scale-105'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      style={{ 
        backgroundColor: definition.color + '15',
        opacity: isFiltered ? 0.3 : (selected || isConnected || !selectedNode ? 1 : 0.5),
        pointerEvents: 'all'
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top}
        id="target-top"
        className={`!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-transform ${layoutDirection === 'horizontal' ? '!opacity-0' : ''}`}
      />
      <Handle 
        type="target" 
        position={Position.Left}
        id="target-left"
        className={`!w-3 !h-3 !bg-blue-500 !border-2 !border-white hover:!bg-blue-600 hover:!scale-125 transition-transform ${layoutDirection === 'vertical' ? '!opacity-0' : ''}`}
      />
      
      <div className="flex items-center gap-2 mb-2">
        <div
          className="p-1.5 rounded"
          style={{ backgroundColor: definition.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-600 uppercase">
            {definition.name}
          </div>
          <div className="text-sm font-bold text-gray-900">
            {data.label}
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        {Object.entries(data.attributes).slice(0, 2).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="font-medium">{key}:</span>
            <span className="truncate ml-2 max-w-[100px]">
              {Array.isArray(value) ? value.join(', ') : String(value)}
            </span>
          </div>
        ))}
      </div>

      <Handle 
        type="source" 
        position={Position.Bottom}
        id="source-bottom"
        className={`!w-3 !h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-600 hover:!scale-125 transition-transform ${layoutDirection === 'horizontal' ? '!opacity-0' : ''}`}
      />
      <Handle 
        type="source" 
        position={Position.Right}
        id="source-right"
        className={`!w-3 !h-3 !bg-green-500 !border-2 !border-white hover:!bg-green-600 hover:!scale-125 transition-transform ${layoutDirection === 'vertical' ? '!opacity-0' : ''}`}
      />
    </div>
  );
};

export default CustomNode;
