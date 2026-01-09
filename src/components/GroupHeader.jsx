import React from 'react';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS } from '../data/oouxModel';
import { useNetworkStore } from '../store/networkStore';

const GroupHeader = ({ nodeType, count }) => {
  const toggleGroupCollapse = useNetworkStore((state) => state.toggleGroupCollapse);
  const definition = OOUX_DEFINITIONS[nodeType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;

  return (
    <div 
      className="absolute top-4 right-4 z-20 bg-white rounded-lg shadow-lg border-2 border-blue-500 p-3 cursor-pointer hover:shadow-xl transition-all"
      onClick={() => toggleGroupCollapse(nodeType)}
      style={{ borderColor: definition.color }}
    >
      <div className="flex items-center gap-2">
        <div
          className="p-1.5 rounded"
          style={{ backgroundColor: definition.color }}
        >
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="text-sm">
          <div className="font-bold text-gray-900">{count} {definition.name}s</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Icons.Minimize2 className="w-3 h-3" />
            Click to collapse
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;
