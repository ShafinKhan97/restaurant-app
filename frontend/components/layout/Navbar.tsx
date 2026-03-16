'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features',     href: '#features'     },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Testimonials', href: '#testimonials'  },
    { label: 'FAQ',           href: '#faq'           },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f1117]/85 backdrop-blur-md border-b border-[#2e3347]">
      <nav className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl text-[#f97316] leading-none">▦</span>
          <span className="text-xl font-extrabold tracking-tight text-white">
            QR<span className="text-[#f97316]">Menu</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-8 list-none">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150
                           after:absolute after:bottom-[-4px] after:left-0 after:h-0.5 after:w-0
                           after:bg-[#f97316] after:rounded-full after:transition-all after:duration-300
                           hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-150"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#f97316] rounded-md
                       hover:bg-[#ea6c0a] shadow-[0_0_0_0_rgba(249,115,22,0)]
                       hover:shadow-[0_0_24px_rgba(249,115,22,0.35)] transition-all duration-150"
          >
            Get Started
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-[22px] h-[2px] bg-gray-400 rounded-full transition-all duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`block w-[22px] h-[2px] bg-gray-400 rounded-full transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-[22px] h-[2px] bg-gray-400 rounded-full transition-all duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden flex flex-col px-6 pb-6 gap-1 border-t border-[#2e3347] animate-[slideDown_0.2s_ease]">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-2 py-3 text-base font-medium text-gray-400 hover:text-white
                         hover:bg-[#22263a] rounded-md transition-all duration-150"
            >
              {link.label}
            </Link>
          ))}
          <div className="h-px bg-[#2e3347] my-2" />
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block px-2 py-3 text-base font-medium text-gray-400 hover:text-white
                       hover:bg-[#22263a] rounded-md transition-all duration-150"
          >
            Log In
          </Link>
          <Link
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="block px-2 py-3 text-base font-semibold text-white text-center
                       bg-[#f97316] hover:bg-[#ea6c0a] rounded-md transition-all duration-150 mt-1"
          >
            Get Started Free
          </Link>
        </div>
      )}
    </header>
  );
}
