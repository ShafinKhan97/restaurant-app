'use client';

import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import FadeIn from '@/components/ui/FadeIn';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const faqs = [
    {
      question: "Do customers need to download an app?",
      answer: "No, absolutely not. Customers simply point their native smartphone camera at the QR code on your table, and the digital menu opens directly in their mobile web browser instantly."
    },
    {
      question: "Can I update my menu and prices in real-time?",
      answer: "Yes! As soon as you make a change in your dashboard—whether it's adding a special, updating a price, or marking an item out-of-stock—it goes live immediately on all customer phones."
    },
    {
      question: "Do I need to reprint my QR codes when I change the menu?",
      answer: "No. Your QR code links to your restaurant's profile. You can change your menu 100 times a day, and the QR codes on your tables will never need to be replaced."
    },
    {
      question: "What if the customer wants to split the bill?",
      answer: "While this platform currently focuses heavily on digital menu cataloging and dynamic variants, integrated ordering and payment splitting module are actively in development for the premium tier."
    },
    {
      question: "Are there any setup fees?",
      answer: "No setup fees, no hidden costs. You can get started right now completely for free."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brand-surface border-b border-brand-border">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header */}
        <FadeIn delay={0.1} direction="up" className="text-center mb-16">
          <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-3">FAQ</h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Frequently Asked Questions
          </h3>
          <p className="text-gray-400 text-lg">
            Everything you need to know about setting up your digital menu.
          </p>
        </FadeIn>

        {/* Accordion List */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <FadeIn key={index} delay={0.2 + (index * 0.1)} direction="up">
                <div 
                  className={`border rounded-xl transition-all duration-300 overflow-hidden
                    ${isOpen ? 'border-primary/50 bg-brand-elevated' : 'border-brand-border bg-brand-base hover:border-gray-500'}`}
                >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-brand-surface text-gray-400'}`}>
                    <FaChevronDown size={14} />
                  </div>
                </button>
                
                <div 
                  className={`grid transition-all duration-300 ease-in-out
                            ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden px-6">
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
