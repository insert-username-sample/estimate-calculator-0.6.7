import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Edit, Trash, Check, X, ArrowLeft, Plus } from 'lucide-react';
import Layout from '../components/Layout';

interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

function EstimateReviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clientName, projectName } = location.state || {};
  const [foyerItems, setFoyerItems] = useState<EstimateItem[]>([
    { 
      id: 'foyer-1', 
      description: 'VENEER & DUCO ENTRANCE DOOR WITH FRAMING\nMaking of Entrance Door with a flush door base of 32mm, finished with veneer and duco, with a decorative handle.', 
      quantity: 25, 
      unit: 'Sq.ft',
      rate: 1500,
      amount: 37500
    },
    { 
      id: 'foyer-2', 
      description: 'VIDEO DOOR PHONE FOR ENTRANCE\nInstallation of Video Door Phone from brands like CP PLUS, PANASONIC, GODREJ, or equivalent.', 
      quantity: 1, 
      unit: 'Nos',
      rate: 15000,
      amount: 15000
    },
    { 
      id: 'foyer-3', 
      description: 'SHOE RACK\nProviding and applying ply of 18mm, 12mm, 8mm & 6mm as per requirement, with 1mm thick front designing laminates (Marino lam, Greenlam, or equivalent) & 0.92mm mica inside, with shutters and handles as per design.', 
      quantity: 15, 
      unit: 'Nos',
      rate: 1200,
      amount: 18000
    },
    { 
      id: 'foyer-4', 
      description: 'CONSOLE WITH PANELLING\nProviding and applying ply of 18mm, 12mm, 8mm & 6mm as per requirement, with 1mm thick front designing laminates (Marino lam, Greenlam, or equivalent), Jouvres, Glass, and inner 0.92mm Laminate, to make a console with paneling.', 
      quantity: 81, 
      unit: 'Sq.ft',
      rate: 1300,
      amount: 105300
    }
  ]);

  const getAdjustedRate = (baseRate: number) => {
    const category = location.state?.category || 'standard';
    const multiplier = category === 'premium' ? 1.3 : category === 'luxury' ? 1.6 : 1;
    return Math.round(baseRate * multiplier);
  };

  const [items, setItems] = useState<EstimateItem[]>(() => {
    const baseItems = [
      { 
        id: '1', 
        description: 'Sofa Set (3+2 Seater)', 
        quantity: 1, 
        unit: 'Set',
        baseRate: 85000
      },
      { 
        id: '2', 
        description: 'Center Table', 
        quantity: 1, 
        unit: 'Piece',
        baseRate: 25000
      },
      { 
        id: '3', 
        description: 'TV Unit', 
        quantity: 1, 
        unit: 'R.ft',
        baseRate: 2500
      },
      { 
        id: '4', 
        description: 'False Ceiling', 
        quantity: 120, 
        unit: 'Sq.ft',
        baseRate: 250
      }
    ];

    return baseItems.map(item => ({
      ...item,
      rate: getAdjustedRate(item.baseRate),
      amount: item.quantity * getAdjustedRate(item.baseRate)
    }));
  });

  const [editingItem, setEditingItem] = useState<{ id: string; field: 'description' | 'quantity' | 'rate' | 'total' | 'unit'; value: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationDots, setCalculationDots] = useState('.');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [showTotalAdjustModal, setShowTotalAdjustModal] = useState(false);
  // Remove unused adjustmentType state

  // Template selection modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: '',
    unit: '',
    rate: ''
  });

  // Predefined item templates
  const itemTemplates = [
    {
      id: 'template-1',
      name: 'VENEER & DUCO ENTRANCE DOOR WITH FRAMING',
      description: 'VENEER & DUCO ENTRANCE DOOR WITH FRAMING\nMaking of Entrance Door with a flush door base of 32mm, finished with veneer and duco, with a decorative handle.',
      baseRate: 1500,
      premiumRate: 1800,
      luxuryRate: 2200,
      unit: 'Sq.ft',
      defaultQuantity: 25
    },
    {
      id: 'template-2',
      name: 'VIDEO DOOR PHONE FOR ENTRANCE',
      description: 'VIDEO DOOR PHONE FOR ENTRANCE\nInstallation of Video Door Phone from brands like CP PLUS, PANASONIC, GODREJ, or equivalent.',
      baseRate: 15000,
      premiumRate: 17000,
      luxuryRate: 20000,
      unit: 'Nos.',
      defaultQuantity: 1
    },
    {
      id: 'template-3',
      name: 'SHOE RACK',
      description: 'SHOE RACK\nProviding and applying ply of 18mm, 12mm, 8mm & 6mm as per requirement, with 1mm thick front designing laminates (Marino lam, Greenlam, or equivalent) & 0.92mm mica inside, with shutters and handles as per design.',
      baseRate: 1200,
      premiumRate: 1400,
      luxuryRate: 1700,
      unit: 'Nos',
      defaultQuantity: 15
    },
    {
      id: 'template-4',
      name: 'CONSOLE WITH PANELLING',
      description: 'CONSOLE WITH PANELLING\nProviding and applying ply of 18mm, 12mm, 8mm & 6mm as per requirement, with 1mm thick front designing laminates (Marino lam, Greenlam, or equivalent), Jouvres, Glass, and inner 0.92mm Laminate, to make a console with paneling.',
      baseRate: 1300,
      premiumRate: 1500,
      luxuryRate: 1800,
      unit: 'Sq.ft',
      defaultQuantity: 81
    }
  ];

  // Handle template selection
  const handleTemplateSelect = (template: typeof itemTemplates[0]) => {
    const rate = location.state?.category === 'premium' 
      ? template.premiumRate 
      : location.state?.category === 'luxury' 
        ? template.luxuryRate 
        : template.baseRate;
  
    setNewItem({
      description: template.description,
      quantity: template.defaultQuantity.toString(),
      unit: template.unit,
      rate: rate.toString()
    });
    setShowTemplateModal(false);
    setShowAddModal(true);
  };

  // Handle custom item selection
  const handleCustomItemSelect = () => {
    setNewItem({
      description: '',
      quantity: '',
      unit: '',
      rate: ''
    });
    setShowTemplateModal(false);
    setShowAddModal(true);
  };
  const [formErrors, setFormErrors] = useState({
    description: '',
    quantity: '',
    unit: '',
    rate: ''
  });

  // Validate form fields
  const validateForm = () => {
    const errors = {
      description: '',
      quantity: '',
      unit: '',
      rate: ''
    };
    let isValid = true;

    if (!newItem.description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }

    const quantity = parseFloat(newItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Quantity must be a positive number';
      isValid = false;
    }

    if (!newItem.unit.trim()) {
      errors.unit = 'Unit is required';
      isValid = false;
    }

    const rate = parseFloat(newItem.rate);
    if (isNaN(rate) || rate < 0) {
      errors.rate = 'Rate must be a non-negative number';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle adding new item
  const handleAddItem = () => {
    if (!validateForm()) return;

    setIsCalculating(true);
    const quantity = parseFloat(newItem.quantity);
    const rate = parseFloat(newItem.rate);

    const newItemData: EstimateItem = {
      id: Date.now().toString(),
      description: newItem.description.trim(),
      quantity,
      unit: newItem.unit.trim(),
      rate,
      amount: quantity * rate
    };

    setFoyerItems(prevItems => [...prevItems, newItemData]);
    setShowAddModal(false);
    setNewItem({
      description: '',
      quantity: '',
      unit: '',
      rate: ''
    });

    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1000);
  };

  const handleEditItem = (id: string, field: 'description' | 'quantity' | 'rate' | 'total' | 'unit') => {
    const item = foyerItems.find(item => item.id === id) || items.find(item => item.id === id);
    if (item) {
      setEditingItem({ 
        id, 
        field, 
        value: field === 'total' ? (item.quantity * item.rate).toString() : 
              field === 'rate' ? item.rate.toString() : 
              field === 'quantity' ? item.quantity.toString() : 
              field === 'unit' ? item.unit : 
              item.description
      });
    }
  };

  const handleConfirmEdit = (id: string) => {
    if (!editingItem) return;
  
    if (editingItem.field === 'description' || editingItem.field === 'unit') {
      if (!editingItem.value.trim()) return;
      
      setIsCalculating(true);
      const updateItems = (items: EstimateItem[]) =>
        items.map(item =>
          item.id === id
            ? {
                ...item,
                [editingItem.field]: editingItem.value.trim()
              }
            : item
        );

      setItems(updateItems);
      setFoyerItems(updateItems);
      setEditingItem(null);
  
      setTimeout(() => {
        setIsCalculating(false);
        setCalculationDots('.');
      }, 1000);
      return;
    }
  
    let newValue = parseFloat(editingItem.value);
    if (isNaN(newValue) || newValue <= 0) {
      newValue = 1; // Set to 1 instead of 0 to prevent division by zero
    }
  
    if (editingItem.field === 'total') {
      setShowTotalAdjustModal(true);
      return;
    }

    setIsCalculating(true);
    const updateItems = (items: EstimateItem[]) =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              ...(() => {
                const roundedValue = Math.round(newValue);
                if (editingItem.field === 'quantity') {
                  return {
                    quantity: roundedValue,
                    amount: Math.round(roundedValue * item.rate)
                  };
                } else if (editingItem.field === 'rate') {
                  return {
                    rate: roundedValue,
                    amount: Math.round(item.quantity * roundedValue)
                  };
                }
                return {};
              })()
            }
          : item
      );

    setItems(updateItems);
    setFoyerItems(updateItems);
    setEditingItem(null);
  
    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1000);
  };

  const handleTotalAdjustment = (id: string, adjustType: 'quantity' | 'rate') => {
    if (!editingItem) return;

    const newTotal = parseFloat(editingItem.value);
    if (isNaN(newTotal) || newTotal <= 0) return;

    setIsCalculating(true);
    const updateItems = (items: EstimateItem[]) =>
      items.map(item => {
        if (item.id === id) {
          if (adjustType === 'quantity') {
            const newQuantity = Math.round(newTotal / item.rate);
            return {
              ...item,
              quantity: newQuantity,
              amount: Math.round(newTotal)
            };
          } else {
            const newRate = Math.round(newTotal / item.quantity);
            return {
              ...item,
              rate: newRate,
              amount: Math.round(newTotal)
            };
          }
        }
        return item;
      });

    setItems(updateItems);
    setFoyerItems(updateItems);
    setEditingItem(null);
    setShowTotalAdjustModal(false);
// Remove line since adjustmentType state was removed

    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1000);
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    setIsCalculating(true);
    setShowDeleteConfirm(false);

    // Add a small delay before removing the item
    setTimeout(() => {
      // Check and update both foyerItems and items arrays
      setFoyerItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);

      setTimeout(() => {
        setIsCalculating(false);
        setCalculationDots('.');
      }, 700);
    }, 300);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  const handleBack = () => {
    if (location.state?.layoutType) {
      navigate('/residential-layout', { state: location.state });
    } else if (location.state) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Layout>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </header>


      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Foyer Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Foyer Area</h1>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>

            {/* Template Selection Modal */}
            {showTemplateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Choose an item to add</h2>
                    <div className="space-y-4">
                      {itemTemplates.map((template) => (
                        <div key={template.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-grow">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{template.name}</h3>
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">Default Template</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{template.description}</p>
                              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span>Rate: ₹{location.state?.category === 'premium' ? template.premiumRate : location.state?.category === 'luxury' ? template.luxuryRate : template.baseRate} per {template.unit}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${location.state?.category === 'premium' ? 'bg-purple-100 text-purple-800' : location.state?.category === 'luxury' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{location.state?.category === 'premium' ? 'Premium Rate' : location.state?.category === 'luxury' ? 'Luxury Rate' : 'Standard Rate'}</span>
                                </div>
                                <span className="text-gray-400">•</span>
                                <div className="flex items-center gap-2">
                                  <span>Default Quantity: {template.defaultQuantity}</span>
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Default Quantity</span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleTemplateSelect(template)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium text-gray-900">Custom Item</h3>
                            <p className="text-sm text-gray-600">Create a custom item with your own specifications</p>
                          </div>
                          <button
                            onClick={handleCustomItemSelect}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            Create Custom
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end items-center">
                    <button
                      onClick={() => setShowTemplateModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#f5f5dc] p-4 grid grid-cols-6 gap-8 font-semibold text-gray-700">
            <div className="col-span-2">Item Description</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Rate (₹)</div>
            <div>Total (₹)</div>
          </div>

          <div className="divide-y divide-gray-200">
            {foyerItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No items in foyer area. Add new items to continue.
              </div>
            ) : (
              <>
                {foyerItems.map(item => (
                  <div key={item.id} className="group relative p-4 grid grid-cols-6 gap-8 items-center hover:bg-gray-50">
                    <div className="col-span-2 font-medium text-gray-900">
                      {editingItem?.id === item.id && editingItem.field === 'description' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onBlur={() => handleConfirmEdit(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmEdit(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="block py-2">{item.description.split('\n').map((line, index) => (
                            <p key={index} className={`${index === 0 ? 'font-semibold' : 'text-sm mt-1 text-gray-600'}`}>
                              {line}
                            </p>
                          ))}</span>
                          <button
                            onClick={() => handleEditItem(item.id, 'description')}
                            className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit Description"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-900">
                      {editingItem?.id === item.id && editingItem.field === 'quantity' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onBlur={() => handleConfirmEdit(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmEdit(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="block py-2">{item.quantity}</span>
                          <button
                            onClick={() => handleEditItem(item.id, 'quantity')}
                            className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit Quantity"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-600">
                      {editingItem?.id === item.id && editingItem.field === 'unit' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onBlur={() => handleConfirmEdit(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmEdit(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="block py-2">{item.unit}</span>
                          <button
                            onClick={() => handleEditItem(item.id, 'unit')}
                            className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit Unit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-900">
                      {editingItem?.id === item.id && editingItem.field === 'rate' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onBlur={() => handleConfirmEdit(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmEdit(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="block py-2">₹{item.rate.toLocaleString()}</span>
                          <button
                            onClick={() => handleEditItem(item.id, 'rate')}
                            className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit Rate"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-gray-900 flex items-center justify-between">
                      {editingItem?.id === item.id && editingItem.field === 'total' ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={editingItem.value}
                            onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                            onBlur={() => handleConfirmEdit(item.id)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                            min="0"
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmEdit(item.id)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="block py-2">₹{item.amount.toLocaleString()}</span>
                          <button
                            onClick={() => handleEditItem(item.id, 'total')}
                            className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                            title="Edit Total"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="absolute right-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110"
                            title="Delete Item"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="p-4 grid grid-cols-6 gap-8 items-center bg-[#d2b48c]/10 font-medium">
                  <div className="col-span-2">Total</div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="text-right text-gray-900">
                    ₹ {foyerItems.reduce((sum: number, item: EstimateItem) => sum + item.amount, 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Living Room Section */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Title and Add Item Button */}
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Living Room</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>

            {/* Add Item Modal */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add New Item</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter item description"
                        />
                        {formErrors.description && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                          <input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter quantity"
                          />
                          {formErrors.quantity && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                          <input
                            type="text"
                            value={newItem.unit}
                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter unit"
                          />
                          {formErrors.unit && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.unit}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                        <input
                          type="number"
                          value={newItem.rate}
                          onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter rate"
                        />
                        {formErrors.rate && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.rate}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Table Header */}
          <div className="bg-[#f5f5dc] p-4 grid grid-cols-6 gap-8 font-semibold text-gray-700">
            <div className="col-span-2">Item Description</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Rate (₹)</div>
            <div>Total (₹)</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No items left. Add new items to continue.
              </div>
            ) : items.map(item => (
              <div key={item.id} className="group relative p-4 grid grid-cols-6 gap-8 items-center hover:bg-gray-50">
                <div className="col-span-2 font-medium text-gray-900">
                  {editingItem?.id === item.id && editingItem.field === 'description' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        onBlur={() => handleConfirmEdit(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmEdit(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="block py-2">{item.description.split('\n').map((line, index) => (
                        <p key={index} className={`${index === 0 ? 'font-semibold' : 'text-sm mt-1 text-gray-600'}`}>
                          {line}
                        </p>
                      ))}</span>
                      <button
                        onClick={() => handleEditItem(item.id, 'description')}
                        className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Description"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative text-gray-900">
                  {editingItem?.id === item.id && editingItem.field === 'quantity' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        onBlur={() => handleConfirmEdit(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmEdit(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="block py-2">{item.quantity}</span>
                      <button
                        onClick={() => handleEditItem(item.id, 'quantity')}
                        className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Quantity"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-gray-600">
                  {editingItem?.id === item.id && editingItem.field === 'unit' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        className="w-20 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        onBlur={() => handleConfirmEdit(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmEdit(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="block py-2">{item.unit}</span>
                      <button
                        onClick={() => handleEditItem(item.id, 'unit')}
                        className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Unit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative text-gray-900">
                  {editingItem?.id === item.id && editingItem.field === 'rate' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        onBlur={() => handleConfirmEdit(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmEdit(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="block py-2">₹ {item.rate.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleEditItem(item.id, 'rate')}
                        className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Rate"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative text-gray-900">
                  {editingItem?.id === item.id && editingItem.field === 'total' ? (
                    <div className="flex items-center justify-end space-x-2">
                      <input
                        type="number"
                        className="w-24 px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editingItem.value}
                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                        onBlur={() => handleConfirmEdit(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirmEdit(item.id)}
                        min="0"
                        autoFocus
                      />
                      <button
                        onClick={() => handleConfirmEdit(item.id)}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingItem(null)}
                        className="p-1 text-red-600 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="block py-2">₹ {item.amount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => handleEditItem(item.id, 'total')}
                        className="invisible group-hover:visible ml-2 p-1 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit Total"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="absolute right-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110"
                  title="Delete Item"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Total Section */}
          <div className="mt-6 p-4 bg-[#d2b48c]/10 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <div className="flex items-center">
                {isCalculating ? (
                  <span className="text-lg font-medium text-gray-600 animate-pulse">
                    Calculating{calculationDots}
                  </span>
                ) : (
                  <span className="text-lg font-medium text-gray-900">
                    ₹ {items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Add Item Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter item description"
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter quantity"
                      min="0"
                    />
                    {formErrors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter unit (e.g., Piece, Set, Sq.ft)"
                    />
                    {formErrors.unit && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.unit}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rate (₹)</label>
                    <input
                      type="number"
                      value={newItem.rate}
                      onChange={(e) => setNewItem({ ...newItem, rate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter rate"
                      min="0"
                    />
                    {formErrors.rate && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.rate}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setNewItem({
                        description: '',
                        quantity: '',
                        unit: '',
                        rate: ''
                      });
                      setFormErrors({
                        description: '',
                        quantity: '',
                        unit: '',
                        rate: ''
                      });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl transform transition-all">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Confirmation</h3>
                <p className="text-gray-500 mb-6">Are you sure you want to remove this item?</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Total Adjustment Modal */}
      {showTotalAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adjust Total Amount</h3>
            <p className="text-gray-600 mb-6">How would you like to adjust the total amount?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  const id = editingItem?.id;
                  if (id) handleTotalAdjustment(id, 'quantity');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adjust Quantity
              </button>
              <button
                onClick={() => {
                  const id = editingItem?.id;
                  if (id) handleTotalAdjustment(id, 'rate');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Adjust Rate
              </button>
              <button
                onClick={() => {
                  setShowTotalAdjustModal(false);
                  setEditingItem(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default EstimateReviewPage;

{/* Add this before the closing tbody tag in the table */}
<tr className="bg-[#d2b48c]/5">
  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">Total Amount</td>
  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500"></td>
  <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500"></td>
  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
   
  </td>
</tr>