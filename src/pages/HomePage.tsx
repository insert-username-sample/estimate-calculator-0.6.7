import React, { useState, useEffect } from 'react';
import { Building2, Factory, Home, Hotel } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import logo from '../assets/choicedge-logo.png';

function HomePage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const navigate = useNavigate();

  const projectTypes = [{ id: 'residential', label: 'Residential', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Building2 },
    { id: 'hospitality', label: 'Hospitality', icon: Hotel },
    { id: 'industrial', label: 'Industrial', icon: Factory }];

  const handleNext = () => {
    if (selectedType && clientName.trim() !== '') {
      navigate('/category-selection', {
        state: {
          projectType: selectedType,
          clientName: clientName.trim(),
          projectName: projectName.trim(),
        },
      });
    } else if (!clientName.trim()) {
      alert('Client name is required!');
    }
  };

  return (
    <Layout>
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col items-center relative">
        <div className="text-center mb-8">
          <div className="mb-8">
            <div className="mb-8">
              <img
                src={logo}
                alt="Choicedge"
                className="h-24 md:h-28 mx-auto"
              />
            </div>
            <h2 className="text-5xl md:text-7xl text-gray-600 font-light relative mb-8">
              Estimate Calculator
            </h2>
          </div>
        </div>

        <div className="mt-12 w-full">
          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Project Details
          </h2>

          <div className="max-w-lg mx-auto space-y-4 mb-8">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9c8b75]"
              placeholder="Client / Lead Name (Required)"
              required
            />
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#9c8b75]"
              placeholder="Project Name (Optional)"
            />
          </div>

          <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
            Select Project Type
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {projectTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`
                    p-6 rounded-xl transition-all duration-300 flex items-center space-x-4
                    ${selectedType === type.id
                      ? 'bg-[#9c8b75] text-white shadow-lg scale-105'
                      : 'bg-white hover:bg-[#9c8b75]/10 text-gray-700 hover:scale-102 shadow-md'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-lg font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={handleNext}
              disabled={!selectedType || clientName.trim() === ''}
              className={`
                px-8 py-3 rounded-full text-white font-medium transition-all duration-300
                ${selectedType && clientName.trim() !== ''
                  ? 'bg-[#9c8b75] hover:bg-[#8a7b68] shadow-lg hover:scale-105'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              Next
            </button>
          </div>
        </div>
      </main>
      <footer className="mt-auto py-4 text-center text-sm text-gray-500">
      </footer>
    </Layout>
  );
}

export default HomePage;
