'use client';

import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FaCheckCircle, FaRegCircle, FaInfoCircle, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  // A simple checklist to guide the admin
  const checklist = [
    { title: 'Update your profile information', completed: true },
    { title: 'Create Menu Items', completed: true },
    { title: 'Setup active Discounts', completed: true },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const progressPercentage = (completedCount / checklist.length) * 100;

  // Generate unique URL based on admin's restaurantId
  // In our mock setup, the user.id is effectively their restaurantId
  const websiteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const menuLink = `${websiteUrl}/menu/${user?.id || 'demo'}`;

  const downloadQRCode = () => {
    const svg = document.getElementById('QRCode');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Menu-${user?.name?.replace(/\s+/g, '-') || 'Restaurant'}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <FadeIn delay={0.1} direction="down">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-surface to-brand-elevated border border-brand-border rounded-2xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white mb-1 tracking-tight">
                Welcome back, {user?.name || 'Admin'}! 👋
              </h1>
              <p className="text-gray-400 text-base">
                Your digital menu control center is ready. What's on the menu today?
              </p>
            </div>
            
            <div className="bg-brand-base border border-brand-border p-3 rounded-xl flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Current Role</p>
                <p className="text-white font-semibold capitalize">{user?.role?.replace('_', ' ').toLowerCase() || 'Administrator'}</p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Getting Started Checklist */}
        <div className="lg:col-span-2">
          <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-5 h-full">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white mb-1">Getting Started</h2>
              <p className="text-sm text-gray-400">Complete these steps to set up your restaurant menu.</p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Setup Progress</span>
                <span className="text-primary font-bold">{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-brand-base rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <ul className="space-y-2">
              {checklist.map((item, index) => (
                <li key={index} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-brand-base transition-colors">
                  {item.completed ? (
                    <FaCheckCircle className="text-green-500 w-4 h-4 shrink-0" />
                  ) : (
                    <FaRegCircle className="text-gray-500 w-4 h-4 shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>

        {/* System Info & QR Code */}
        <div className="lg:col-span-1 space-y-4">
          <FadeIn delay={0.3} direction="up" className="bg-brand-elevated border border-primary/20 rounded-xl p-5 flex flex-col items-center text-center justify-center">
             <div className="mb-4 bg-white p-3 rounded-xl shadow-glow relative">
                <QRCodeSVG 
                  id="QRCode"
                  value={menuLink} 
                  size={150}
                  level={"H"}
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
             </div>
             
             <h3 className="font-bold text-white mb-2 text-base">Your Menu QR Code</h3>
             <p className="text-xs text-gray-400 leading-relaxed mb-4">
               Print this, put it on your tables, or share the link online. Customers will scan it to view your menu instantly!
             </p>
             
             <div className="flex flex-col w-full gap-2">
               <button 
                 onClick={downloadQRCode}
                 className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-2 rounded-lg text-sm font-semibold transition-colors"
               >
                 <FaDownload /> Download Image
               </button>
               <a 
                 href={menuLink} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="w-full flex items-center justify-center gap-2 bg-brand-base hover:bg-brand-surface border border-brand-border text-white py-2 rounded-lg text-sm font-medium transition-colors"
               >
                 <FaExternalLinkAlt className="w-3 h-3" /> View Public Menu
               </a>
             </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
}
