'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 md:h-24 bg-white flex items-center justify-between shadow-md px-4 md:px-6">
      <div className="flex items-center space-x-4 md:space-x-8">
        <Link href="/">
          <Image src="/assets/icon/logo.png" alt="LetGoNow" width={56} height={56} className="h-10 md:h-14 w-auto" />
        </Link>
        <nav className="hidden md:flex space-x-4 md:space-x-8">
          <Link
            href="/yachts"
            className="text-black font-roboto text-base md:text-xl font-bold hover:text-teal-500 hover:border-b-4 hover:border-teal-500 transition py-2"
          >
            Tìm du thuyền
          </Link>
          <Link
            href="/flights"
            className="text-black font-roboto text-base md:text-xl font-bold hover:text-teal-500 hover:border-b-4 hover:border-teal-500 transition py-2"
          >
            Đặt vé máy bay
          </Link>
        </nav>
      </div>

      <div className="flex items-center">
        {/* Desktop login button */}
        <Link href="/login" className="hidden md:block">
          <button 
            type="button" 
            className="flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg md:hidden">
          <nav className="flex flex-col p-4 space-y-4">
            <Link
              href="/yachts"
              className="text-black font-roboto text-lg font-bold hover:text-teal-500 transition py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Tìm du thuyền
            </Link>
            <Link
              href="/flights"
              className="text-black font-roboto text-lg font-bold hover:text-teal-500 transition py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Đặt vé máy bay
            </Link>
            <Link
              href="/login"
              className="text-black font-roboto text-lg font-bold hover:text-teal-500 transition py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Đăng nhập
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
} 