import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useNetworkStore } from '../store/networkStore';
import { OOUX_DEFINITIONS, NODE_TYPES } from '../data/oouxModel';
import SearchModal from './SearchModal';
import TourModal from './TourModal';

const Toolbar = ({ onFitView, onZoomIn, onZoomOut, onExport, onImport, nodeCount, edgeCount, onSearchNavigate }) => {
  const { appView, setAppView, clearFilter, setShowSummaryNodes, showSummaryNodes, nodes, layoutDirection, setLayoutDirection, toggleLayoutDirection, organizeNodes, accounts, currentAccountId } = useNetworkStore();
  const currentAccount = accounts?.find((a) => a.id === currentAccountId) || accounts?.[0];
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowGroupMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const update = () => {
      const narrow = window.innerWidth < 900;
      setIsNarrow(narrow);

      if (narrow && layoutDirection !== 'vertical') {
        setLayoutDirection('vertical');
        setTimeout(() => {
          organizeNodes();
          onFitView();
        }, 50);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [layoutDirection, setLayoutDirection, organizeNodes, onFitView]);

  // Count nodes by type
  const nodesByType = {};
  nodes.forEach(node => {
    const type = node.data.nodeType;
    if (!nodesByType[type]) {
      nodesByType[type] = 0;
    }
    nodesByType[type]++;
  });

  // Only show types with multiple nodes
  const groupableTypes = Object.entries(nodesByType).filter(([_, count]) => count > 1);
  const tooltips = {
    objectsView: 'Objects View',
    activityView: 'Activity View',
    settingsView: 'Settings View',
    accountView: 'Account View',
    layoutDirection: 'Toggle layout direction',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    fitView: 'Fit View - Center all objects'
  };

  return (
    <div className="relative flex flex-wrap items-stretch gap-2">
      {hoveredButton && (
        <div className="absolute -bottom-12 left-0 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-50">
          {tooltips[hoveredButton]}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center" title="Cloudflare Zero Trust">
        <img src="https://cf-assets.www.cloudflare.com/dzlvafdwdttg/69wNwfiY5mFmgpd9eQFW6j/d5131c08085a977aa70f19e7aada3fa9/1pixel-down__1_.svg" alt="Cloudflare" className="h-8 w-auto px-2" />
      </div>

      <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-1 flex items-center">
        <div className="flex flex-1 rounded-md border border-gray-200 overflow-hidden">
          <button
            onClick={() => {
              if (appView !== 'account') {
                setAppView('account');
              }
            }}
            onMouseEnter={() => setHoveredButton('accountView')}
            onMouseLeave={() => setHoveredButton(null)}
            title={isNarrow ? `Account: ${currentAccount?.name || 'Account'}` : undefined}
            className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
              appView === 'account'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icons.Building2 className="w-4 h-4 flex-shrink-0" />
            {!isNarrow && <span>Account: {currentAccount?.name || 'Account'}</span>}
          </button>

          <button
            onClick={() => {
              if (appView !== 'activity') {
                setAppView('activity');
                clearFilter();
                setShowSummaryNodes(false);
                setTimeout(() => onFitView(), 200);
              }
            }}
            onMouseEnter={() => setHoveredButton('activityView')}
            onMouseLeave={() => setHoveredButton(null)}
            title={isNarrow ? 'Activity' : undefined}
            className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
              appView === 'activity'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icons.Activity className="w-4 h-4" />
            {!isNarrow && 'Activity'}
          </button>

          <button
            onClick={() => {
              if (appView !== 'objects') {
                setAppView('objects');
                setTimeout(() => onFitView(), 200);
              }
            }}
            onMouseEnter={() => setHoveredButton('objectsView')}
            onMouseLeave={() => setHoveredButton(null)}
            title={isNarrow ? 'Objects' : undefined}
            className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
              appView === 'objects'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icons.Box className="w-4 h-4" />
            {!isNarrow && 'Objects'}
          </button>

          <button
            onClick={() => {
              if (appView !== 'settings') {
                setAppView('settings');
              }
            }}
            onMouseEnter={() => setHoveredButton('settingsView')}
            onMouseLeave={() => setHoveredButton(null)}
            title={isNarrow ? 'Settings' : undefined}
            className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors flex items-center justify-center gap-1 border-l border-gray-200 ${
              appView === 'settings'
                ? 'bg-blue-50 text-blue-700'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icons.Settings className="w-4 h-4" />
            {!isNarrow && 'Settings'}
          </button>
        </div>
      </div>

      <button
        onClick={() => setShowTour(true)}
        title="See what's new in this view"
        className="bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg px-3"
      >
        <Icons.Map className="w-4 h-4" />
        {!isNarrow && <span className="text-sm font-bold">New!</span>}
      </button>

      <div className="bg-indigo-100 rounded-lg shadow-lg border-2 border-indigo-200 p-1 flex items-center">
        <button
          onClick={() => setShowSearchModal(true)}
          title="Search for objects, settings, and more"
          className="px-3 py-2 flex items-center gap-2 hover:bg-indigo-200 rounded-md transition-colors"
        >
          <Icons.Search className="w-4 h-4 text-indigo-600" />
          {!isNarrow && <span className="text-sm font-semibold text-indigo-700">Search...</span>}
        </button>
      </div>

      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onNavigate={(view, params) => {
            if (onSearchNavigate) {
              onSearchNavigate(view, params);
            }
            setShowSearchModal(false);
          }}
        />
      )}

      {showTour && (
        <TourModal page="objects" onClose={() => setShowTour(false)} />
      )}
    </div>
  );
};

export default Toolbar;
