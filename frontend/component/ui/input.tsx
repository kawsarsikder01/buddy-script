"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const  Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <>
        <input
          ref={ref}
          className={`form-control _social_login_input ${error ? "is-invalid" : ""} ${className}`}
          {...props}
        />
        {error && <div className="invalid-feedback">{error}</div>}
      </>
    );
  }
);

Input.displayName = "InputField";