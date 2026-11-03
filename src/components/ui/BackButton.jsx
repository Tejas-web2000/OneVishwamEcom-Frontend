import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * Reusable BackButton component with smooth pill styling and hover effect.
 */
export function BackButton({
  to,
  onClick,
  label = 'Back',
  className = '',
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    // Prioritize popping the history stack so search queries and scroll positions are preserved
    if (window.history.state?.idx > 0 || window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(to || '/');
    }
  };

  const baseClasses = `inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 hover:text-white hover:bg-brand-blue hover:border-brand-blue shadow-2xs transition-all duration-200 group cursor-pointer ${className}`;

  return (
    <button type="button" onClick={handleClick} className={baseClasses} aria-label={label}>
      <i className="fa-solid fa-arrow-left text-[11px] group-hover:-translate-x-0.5 transition-transform" />
      <span>{label}</span>
    </button>
  );
}

export default BackButton;

