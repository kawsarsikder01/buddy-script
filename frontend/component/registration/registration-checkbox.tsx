"use client";

import Checkbox from "@/component/ui/checkbox";

interface RegistrationCheckboxProps {
  label: string;
  id: string;
  checked: boolean;
  setChecked: (checked: boolean) => void;
}

export default function RegistrationCheckbox({
  label,
  id,
  checked,
  setChecked,
}: RegistrationCheckboxProps) {
  return (
    <div className="row">
      <div className="col-lg-12 col-xl-12 col-md-12 col-sm-12">
        <div className="form-check _social_registration_form_check">
          <Checkbox
            id={id}
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="_social_registration_form_check_input"
          />
          <label
            className="form-check-label _social_registration_form_check_label"
            htmlFor={id}
          >
            {label}
          </label>
        </div>
      </div>
    </div>
  );
}
