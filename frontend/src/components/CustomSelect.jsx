import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useI18n } from '../i18n';

/**
 * World-Class CustomSelect Component
 * Eliminates the ugly native OS <select> dropdown and provides a modern,
 * dark-mode native, glassmorphic dropdown with checkmarks and smooth animations.
 */
const CustomSelect = ({
  options = [],
  value,
  onChange,
  placeholder,
  ariaLabel,
  icon: LeadingIcon = null,
  className = '',
  disabled = false,
  fullWidth = false,
  size = 'default' // 'default' | 'sm' | 'lg'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const { isRTL } = useI18n();

  // Normalize options to { value, label, icon }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : '',
        label: opt.label || String(opt.value),
        icon: opt.icon || null
      };
    }
    return { value: opt, label: String(opt), icon: null };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (onChange) {
      onChange(optionValue);
    }
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${fullWidth ? 'full-width' : ''} ${className}`}
    >
      <button
        type="button"
        className={`custom-select-trigger ${size} ${isOpen ? 'active' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder || 'Select'}
      >
        <div className="custom-select-value">
          {LeadingIcon && <LeadingIcon size={15} className="custom-select-leading-icon" />}
          {selectedOption?.icon && (
            <span className="custom-select-opt-icon">{selectedOption.icon}</span>
          )}
          <span className="custom-select-text">
            {selectedOption ? selectedOption.label : placeholder || ''}
          </span>
        </div>

        <ChevronDown
          size={15}
          className={`custom-select-chevron ${isOpen ? 'open' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`custom-select-dropdown ${isRTL ? 'rtl' : 'ltr'}`}
          role="listbox"
        >
          <div className="custom-select-dropdown-inner">
            {normalizedOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={String(opt.value)}
                  className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="custom-select-opt-content">
                    {opt.icon && <span className="custom-select-opt-icon">{opt.icon}</span>}
                    <span className="custom-select-opt-label">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="custom-select-check-icon" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
