import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { OOUX_DEFINITIONS, NODE_TYPES } from '../data/oouxModel';
import { useNetworkStore } from '../store/networkStore';

const NodeForm = ({ mode = 'create', existingNode = null, onClose }) => {
  const { addNode, updateNode } = useNetworkStore();
  const [selectedType, setSelectedType] = useState(existingNode?.data.nodeType || NODE_TYPES.USER);
  const [label, setLabel] = useState(existingNode?.data.label || '');
  const [attributes, setAttributes] = useState(existingNode?.data.attributes || {});

  const definition = OOUX_DEFINITIONS[selectedType];
  const IconComponent = Icons[definition.icon] || Icons.Circle;

  useEffect(() => {
    if (mode === 'create') {
      const defaultAttrs = {};
      definition.attributes.forEach(attr => {
        if (attr.type === 'boolean') {
          defaultAttrs[attr.key] = false;
        } else if (attr.type === 'array') {
          defaultAttrs[attr.key] = [];
        } else if (attr.type === 'number') {
          defaultAttrs[attr.key] = 0;
        } else {
          defaultAttrs[attr.key] = '';
        }
      });
      setAttributes(defaultAttrs);
    }
  }, [selectedType, mode]);

  const handleAttributeChange = (key, value, type) => {
    if (type === 'boolean') {
      setAttributes({ ...attributes, [key]: value === 'true' });
    } else if (type === 'array') {
      setAttributes({ ...attributes, [key]: value.split(',').map(v => v.trim()).filter(Boolean) });
    } else if (type === 'number') {
      setAttributes({ ...attributes, [key]: parseInt(value) || 0 });
    } else {
      setAttributes({ ...attributes, [key]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!label.trim()) {
      alert('Please provide a label for the node');
      return;
    }

    const requiredAttrs = definition.attributes.filter(attr => attr.required);
    const missingAttrs = requiredAttrs.filter(attr => {
      const value = attributes[attr.key];
      return !value || (Array.isArray(value) && value.length === 0) || value === '';
    });

    if (missingAttrs.length > 0) {
      alert(`Please fill in required fields: ${missingAttrs.map(a => a.label).join(', ')}`);
      return;
    }

    if (mode === 'create') {
      addNode({
        nodeType: selectedType,
        label,
        attributes,
        position: { x: 400, y: 300 }
      });
    } else if (existingNode) {
      updateNode(existingNode.id, { label, attributes });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: definition.color }}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Create New Object' : 'Edit Object'}
                </h2>
                <p className="text-sm text-gray-600">{definition.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Object Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(OOUX_DEFINITIONS).map(([type, def]) => (
                  <option key={type} value={type}>
                    {def.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-sm text-gray-600">{definition.description}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Object Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Enter a descriptive label"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Attributes</h3>
            <div className="space-y-4">
              {definition.attributes.map((attr) => (
                <div key={attr.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {attr.label}
                    {attr.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {attr.type === 'select' ? (
                    <select
                      value={attributes[attr.key] || ''}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value, attr.type)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={attr.required}
                    >
                      <option value="">Select Object Type</option>
                      {attr.options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : attr.type === 'boolean' ? (
                    <select
                      value={String(attributes[attr.key])}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value, attr.type)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  ) : attr.type === 'array' ? (
                    <input
                      type="text"
                      value={Array.isArray(attributes[attr.key]) ? attributes[attr.key].join(', ') : ''}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value, attr.type)}
                      placeholder="Enter comma-separated values"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : attr.type === 'number' ? (
                    <input
                      type="number"
                      value={attributes[attr.key] || 0}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value, attr.type)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <input
                      type="text"
                      value={attributes[attr.key] || ''}
                      onChange={(e) => handleAttributeChange(attr.key, e.target.value, attr.type)}
                      placeholder={`Enter ${attr.label.toLowerCase()}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={attr.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Relations</h3>
            <p className="text-sm text-gray-600 mb-3">
              This node can relate to: {definition.relations.map(r => OOUX_DEFINITIONS[r]?.name).join(', ')}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Actions</h3>
            <div className="flex flex-wrap gap-2">
              {definition.callsToAction.map((cta) => (
                <span
                  key={cta}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {cta.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            {mode === 'create' ? 'Create Node' : 'Update Node'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeForm;
