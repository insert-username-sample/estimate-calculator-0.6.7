import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash, Check, X, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

interface TestItem {
  id: string;
  value: number;
}

function TestEditPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TestItem[]>([
    { id: '1', value: 1000 },
    { id: '2', value: 2000 },
    { id: '3', value: 3000 }
  ]);
  const [editingItem, setEditingItem] = useState<{ id: string; value: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationDots, setCalculationDots] = useState('.');

  const handleEditItem = (id: string) => {
    const item = items.find(item => item.id === id);
    if (item) {
      setEditingItem({ id, value: item.value.toString() });
    }
  };

  const handleConfirmEdit = (id: string) => {
    if (!editingItem) return;

    const newValue = parseFloat(editingItem.value);
    if (isNaN(newValue)) return;

    setIsCalculating(true);
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, value: newValue } : item
      )
    );
    setEditingItem(null);

    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1000);
  };

  const handleDeleteItem = (id: string) => {
    setIsCalculating(true);
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1000);
  };

  return (
    <Layout>
      <header className="p-6 flex justify-between items-center border-b border-gray-200">
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-[#9c8b75] transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900">Test Edit Page</h1>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                {editingItem?.id === item.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                      autoFocus
                    />
                    <button
                      onClick={() => handleConfirmEdit(item.id)}
                      className="p-2 text-green-600 hover:text-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingItem(null)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-lg font-medium text-gray-900">₹ {item.value.toLocaleString('en-IN')}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Total Section */}
          <div className="mt-6 p-4 bg-[#d2b48c]/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <div className="flex items-center">
                {isCalculating ? (
                  <span className="text-lg font-medium text-gray-600 animate-pulse">
                    Calculating{calculationDots}
                  </span>
                ) : (
                  <span className="text-lg font-medium text-gray-900">
                    ₹ {items.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

export default TestEditPage;