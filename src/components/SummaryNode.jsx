import React from 'react';
import { Handle, Position } from 'reactflow';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS } from '../data/oouxModel';
import { useNetworkStore } from '../store/networkStore';

const SummaryNode = ({ data, selected }) => {
  const toggleSummaryNodes = useNetworkStore((state) => state.toggleSummaryNodes);
  const setFilterNodeType = useNetworkStore((state) => state.setFilterNodeType);
  const definition = OOUX_DEFINITIONS[data.nodeType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;

  const handleClick = (e) => {
    e.stopPropagation();
    // Switch to expanded view and focus on this object type
    toggleSummaryNodes();
    setFilterNodeType(data.nodeType);
  };

  return (
    <div
      onClick={handleClick}
      className={`px-5 py-4 rounded-xl border-2 shadow-xl w-[300px] h-[140px] transition-all flex flex-col justify-between ${
        selected
          ? 'border-blue-500 shadow-2xl scale-105'
          : 'border-gray-400 hover:border-blue-400 hover:shadow-2xl'
      }`}
      style={{ 
        backgroundColor: definition.color + '25',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="p-2 rounded-lg relative"
          style={{ backgroundColor: definition.color }}
        >
          <IconComponent className="w-6 h-6 text-white" />
          <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-current text-xs font-bold"
               style={{ color: definition.color }}>
            {data.count}
          </div>
        </div>
        <div className="text-lg font-bold text-gray-900 whitespace-nowrap">
          {definition.name}{data.count !== 1 ? 's' : ''} : {data.count}
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2 overflow-hidden">
        <div className="truncate">
          {data.nodes.map(n => n.data.label).slice(0, 3).join(', ')}
          {data.count > 3 && ` +${data.count - 3} more`}
        </div>
      </div>
    </div>
  );
};

export default SummaryNode;
