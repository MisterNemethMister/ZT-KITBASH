import React, { useState } from 'react';
import * as Icons from 'lucide-react';

const TeamNameModal = ({ currentName, onClose, onSave }) => {
  const [teamName, setTeamName] = useState(currentName);
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    if (teamName.trim()) {
      onSave(teamName.trim());
      onClose();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(teamName);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Edit Team Name</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icons.X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Customize the name for your ZTNA network team
          </p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Team Name
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="Enter team name"
            autoFocus
          />
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Icons.Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Icons.Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamNameModal;
