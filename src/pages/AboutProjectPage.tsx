import React from 'react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';

function AboutProjectPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="p-6 flex justify-between items-center">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-[#9c8b75] transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl mx-auto text-center">
          <Info className="w-16 h-16 mx-auto mb-4 text-gray-700" />
          <h1 className="text-3xl font-semibold text-gray-800 mb-6">About ChoicEdge Estimate Calculator</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-left">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Purpose & Usage</h2>
            <p className="text-gray-700 mb-6">
              The ChoicEdge Estimate Calculator is an exclusive tool designed and developed for ChoicEdge employees. 
              Its primary purpose is to streamline the creation of estimates and initial tentative quotations, 
              enabling our team to generate accurate project estimates efficiently and professionally.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Development & Ownership</h2>
            <p className="text-gray-700 mb-6">
              This web application was meticulously crafted by Manas Khobrekar to revolutionize ChoicEdge's estimation process. 
              The entire source code and intellectual property rights are exclusively owned by Manas Khobrekar, 
              representing a significant investment of expertise and development effort.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Development Investment Breakdown</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>Research & Planning</div>
                <div className="text-right">₹78,450</div>
                <div>UI/UX Design</div>
                <div className="text-right">₹1,24,675</div>
                <div>Frontend Development</div>
                <div className="text-right">₹2,45,890</div>
                <div>Backend Integration</div>
                <div className="text-right">₹1,67,235</div>
                <div>Testing & Optimization</div>
                <div className="text-right">₹93,460</div>
                <div>Documentation</div>
                <div className="text-right">₹45,780</div>
                <div className="font-semibold">Total Development Value</div>
                <div className="text-right font-semibold">₹7,55,490</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 border-t pt-6">
              <p className="mb-2">
                © 2024 ChoicEdge. All rights reserved. Source code and intellectual property rights owned by Manas Khobrekar.
              </p>
              <p>
                This application represents a significant investment in custom software development. 
                The quoted development costs reflect the market value of similar enterprise-grade estimation tools.
              </p>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default AboutProjectPage;