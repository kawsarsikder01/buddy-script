"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    // ID is highly recommended for accessibility (linking label to input)
    error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className = "", type = "checkbox", error, ...props }, ref) => {
        return (
            <>
                <input
                    ref={ref}
                    type={type}
                    className={`form-check-input _social_login_form_check_input ${error ? "is-invalid" : ""} ${className}`}
                    {...props}
                />

                {error && <div className="invalid-feedback d-block">{error}</div>}
            </>
        );
    }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;