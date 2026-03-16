'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaSearch, FaImage, FaStar, FaFire } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';
import apiClient from '@/lib/axios';

export default function PublicMenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  
  const [restaurantName, setRestaurantName] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data, status } = await apiClient.get(`/menu/${restaurantId}`, {
          validateStatus: (status) => status === 200 || status === 404
        });
        
        if (status === 404) {
          setRestaurantName("Restaurant Not Found");
          setIsLoading(false);
          return;
        }

        if (data.redirected) {
          router.replace(`/menu/${data.current_slug}`);
          return;
        }

        if (data.success && data.restaurant) {
          setRestaurantName(data.restaurant.name);
          
          // Flatten items from categorized map
          let allItems: any[] = [];
          if (data.menu) {
             Object.values(data.menu).forEach((categoryItems: any) => {
               allItems = [...allItems, ...categoryItems];
             });
          }
          setItems(allItems);
        }
      } catch (err) {
        console.error("Menu fetch failed", err);
        setRestaurantName("Restaurant Not Found");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenu();
  }, [restaurantId, router]);

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category_name)))];
  
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category_name === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCalculatedPrice = (item: any) => {
    let finalPrice = Number(item.price);
    let originalPrice = finalPrice;
    let hasDiscount = false;
    let appliedDiscountName = '';

    if (item.discount_type && item.discount_type !== 'none' && item.discount_value > 0) {
      hasDiscount = true;
      appliedDiscountName = item.discount_type === 'percentage' ? `${item.discount_value}% OFF deal` : `Rs. ${item.discount_value} OFF deal`;
      if (item.discount_type === 'percentage') {
        finalPrice = finalPrice - (finalPrice * (item.discount_value / 100));
      } else {
        finalPrice = Math.max(0, finalPrice - item.discount_value);
      }
    }
    return { finalPrice, originalPrice, hasDiscount, appliedDiscountName };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] pb-24 font-sans text-gray-100 flex flex-col">
      
      {/* Sleek Top Navigation */}
      <nav className="sticky top-0 z-40 bg-brand-surface/90 backdrop-blur-xl border-b border-brand-border px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm transition-all">
        {/* Left: Restaurant Name & Logo */}
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-glow">
             {restaurantName.substring(0,1).toUpperCase()}
           </div>
           <div className="flex flex-col">
             <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight tracking-tight">{restaurantName}</h1>
             <div className="flex items-center gap-1.5 mt-0.5">
               <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-md">
                 <FaStar className="w-2.5 h-2.5" /> 4.9
               </span>
               <span className="text-[10px] sm:text-xs text-gray-400 font-medium">120+ ratings</span>
             </div>
           </div>
        </div>
        
        {/* Right: Search Bar & Cool Factor (Live Pulse) */}
        <div className="flex items-center gap-2 sm:gap-4">
           
           {/* Desktop / Tablet Search */}
           <div className="hidden sm:flex relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 w-3.5 h-3.5 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Craving something?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-[#08080a] border border-brand-border rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm transition-all focus:w-64 lg:focus:w-80 shadow-inner"
              />
           </div>

           {/* Mobile Search Toggle */}
           <button 
             onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
             className="sm:hidden w-10 h-10 rounded-full bg-brand-base border border-brand-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-elevated transition-colors"
           >
             <FaSearch className="w-4 h-4" />
           </button>

           {/* The "Cool Factor" - Live Kitchen Status */}
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.15)] shrink-0 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-green-400 text-xs font-bold tracking-wide uppercase">Open Now</span>
           </div>
        </div>
      </nav>

      {/* Mobile Expanding Search Bar */}
      {isMobileSearchOpen && (
        <FadeIn delay={0} direction="down" className="sm:hidden px-4 py-3 bg-brand-surface border-b border-brand-border">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <FaSearch className="text-primary w-4 h-4" />
              </div>
              <input
                type="text"
                autoFocus
                placeholder="What are you craving?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#08080a] border border-primary/50 shadow-[0_0_10px_rgba(255,87,34,0.1)] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
          </div>
        </FadeIn>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Special Promo / Featured Banner */}
        {!searchQuery && activeCategory === 'All' && items.some(i => i.discount_type !== 'none' && i.discount_value > 0) && (
          <FadeIn delay={0.1} direction="up" className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-orange-600/10 border border-primary/20 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <FaFire className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white leading-tight mb-1">We have active specials!</h3>
                <p className="text-sm text-gray-300">Look for the red highlight on items to see your exclusive discounts.</p>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Categories Tabs */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 mt-2">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-glow border border-transparent scale-105' 
                  : 'bg-brand-surface border border-brand-border text-gray-400 hover:text-white hover:bg-brand-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center mb-5">
               <FaSearch className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nothing found</h3>
            <p className="text-gray-400 text-sm max-w-xs">We couldn't find anything matching your search. Try looking at a different category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-8">
            {filteredItems.map((item, index) => {
              const { finalPrice, originalPrice, hasDiscount, appliedDiscountName } = getCalculatedPrice(item);
              
              return (
                <FadeIn key={item._id} delay={index * 0.05} direction="up">
                  <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-brand-elevated transition-all flex flex-col h-full relative group hover:-translate-y-1">
                    
                    {/* Image */}
                    <div 
                      className="h-48 w-full bg-brand-base flex items-center justify-center relative bg-cover bg-center border-b border-brand-border"
                      style={{ backgroundImage: item.image_url ? `url(${item.image_url})` : 'none' }}
                    >
                      {!item.image_url && <FaImage className="w-12 h-12 text-brand-elevated" />}
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-red-500/95 text-white text-xs font-black px-2.5 py-1.5 rounded-md shadow-lg border border-red-400/50 flex items-center gap-1.5 tracking-wide backdrop-blur-md">
                          <FaFire className="w-3 h-3" /> {appliedDiscountName}
                        </div>
                      )}
                    </div>
                    
                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <h3 className="text-lg font-extrabold text-white leading-tight">{item.name}</h3>
                        <div className="text-right flex flex-col items-end shrink-0">
                          {hasDiscount && (
                            <span className="text-gray-500 line-through text-[11px] sm:text-xs font-bold">Rs. {originalPrice.toFixed(2)}</span>
                          )}
                          <span className={`font-black text-xl tracking-tight ${hasDiscount ? 'text-green-400' : 'text-primary'}`}>
                            Rs. {finalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2 line-clamp-3 leading-relaxed flex-1">
                        {item.description || 'A delicious, perfectly prepared dish made with fresh ingredients.'}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
}
