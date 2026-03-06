"use client";

import { forwardRef, InputHTMLAttributes, useId, useState, useEffect } from "react";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className = "",
      label,
      showValue = true,
      formatValue,
      min = 0,
      max = 100,
      step = 1,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const id = useId();
    const numValue = Number(value ?? min);
    const percentage = ((numValue - Number(min)) / (Number(max) - Number(min))) * 100;

    // Local state for input box to allow typing
    const [inputValue, setInputValue] = useState(String(numValue));

    // Sync input value when slider value changes externally
    useEffect(() => {
      setInputValue(String(numValue));
    }, [numValue]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);

      // Only trigger onChange if it's a valid number
      const num = parseFloat(val);
      if (!isNaN(num) && onChange) {
        // Create a synthetic event that matches what the slider would send
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: String(Math.min(Number(max), Math.max(Number(min), num))),
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleInputBlur = () => {
      // On blur, clamp the value and format it
      const num = parseFloat(inputValue);
      if (isNaN(num)) {
        setInputValue(String(numValue));
      } else {
        const clamped = Math.min(Number(max), Math.max(Number(min), num));
        setInputValue(String(clamped));
      }
    };

    return (
      <div className="space-y-2">
        {(label || showValue) && (
          <div className="flex items-center justify-between text-sm">
            {label && (
              <label htmlFor={id} className="text-white/60 text-xs">
                {label}
              </label>
            )}
            {showValue && (
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="w-16 px-1.5 py-0.5 text-xs font-mono text-white/80 bg-white/5 border border-white/10 rounded text-right focus:outline-none focus:border-white/30"
              />
            )}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className={`w-full h-1 rounded-full appearance-none cursor-pointer bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 ${className}`}
          style={{
            background: `linear-gradient(to right, rgb(52, 211, 153) 0%, rgb(52, 211, 153) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
          }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
