"use client";

import { Input } from "@/component/ui/input";
import Label from "@/component/ui/label";

interface RegistrationFieldProps {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  setValue: (value: string) => void;
  required?: boolean;
  minLength?: number;
  className?: string;
}

export default function RegistrationField({
  label,
  type,
  value,
  placeholder,
  setValue,
  required = false,
  minLength,
  className = "col-xl-12 col-lg-12 col-md-12 col-sm-12",
}: RegistrationFieldProps) {
  return (
    <div className={className}>
      <div className="_social_registration_form_input _mar_b14">
        <Label className="_social_registration_label _mar_b8">{label}</Label>
        <Input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="_social_registration_input"
        />
      </div>
    </div>
  );
}
