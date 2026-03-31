"use client";

import { forwardRef } from "react";

const Button = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className = "", children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={`_btn1 ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;