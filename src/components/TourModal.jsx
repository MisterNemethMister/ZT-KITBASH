import React, { useState } from 'react';
import * as Icons from 'lucide-react';

const tourData = {
  account: [
    {
      title: 'Account Overview',
      description: 'View and manage your Cloudflare ZTNA accounts. Switch between multiple accounts and see real-time network status for each.',
      icon: Icons.Building2,
    },
    {
      title: 'Network Status',
      description: 'Monitor the health of your network at a glance. Status indicators show good, warning, or critical states based on real-time metrics.',
      icon: Icons.Activity,
    },
    {
      title: 'Account Details',
      description: 'Access detailed information about your account including plan type, usage limits, enabled features, and billing information.',
      icon: Icons.FileText,
    },
    {
      title: 'Team Name',
      description: 'Customize your team name for easy identification. Click the edit icon next to any account to update its display name.',
      icon: Icons.Edit2,
    },
  ],
  activity: [
    {
      title: 'Real-time Metrics',
      description: 'Monitor requests per minute, throughput, error rates, and latency metrics with live updating charts.',
      icon: Icons.BarChart3,
    },
    {
      title: 'Traffic Analysis',
      description: 'View top edges by traffic volume, blocked connections, and error rates to identify patterns and issues.',
      icon: Icons.Network,
    },
    {
      title: 'Live vs Playback Mode',
      description: 'Switch between live monitoring and playback mode to review historical data within your selected time range.',
      icon: Icons.Play,
    },
    {
      title: 'Export Reports',
      description: 'Generate and share activity reports via email or download as PDF for compliance and analysis.',
      icon: Icons.FileDown,
    },
  ],
  objects: [
    {
      title: 'Network Topology',
      description: 'Visualize your entire ZTNA network with an interactive graph showing all nodes and their connections.',
      icon: Icons.Share2,
    },
    {
      title: 'Node Types',
      description: 'Different node types are color-coded: Users, Devices, Applications, Tunnels, Gateways, and more.',
      icon: Icons.Box,
    },
    {
      title: 'Search & Filter',
      description: 'Use the search functionality to quickly find specific objects and navigate directly to them on the map.',
      icon: Icons.Search,
    },
    {
      title: 'Node Details',
      description: 'Click any node to view detailed information, edit properties, or see its connections in the sidebar.',
      icon: Icons.Info,
    },
  ],
  settings: [
    {
      title: 'Global Configuration',
      description: 'Configure organization-wide settings that apply to all users and devices in your ZTNA deployment.',
      icon: Icons.Settings,
    },
    {
      title: 'Security Policies',
      description: 'Set up authentication requirements, session timeouts, and TLS settings to secure your network.',
      icon: Icons.Shield,
    },
    {
      title: 'Network Settings',
      description: 'Configure DNS, split tunneling, and traffic routing rules for optimal performance.',
      icon: Icons.Network,
    },
    {
      title: 'Logging & Compliance',
      description: 'Enable detailed logging, set retention periods, and configure compliance features like DLP.',
      icon: Icons.FileText,
    },
  ],
};

const pageTitles = {
  account: 'Account',
  activity: 'Activity',
  objects: 'Objects',
  settings: 'Settings',
};

const TourModal = ({ page = 'account', onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const points = tourData[page] || tourData.account;
  const currentPoint = points[currentStep];
  const IconComponent = currentPoint.icon;
  const pageTitle = pageTitles[page] || 'Account';

  const handleNext = () => {
    if (currentStep < points.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">New in {pageTitle}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Icons.X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="flex gap-1">
            {points.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  idx <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">
                Step {currentStep + 1} of {points.length}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{currentPoint.title}</h3>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {currentPoint.description}
          </p>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Icons.ChevronLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {currentStep < points.length - 1 ? (
                <>
                  Next
                  <Icons.ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Got it!
                  <Icons.Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourModal;
