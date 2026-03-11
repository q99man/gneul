import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full p-6 md:p-8 flex justify-between items-end z-40 bg-[#fafafa]/80 backdrop-blur-md border-t border-gray-200">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-serif font-bold tracking-tighter">GNEUL</h3>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-sans">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </div>
      
      <div className="flex gap-6 text-xs font-bold tracking-widest uppercase font-sans">
        {['Instagram', 'Twitter', 'Email'].map((link) => (
          <a
            key={link}
            href="#"
            className="text-gray-600 hover:text-black transition-colors cursor-pointer"
          >
            {link}
          </a>
        ))}
      </div>
    </footer>
  );
};
