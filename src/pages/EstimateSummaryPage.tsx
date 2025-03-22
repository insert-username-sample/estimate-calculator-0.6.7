import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Phone, Edit, Trash, Check, X } from 'lucide-react';
import logo from '../assets/choicedge-logo.png';
import Layout from '../components/Layout';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface RoomItem {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  amount: number;
  isEditing?: boolean;
}

interface Room {
  id?: string;
  name: string;
  carpetArea: string;
  rate: number;
  amount: number;
  items: RoomItem[];
}

interface Floor {
  id: string;
  name: string;
  carpetArea: string;
  rooms: Room[];
}

const ROOM_ITEMS: { [key: string]: { description: string; ratio: number; unit: string; getQuantity?: (area: number) => number }[] } = {
  default: [
    { description: 'Civil Work', ratio: 0.09, unit: 'sq.ft', getQuantity: (area) => Math.round(area * 0.5) },
    { description: 'Flooring', ratio: 0.045, unit: 'sq.ft', getQuantity: (area) => Math.round(area) },
    { description: 'Electrical', ratio: 0.08, unit: 'm.', getQuantity: (area) => Math.round(area * 0.5) },
    { description: 'Plumbing', ratio: 0.08, unit: 'm.', getQuantity: (area) => Math.round(area * 0.3) },
    { description: 'False Ceiling', ratio: 0.24, unit: 'sq.ft', getQuantity: (area) => Math.round(area) },
    { description: 'Painting', ratio: 0.064, unit: 'litres', getQuantity: (area) => Math.round(area / 100 * 3.5) },
    { description: 'Furniture', ratio: 0.381, unit: 'As per design', getQuantity: () => 0 }
  ],
  'Bathroom': [
    { description: 'Civil Work', ratio: 0.066, unit: 'sq.ft', getQuantity: (area) => Math.round(area * 0.5) },
    { description: 'Flooring & Wall Tiles', ratio: 0.054, unit: 'sq.ft', getQuantity: (area) => Math.round(area * 3) },
    { description: 'Plumbing', ratio: 0.16, unit: 'm.', getQuantity: (area) => Math.round(area * 0.8) },
    { description: 'Electrical', ratio: 0.08, unit: 'm.', getQuantity: (area) => Math.round(area * 0.6) },
    { description: 'Sanitary Ware', ratio: 0.18, unit: 'sets', getQuantity: () => 1 },
    { description: 'False Ceiling', ratio: 0.24, unit: 'sq.ft', getQuantity: (area) => Math.round(area) },
    { description: 'Accessories', ratio: 0.06, unit: 'sets', getQuantity: () => 1 }
  ],
  'Kitchen': [
    { description: 'Civil Work', ratio: 0.065, unit: 'sq.ft', getQuantity: (area) => Math.round(area * 0.5) },
    { description: 'Flooring & Wall Tiles', ratio: 0.047, unit: 'sq.ft', getQuantity: (area) => Math.round(area * 2) },
    { description: 'Plumbing', ratio: 0.13, unit: 'm.', getQuantity: (area) => Math.round(area * 0.6) },
    { description: 'Electrical', ratio: 0.082, unit: 'm.', getQuantity: (area) => Math.round(area * 0.5) },
    { description: 'Modular Kitchen', ratio: 0.383, unit: 'As per design', getQuantity: () => 0 },
    { description: 'Appliances', ratio: 0, unit: 'As per selection', getQuantity: () => 0 },
    { description: 'False Ceiling', ratio: 0.283, unit: 'sq.ft', getQuantity: (area) => Math.round(area) }
  ]
};

function EstimateSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = React.useState(location.state);
  const [editingItem, setEditingItem] = React.useState<{roomId?: string; itemId?: string; value: string} | null>(null);

  if (!state) {
    React.useEffect(() => {
      navigate('/');
    }, [navigate]);
    return null;
  }

  const addRandomVariation = (value: number, range: number = 0.02): number => {
    const variation = (Math.random() * 2 - 1) * range; // Random between -range and +range
    const variedValue = value * (1 + variation);
    // Round to nearest 10 to avoid too precise numbers
    return Math.round(variedValue / 10) * 10;
  };

  const distributeAreaToRooms = (totalArea: number, layoutType: string): Room[] => {
    let rooms: Room[] = [];
    const baseRate = state.category === 'standard' ? 1550 : state.category === 'premium' ? 2430 : 3560;
    const rate = Math.round(addRandomVariation(baseRate, 0.01)); // Slight variation in rate

    // For custom layouts, use the rooms from state directly
    if (state.isCustom && state.rooms) {
      return state.rooms.map((room: Room) => ({
        ...room,
        rate,
        amount: parseFloat(room.carpetArea) * rate,
        items: generateRoomItems(parseFloat(room.carpetArea) * rate, room.name)
      }));
    }

    if (layoutType === '1rk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.68).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.26).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.06).toFixed(2), rate, amount: 0, items: [] }
      ];
    } else if (layoutType === '1bhk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.38).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.32).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.24).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.06).toFixed(2), rate, amount: 0, items: [] }
      ];
    } else if (layoutType === '2bhk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.32).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Master Bedroom', carpetArea: (totalArea * 0.24).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.20).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.18).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.035).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.025).toFixed(2), rate, amount: 0, items: [] }
      ];
    } else if (layoutType === '3bhk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.28).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Master Bedroom', carpetArea: (totalArea * 0.22).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.18).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.16).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.12).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.02).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.015).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.015).toFixed(2), rate, amount: 0, items: [] }
      ];
    } else if (layoutType === '4bhk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.25).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Master Bedroom', carpetArea: (totalArea * 0.20).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.15).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.15).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.12).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.09).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.015).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.015).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.01).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.01).toFixed(2), rate, amount: 0, items: [] }
      ];
    } else if (layoutType === '5bhk') {
      rooms = [
        { name: 'Living Room', carpetArea: (totalArea * 0.22).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Master Bedroom', carpetArea: (totalArea * 0.18).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.15).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.14).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.12).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bedroom', carpetArea: (totalArea * 0.10).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Kitchen', carpetArea: (totalArea * 0.06).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.01).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.01).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.005).toFixed(2), rate, amount: 0, items: [] },
        { name: 'Bathroom', carpetArea: (totalArea * 0.005).toFixed(2), rate, amount: 0, items: [] }
      ];
    }

    return rooms.map(room => ({
      ...room,
      amount: parseFloat(room.carpetArea) * rate,
      items: generateRoomItems(parseFloat(room.carpetArea) * rate, room.name)
    }));
  };

  const generateRoomItems = (roomAmount: number, roomType: string): RoomItem[] => {
    const itemsList = ROOM_ITEMS[roomType] || ROOM_ITEMS.default;
    const carpetArea = roomAmount / (state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500);
    return itemsList.map((item, index) => ({
      id: `${roomType}-${index}`,
      description: item.description,
      quantity: item.getQuantity ? item.getQuantity(carpetArea) : 0,
      unit: item.unit,
      amount: Math.round(roomAmount * item.ratio)
    }));
  };

  const calculateSubtotal = () => {
    let constructionCost = 0;
    
    if (state.isVilla) {
      state.floors.forEach((floor: Floor) => {
        floor.rooms.forEach((room: Room) => {
          const rate = state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500;
          constructionCost += parseFloat(room.carpetArea) * rate;
        });
      });
    } else if (state.areaOption === 'total' && state.totalCarpetArea) {
      constructionCost = parseFloat(state.totalCarpetArea) * 
        (state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500);
    } else if (state.rooms) {
      state.rooms.forEach((room: Room) => {
        const rate = state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500;
        constructionCost += parseFloat(room.carpetArea) * rate;
      });
    }
    
    // Calculate design charges as 7% of construction cost (without GST)
    const designCharges = constructionCost * 0.07;
    return constructionCost + designCharges;
  };

  const processedRooms = state.areaOption === 'total' && state.totalCarpetArea
    ? distributeAreaToRooms(parseFloat(state.totalCarpetArea), state.layoutType)
    : state.rooms;

  const handleDownloadPDF = async () => {
    if (typeof html2pdf === 'undefined') {
      console.error('html2pdf.js is not loaded.');
      alert('Failed to generate PDF. html2pdf.js is not loaded.');
      return;
    }

    // Create a container to hold all content
    const container = document.createElement('div');
    container.style.padding = '20px';
    
    // Get both estimate and notes sections
    const estimateElement = document.querySelector('.estimate-container');
    const notesElement = document.querySelector('.notes-section');

    if (!estimateElement || !notesElement) {
      console.error('Could not find required elements.');
      return;
    }

    // Clone both elements
    const estimateClone = estimateElement.cloneNode(true) as HTMLElement;
    const notesClone = notesElement.cloneNode(true) as HTMLElement;

    // Add logo to the beginning
    const logoContainer = document.createElement('div');
    logoContainer.style.textAlign = 'center';
    logoContainer.style.marginBottom = '20px';
    logoContainer.style.width = '100%';
    logoContainer.style.display = 'flex';
    logoContainer.style.justifyContent = 'center';
    
    const logoImg = document.createElement('img');
    logoImg.src = logo;
    logoImg.style.width = '300px';
    logoImg.style.height = 'auto';
    logoContainer.appendChild(logoImg);

    // Add page break classes
    estimateClone.style.pageBreakInside = 'avoid';
    notesClone.style.pageBreakInside = 'avoid';
    
    // Add styles to table rows to prevent breaking
    const tableRows = estimateClone.querySelectorAll('tr');
    tableRows.forEach(row => {
      (row as HTMLElement).style.pageBreakInside = 'avoid';
    });

    // Append all elements to the container
    container.appendChild(logoContainer);
    container.appendChild(estimateClone);
    container.appendChild(notesClone);

    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${state.clientName.replace(/[^a-zA-Z0-9]/g, '_')}_estimate.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: container.scrollHeight
      },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      },
      pagebreak: { mode: 'avoid-all' }
    };

    try {
      await html2pdf().from(container).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please check the console for details.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [calculationDots, setCalculationDots] = useState<string>('.');

  useEffect(() => {
    if (isCalculating) {
      const interval = setInterval(() => {
        setCalculationDots((dots: string) => dots.length >= 3 ? '.' : dots + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isCalculating]);

  const handleEditItem = (roomId: string | undefined, itemId: string | undefined) => {
    let currentAmount = '';
    if (state.isVilla) {
      state.floors.forEach((floor: Floor) => {
        floor.rooms.forEach((room: Room) => {
          if (room.id === roomId) {
            const item = room.items.find((item: RoomItem) => item.id === itemId);
            if (item) currentAmount = item.amount.toString();
          }
        });
      });
    } else if (state.rooms) {
      state.rooms.forEach((room: Room) => {
        if (room.id === roomId) {
          const item = room.items.find((item: RoomItem) => item.id === itemId);
          if (item) currentAmount = item.amount.toString();
        }
      });
    }
    setEditingItem({ roomId, itemId, value: currentAmount });
  };

  const handleConfirmEdit = (roomId: string | undefined, itemId: string | undefined) => {
    if (!editingItem || !editingItem.value) return;

    const newAmount = parseFloat(editingItem.value);
    if (isNaN(newAmount)) return;

    setIsCalculating(true);
    setState((prevState: typeof state) => {
      const newState = { ...prevState };
      if (prevState.isVilla) {
        newState.floors = prevState.floors.map((floor: Floor) => ({
          ...floor,
          rooms: floor.rooms.map((room: Room) => {
            if (room.id === roomId) {
              return {
                ...room,
                items: room.items.map(item => {
                  if (item.id === itemId) {
                    return { ...item, amount: Math.round(newAmount) };
                  }
                  return item;
                })
              };
            }
            return room;
          })
        }));
      } else if (prevState.rooms) {
        newState.rooms = prevState.rooms.map((room: Room) => {
          if (room.id === roomId) {
            return {
              ...room,
              items: room.items.map(item => {
                if (item.id === itemId) {
                  return { ...item, amount: Math.round(newAmount) };
                }
                return item;
              })
            };
          }
          return room;
        });
      }
      return newState;
    });
    setEditingItem(null);
    
    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1500);
  };

  const handleDeleteItem = (roomId: string | undefined, itemId: string | undefined) => {
    setIsCalculating(true);
    setState((prevState: typeof state) => {
      const newState = { ...prevState };
      if (prevState.isVilla) {
        newState.floors = prevState.floors.map((floor: Floor) => ({
          ...floor,
          rooms: floor.rooms.map((room: Room) => {
            if (room.id === roomId) {
              return {
                ...room,
                items: room.items.filter(item => item.id !== itemId)
              };
            }
            return room;
          })
        }));
      } else if (prevState.rooms) {
        newState.rooms = prevState.rooms.map((room: Room) => {
          if (room.id === roomId) {
            return {
              ...room,
              items: room.items.filter(item => item.id !== itemId)
            };
          }
          return room;
        });
      }
      return newState;
    });
    
    // Add delay to show calculation effect
    setTimeout(() => {
      setIsCalculating(false);
      setCalculationDots('.');
    }, 1500);
  };

  return (
    <Layout>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">Estimate Summary</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </header>
    
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="estimate-container bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
          {/* Client Info */}
          <div className="px-6 py-8 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Client Information</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Client Name</p>
                    <p className="text-lg font-medium text-gray-900">{state.clientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Project Name</p>
                    <p className="text-lg font-medium text-gray-900">{state.projectName}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Category</p>
                    <p className="text-lg font-medium text-gray-900 capitalize">{state.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Total Carpet Area</p>
                    <p className="text-lg font-medium text-gray-900">
                      {state.isVilla
                        ? state.floors.reduce((total: number, floor: Floor) => 
                            total + floor.rooms.reduce((roomTotal: number, room: Room) => 
                              roomTotal + parseFloat(room.carpetArea || '0'), 0
                            ), 0
                          ).toFixed(2)
                        : state.areaOption === 'total'
                          ? state.totalCarpetArea
                          : state.rooms.reduce((total: number, room: Room) => 
                              total + parseFloat(room.carpetArea || '0'), 0
                            ).toFixed(2)
                      } sq.ft
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Date</p>
                    <p className="text-lg font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          {/* Room Details Tables */}
          <div className="px-6 py-5 space-y-6">
            {state.isVilla ? (
              state.floors.map((floor: Floor) => (
                <div key={floor.id} className="bg-gray-50 rounded-xl overflow-hidden shadow-md">
                  <div className="py-4 px-6 bg-gray-100 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{floor.name}</h3>
                  </div>
                  <div className="space-y-4 p-4">
                    {floor.rooms.map((room: Room) => (
                      <div key={room.id || room.name} className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-[#d2b48c]/10">
                            <tr>
                              <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">{room.name}</th>
                              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Area (sq.ft)</th>
                              <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Rate (₹/sq.ft)</th>
                              <th scope="col" className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">Amount (₹)</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-[#d2b48c]/5">
                              <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">{room.name}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">{room.carpetArea}</td>
                              <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">
                                {state.category === 'standard' ? '1,350' : state.category === 'premium' ? '2,300' : '3,500'}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                                ₹ {(parseFloat(room.carpetArea) * (state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500)).toLocaleString('en-IN')}
                              </td>
                            </tr>
                            {/* Room Items */}
                            {room.items.map((item: RoomItem) => (
                              <tr key={`${room.name}-${item.description}`} className="bg-gray-50">
                                <td className="pl-10 py-1.5 text-sm text-gray-600">{item.description}</td>
                                <td className="px-3 py-1.5 text-right text-sm text-gray-500">{item.quantity}</td>
                                <td className="px-3 py-1.5 text-right text-sm text-gray-500">{item.unit}</td>
                                <td className="px-6 py-1.5 text-right text-sm text-gray-600">
                                  {editingItem?.roomId === room.id && editingItem?.itemId === item.id ? (
                                    <div className="flex items-center justify-end space-x-2">
                                      <input
                                        type="number"
                                        className="w-24 px-2 py-1 text-sm border rounded"
                                        value={editingItem?.value ?? ''}
                                        onChange={(e) => setEditingItem(editingItem ? { ...editingItem, value: e.target.value } : null)}
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => handleConfirmEdit(room.id, item.id)}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setEditingItem(null)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-end space-x-2">
                                      <span>₹ {item.amount.toLocaleString('en-IN')}</span>
                                      <button
                                        onClick={() => handleEditItem(room.id, item.id)}
                                        className="text-blue-600 hover:text-blue-700"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(room.id, item.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        {/* Total Row */}
                        <tr className="bg-[#d2b48c]/5">
                          <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">Total</td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">-</td>
                          <td className="whitespace-nowrap px-3 py-4 text-right text-sm text-gray-500">-</td>
                          <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium text-gray-900">
                            ₹ {(parseFloat(room.carpetArea) * (state.category === 'standard' ? 1350 : state.category === 'premium' ? 2300 : 3500)).toLocaleString('en-IN')}
                          </td>
                          <td className="whitespace-nowrap px-2 py-4 text-center text-sm text-gray-500">-</td>
                        </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4">
                {processedRooms.map((room: Room) => (
                  <div key={room.id || room.name} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-[#d2b48c]/10">
                        <tr>
                          <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">{room.name}</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit</th>
                          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Amount</th>
                          <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {room.items.map((item: RoomItem) => (
                          <tr key={item.id || item.description}>
                            <td className="py-4 pl-6 pr-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-3 py-4 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-4 text-sm text-gray-900">{item.unit}</td>
                            <td className="px-3 py-4 text-sm text-gray-900 text-right">
                              {editingItem?.roomId === room.id && editingItem?.itemId === item.id ? (
                                <div className="flex items-center justify-end space-x-2">
                                  <input
                                    type="number"
                                    className="w-32 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={editingItem?.value ?? ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleConfirmEdit(room.id, item.id)}
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
                                <span>₹ {item.amount.toLocaleString('en-IN')}</span>
                              )}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-900 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditItem(room.id, item.id)}
                                  className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(room.id, item.id)}
                                  className="p-2 text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Trash className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="py-4 pl-6 pr-3 text-sm font-medium text-gray-900">Total</td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900 text-right">
                            {isCalculating ? (
                              <span className="text-gray-600 animate-pulse">Calculating{calculationDots}</span>
                            ) : (
                              <span>₹ {room.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
                            )}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            )}
          </div>
    
          {/* Additional Services */}
          <div className="px-6 py-5 border-t border-gray-200 bg-white">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Services</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <dt className="text-sm font-medium text-gray-700 mb-2">Design & Visualization</dt>
                <dd className="text-2xl font-semibold text-gray-900">₹ {(calculateSubtotal() * 0.10).toLocaleString('en-IN')}</dd>
                <p className="text-sm text-gray-600 mt-2">Includes consultation, 2D drawings, and 3D visualization</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <dt className="text-sm font-medium text-gray-700 mb-2">Project Management</dt>
                <dd className="text-2xl font-semibold text-gray-900">₹ {(calculateSubtotal() * 0.01).toLocaleString('en-IN')}</dd>
                <p className="text-sm text-gray-600 mt-2">Supervision, coordination, and quality control</p>
              </div>
            </dl>
          </div>
    
          {/* Total Calculations */}
          <div className="px-6 py-8 bg-gray-50 rounded-b-xl">
            <dl className="space-y-6 max-w-2xl mx-auto">
              <div className="flex justify-between items-center py-2">
                <dt className="text-base font-medium text-gray-600">Construction Cost</dt>
                <dd className="text-lg font-semibold text-gray-900">₹ {calculateSubtotal().toLocaleString('en-IN')}</dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-base font-medium text-gray-600">Design Services</dt>
                <dd className="text-lg font-semibold text-gray-900">₹ {(calculateSubtotal() * 0.10).toLocaleString('en-IN')}</dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-base font-medium text-gray-600">Project Management</dt>
                <dd className="text-lg font-semibold text-gray-900">₹ {(calculateSubtotal() * 0.01).toLocaleString('en-IN')}</dd>
              </div>
              <div className="pt-6 flex justify-between items-center border-t-2 border-gray-300">
                <dt className="text-xl font-bold text-gray-900">Grand Total</dt>
                <dd className="text-2xl font-bold text-blue-600">₹ {(calculateSubtotal() * 1.11).toLocaleString('en-IN')}</dd>
              </div>
            </dl>
          </div>
        </div>
    
        {/* Notes Section */}
        <div className="notes-section px-6 py-8 border-t border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Important Notes</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• THIS IS A TENTATIVE ESTIMATE (PROVIDES AN APPROX. ESTIMATE) AND IS SUBJECT TO MATERIAL REQUIREMENTS AND PRICES.</li>
            <li>• THE RATES ARE ONLY ESTIMATED AND NOT REAL OR ACCORDING TO MARKET RATES.</li>
            <li>• 18% GST WILL BE APPLICABLE ON THE FINAL AMOUNT.</li>
            <li>• Material costs are subject to market fluctuations.</li>
            <li>• Any modifications to the original plan may incur additional charges.</li>
            <li>• Timeline for project completion will be finalized upon contract signing.</li>
            <li>• Site preparation and basic civil work costs are included.</li>
            <li>• Additional requirements or customizations will be charged separately.</li>
            <li>• Quotation will be provided and finalized after the 3D designing and material confirmation.</li>
            <li>• Kitchen appliances (refrigerator, chimney, dishwasher, etc.) are not included in the estimate.</li>
            <li>• Only basic bathroom accessories (soap holders, towel rods, toilet paper holders) are included in the estimate.</li>
            <li>• Other accessories will be charged separately.</li>
            <li>• Mattress and bed-sheets are not included in the estimate.</li>
            <li>• Study chair, photo frames & other artifacts are not included in the estimate.</li>
            <li>• Balcony furniture is not included in the estimate.</li>
            <li>• Panel lights, profile lights, hanging lights, chandeliers, etc. are not included in the estimate.</li>
            <li>• Electronic appliances (TV, AC, water purifier, washing machine, etc.) are not included in the estimate.</li>
          </ul>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-gray-500 border-t border-gray-200 pt-8 pb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-2">CHOICEDGE INTERIOR DESIGN</h3>
          <div className="mt-2 text-sm space-y-1">
            <p>Shradha House, Office Block No. SI-1, 6th Floor</p>
            <p>Sardar Vallabhbhai Patel Marg (Kingsway), Nagpur-440001</p>
          </div>
          <div className="mt-6 flex justify-center space-x-8 text-sm font-medium">
            <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <Phone className="w-4 h-4 mr-2" />
              +91 8956125439
            </div>
            <div className="text-gray-600 hover:text-gray-900 transition-colors">www.choicedge.com</div>
            <div className="text-gray-600 hover:text-gray-900 transition-colors">info@choicedge.com</div>
          </div>
        </footer>
      </main>
    </Layout>
  );
}

export default EstimateSummaryPage;