import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export default function LuxurySearchableSelect({
  label,
  value,
  options = [],
  onChange,
  placeholder = 'Select option',
  disabled = false,
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset search query when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Normalize options array to always contain { value, label } objects
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Find currently selected option label
  const selectedOption = normalizedOptions.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : '';

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full font-sans select-none" ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-bold tracking-widest text-brand-cream/50 uppercase mb-1.5 pl-1">
          {label} {required && <span className="text-brand-gold">*</span>}
        </label>
      )}

      {/* Selector Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-[#021c13] border rounded-xl text-brand-cream text-sm flex items-center justify-between transition-all duration-300 cursor-pointer text-left ${
          disabled 
            ? 'opacity-40 cursor-not-allowed border-white/5' 
            : isOpen
              ? 'border-brand-gold bg-[#021c13] shadow-[0_0_15px_rgba(212,175,55,0.15)]'
              : 'border-brand-gold/15 hover:border-brand-gold/40'
        }`}
      >
        <span className={`${displayLabel ? 'text-brand-cream font-medium' : 'text-brand-cream/30'} pr-2`}>
          {displayLabel || placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-brand-gold shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute left-0 right-0 z-50 overflow-hidden border border-brand-gold/30 bg-gradient-to-b from-[#021c13] to-[#011611] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Search Input bar */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] bg-black/25">
              <Search size={14} className="text-brand-gold/60 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-brand-cream text-xs placeholder:text-brand-cream/30 focus:outline-none focus:ring-0 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded-full hover:bg-white/5 text-brand-cream/40 hover:text-brand-cream cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Options List */}
            <ul 
              className="max-h-60 overflow-y-auto py-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-brand-gold/20"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(212, 175, 55, 0.25) transparent'
              }}
            >
              {filteredOptions.length === 0 ? (
                <li className="px-4 py-6 text-center text-xs text-brand-cream/40 font-medium">
                  No matching results found
                </li>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li
                      key={opt.value}
                      onClick={() => handleSelect(opt.value)}
                      className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-brand-gold/10 text-brand-gold font-bold'
                          : 'text-brand-cream/80 hover:bg-brand-gold/5 hover:text-brand-cream'
                      }`}
                    >
                      <span className="pr-4 whitespace-normal break-words">{opt.label}</span>
                      {isSelected && (
                        <Check size={14} className="text-brand-gold shrink-0" />
                      )}
                    </li>
                  );
                })
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
