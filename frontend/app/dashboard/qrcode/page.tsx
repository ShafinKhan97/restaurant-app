'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { FaDownload, FaExternalLinkAlt, FaQrcode, FaSpinner } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';
import apiClient from '@/lib/axios';

export default function QRCodePage() {
  const { user } = useAuth();
  const [slug, setSlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSlug = async () => {
      if (!user?.restaurantId) return;
      try {
        const { data } = await apiClient.get(`/restaurants/${user.restaurantId}`);
        setSlug(data.restaurant.slug);
      } catch (err) {
        console.error("Failed to fetch restaurant details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSlug();
  }, [user]);
  
  // Generate unique URL based on admin's restaurant slug
  const websiteUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const menuLink = `${websiteUrl}/menu/${slug}`;

  const downloadQRCode = () => {
    const svg = document.getElementById('DashboardMultiQRCode');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw white background
      if(ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-Menu-${user?.name?.replace(/\s+/g, '-') || 'Restaurant'}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-4xl mx-auto pb-8">
      <FadeIn delay={0.1} direction="down" className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <FaQrcode className="text-primary" /> Menu QR Code
        </h1>
        <p className="text-gray-400 text-sm">
          Print your personalized restaurant QR code for seamless table-side ordering.
        </p>
      </FadeIn>

      {isLoading || !slug ? (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="text-primary w-8 h-8 animate-spin" />
        </div>
      ) : (

      <FadeIn delay={0.2} direction="up" className="bg-brand-surface border border-brand-border rounded-xl p-8 lg:p-12 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
        {/* Generative Box Area */}
        <div className="shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-glow relative border-4 border-white">
             <QRCodeSVG 
               id="DashboardMultiQRCode"
               value={menuLink} 
               size={240}
               level={"H"}
               includeMargin={true}
               fgColor="#000000"
               bgColor="#ffffff"
             />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2">
                <FaExternalLinkAlt className="text-black w-6 h-6" />
             </div>
          </div>
        </div>
        
        {/* Info Area */}
        <div className="flex-1 w-full text-center md:text-left">
          <h2 className="text-2xl font-bold text-white mb-4">Print, Display, Profit.</h2>
          
          <p className="text-gray-400 leading-relaxed mb-6">
            Your QR code securely links directed to your live digital menu. Whenever you add a new item or change a discount, customers scanning this code instantly see the latest updates. There are absolutely <strong>no re-prints required!</strong>
          </p>

          <div className="space-y-4 max-w-sm mx-auto md:mx-0">
            <button 
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-lg font-semibold shadow-glow transition-colors"
            >
              <FaDownload className="w-5 h-5" /> Download High-Res Poster
            </button>
            
            <a 
              href={menuLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-brand-elevated hover:bg-brand-base border border-brand-border text-white py-3.5 rounded-lg font-medium transition-colors"
            >
              <FaExternalLinkAlt className="w-4 h-4 text-gray-400" /> View External Menu
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-brand-border flex items-center justify-center md:justify-start gap-3 text-sm text-gray-500">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mt-[2px]" /> Live tracking via <span className="text-gray-300 font-mono select-all">/menu/{slug}</span>
          </div>
        </div>
      </FadeIn>
      )}
    </div>
  );
}
