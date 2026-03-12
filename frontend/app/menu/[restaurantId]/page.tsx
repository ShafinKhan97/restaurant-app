'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { FaSearch, FaImage, FaShoppingCart, FaStar, FaChevronLeft, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function PublicMenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  
  const [restaurantName, setRestaurantName] = useState('Restaurant Menu');
  const [items, setItems] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{item: any, quantity: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching from database
    setTimeout(() => {
      // 1. Get restaurant info
      const users = JSON.parse(localStorage.getItem('qr-menu-users') || '[]');
      const restaurantUser = users.find((u: any) => u.id === restaurantId);
      
      if (restaurantUser) {
        setRestaurantName(restaurantUser.restaurantName || restaurantUser.name || 'Restaurant Menu');
      }

      // 2. Get items (for now we pull all local storage, ideally we'd filter by restaurantId)
      // Since our localstorage mock only supports one admin right now, we'll just pull the data
      const savedItems = localStorage.getItem('qr-menu-items');
      if (savedItems) {
        setItems(JSON.parse(savedItems));
      }

      // 3. Get discounts
      const savedDiscounts = localStorage.getItem('qr-menu-discounts');
      if (savedDiscounts) {
        setDiscounts(JSON.parse(savedDiscounts));
      }
      
      setIsLoading(false);
    }, 800);
  }, [restaurantId]);

  // Derived state
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))];
  
  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate price with discounts
  const getCalculatedPrice = (item: any) => {
    let finalPrice = Number(item.price);
    let originalPrice = finalPrice;
    let hasDiscount = false;
    let appliedDiscountName = '';

    if (item.discountId) {
      const discount = discounts.find(d => d.id.toString() === item.discountId.toString() && d.active);
      if (discount) {
        hasDiscount = true;
        appliedDiscountName = discount.name;
        if (discount.type === 'percentage') {
          finalPrice = finalPrice - (finalPrice * (discount.value / 100));
        } else {
          finalPrice = Math.max(0, finalPrice - discount.value);
        }
      }
    }
    return { finalPrice, originalPrice, hasDiscount, appliedDiscountName };
  };

  // Cart logic
  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: any) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c);
      }
      return prev.filter(c => c.item.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, cartItem) => {
      const { finalPrice } = getCalculatedPrice(cartItem.item);
      return total + (finalPrice * cartItem.quantity);
    }, 0);
  };
  
  const getCartItemCount = () => {
    return cart.reduce((count, cartItem) => count + cartItem.quantity, 0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-base flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0d] pb-24 font-sans text-gray-100 flex flex-col items-center">
      
      {/* Dynamic Header Image / Banner */}
      <div className="w-full max-w-2xl bg-brand-surface relative overflow-hidden shrink-0 shadow-md">
        <div className="h-40 sm:h-52 w-full bg-gradient-to-br from-brand-elevated to-brand-surface relative">
           <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a0d] to-transparent z-10"></div>
           {/* Abstract pattern placeholder */}
           <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        <div className="px-5 sm:px-8 absolute bottom-0 translate-y-[20%] w-full flex items-end gap-4 z-20">
           <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-base border-4 border-[#0a0a0d] shadow-lg flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-primary tracking-tighter">
                {restaurantName.substring(0,2).toUpperCase()}
              </span>
           </div>
           <div className="pb-4">
             <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">{restaurantName}</h1>
             <p className="text-sm font-medium text-gray-300 drop-shadow flex items-center gap-1.5">
               <FaStar className="text-yellow-400 w-3.5 h-3.5" /> 4.9 (120+ reviews)
             </p>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl px-5 sm:px-8 pt-12 flex-1 flex flex-col relative z-0">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500 w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search for a dish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-3.5 bg-brand-surface border border-brand-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-sm text-sm sm:text-base transition-colors"
          />
        </div>

        {/* Horizontal Category Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat 
                  ? 'bg-primary text-white shadow-glow border border-primary scale-105' 
                  : 'bg-brand-surface border border-brand-border text-gray-400 hover:text-white hover:bg-brand-elevated'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center h-full flex-1">
            <div className="w-16 h-16 rounded-full bg-brand-surface flex items-center justify-center mb-4">
               <FaSearch className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No items found</h3>
            <p className="text-gray-400 text-sm max-w-[250px]">Try adjusting your search or category filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
            {filteredItems.map((item, index) => {
              const { finalPrice, originalPrice, hasDiscount, appliedDiscountName } = getCalculatedPrice(item);
              const cartItem = cart.find(c => c.item.id === item.id);
              
              return (
                <FadeIn key={item.id} delay={index * 0.05} direction="up">
                  <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-elevated transition-colors flex flex-col h-full shadow-sm relative group">
                    
                    {/* Image Area */}
                    <div 
                      className="h-36 w-full bg-brand-base flex items-center justify-center relative bg-cover bg-center border-b border-brand-border"
                      style={{ backgroundImage: item.imageBase64 ? `url(${item.imageBase64})` : 'none' }}
                    >
                      {!item.imageBase64 && <FaImage className="w-10 h-10 text-brand-elevated" />}
                      
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md backdrop-blur-md border border-red-500/50">
                          {appliedDiscountName}
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="text-base font-bold text-white leading-tight">{item.name}</h3>
                        <div className="text-right flex flex-col items-end shrink-0">
                          {hasDiscount && (
                            <span className="text-gray-500 line-through text-[10px] sm:text-xs font-medium">${originalPrice.toFixed(2)}</span>
                          )}
                          <span className={`font-black tracking-tight ${hasDiscount ? 'text-green-400' : 'text-primary'}`}>
                            ${finalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                        {item.description || 'A delicious item freshly prepared for you.'}
                      </p>
                      
                      {/* Add to Cart Controls */}
                      <div className="pt-3 border-t border-brand-border mt-auto flex items-center justify-between">
                        {cartItem ? (
                           <div className="flex items-center gap-3 bg-brand-base rounded-lg p-1 border border-brand-border w-full justify-between">
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="w-8 h-8 rounded-md bg-brand-surface hover:bg-brand-elevated flex items-center justify-center text-white transition-colors"
                              >
                                <FaMinus className="w-3 h-3" />
                              </button>
                              <span className="font-bold text-white w-4 text-center">{cartItem.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)}
                                className="w-8 h-8 rounded-md bg-primary hover:bg-primary-hover shadow-glow flex items-center justify-center text-white transition-colors"
                              >
                                <FaPlus className="w-3 h-3" />
                              </button>
                           </div>
                        ) : (
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-brand-elevated hover:bg-brand-border border border-brand-border rounded-lg text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                          >
                            <FaPlus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating View Cart / Checkout Bar */}
      {getCartItemCount() > 0 && !isCartOpen && (
        <FadeIn direction="up" className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-lg pointer-events-auto">
             <button 
               onClick={() => setIsCartOpen(true)}
               className="w-full bg-primary hover:bg-primary-hover shadow-glow rounded-xl p-4 flex items-center justify-between transition-all hover:-translate-y-1"
             >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <FaShoppingCart className="w-6 h-6 text-white" />
                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-primary">
                      {getCartItemCount()}
                    </span>
                  </div>
                  <span className="font-bold text-white text-sm sm:text-base tracking-wide">View My Order</span>
                </div>
                <span className="font-black text-white sm:text-lg bg-black/20 px-3 py-1 rounded-lg">
                  ${getCartTotal().toFixed(2)}
                </span>
             </button>
          </div>
        </FadeIn>
      )}

      {/* Cart Modal / Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
           {/* Backdrop */}
           <div 
             className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
             onClick={() => setIsCartOpen(false)}
           />
           
           {/* Modal Body */}
           <div className="bg-brand-surface w-full max-w-md sm:rounded-2xl rounded-t-2xl relative z-10 shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] animate-in slide-in-from-bottom-8 duration-300">
              
              {/* Header */}
              <div className="p-5 border-b border-brand-border flex items-center justify-between bg-brand-base rounded-t-2xl sm:rounded-t-2xl">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaShoppingCart className="text-primary" /> Your Order
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-elevated transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Your cart is empty.</p>
                ) : (
                  cart.map((cartItem) => {
                    const { finalPrice } = getCalculatedPrice(cartItem.item);
                    return (
                      <div key={cartItem.item.id} className="flex items-center gap-4 bg-brand-base p-3 rounded-xl border border-brand-border">
                         <div 
                            className="w-16 h-16 rounded-lg bg-brand-surface shrink-0 bg-cover bg-center"
                            style={{ backgroundImage: cartItem.item.imageBase64 ? `url(${cartItem.item.imageBase64})` : 'none' }}
                         >
                            {!cartItem.item.imageBase64 && <FaImage className="w-6 h-6 m-5 text-gray-600 opacity-50" />}
                         </div>
                         <div className="flex-1 min-w-0">
                           <h4 className="font-bold text-white text-sm truncate">{cartItem.item.name}</h4>
                           <p className="text-primary font-black text-sm">${finalPrice.toFixed(2)}</p>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 bg-brand-surface rounded-lg p-1">
                            <button onClick={() => removeFromCart(cartItem.item.id)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-elevated rounded">
                              <FaMinus className="w-2.5 h-2.5" />
                            </button>
                            <span className="w-4 text-center text-sm font-bold">{cartItem.quantity}</span>
                            <button onClick={() => addToCart(cartItem.item)} className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-white hover:bg-brand-elevated rounded">
                              <FaPlus className="w-2.5 h-2.5" />
                            </button>
                         </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer / Checkout */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-brand-border bg-brand-surface rounded-b-2xl">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span>${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Service Fee (Demo)</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-brand-border mt-2">
                      <span>Total</span>
                      <span className="text-primary">${getCartTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      alert("In a real app, this would route to a payment processor like Stripe.");
                      setCart([]);
                      setIsCartOpen(false);
                    }}
                    className="w-full bg-white hover:bg-gray-100 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    Place Demo Order
                  </button>
                </div>
              )}
           </div>
        </div>
      )}

    </div>
  );
}
