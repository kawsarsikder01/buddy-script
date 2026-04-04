"use client";

import Button from "@/component/ui/button";

interface RegistrationSubmitProps {
  loading: boolean;
  error: string | null;
  buttonText: string;
  loadingText: string;
}

export default function RegistrationSubmit({
  loading,
  error,
  buttonText,
  loadingText,
}: RegistrationSubmitProps) {
  return (
    <div className="row">
      <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
        <div className="_social_registration_form_btn _mar_t40 _mar_b60">
          <Button
            type="submit"
            className="w-100 px-5"
            disabled={loading}
          >
            {loading ? loadingText : buttonText}
          </Button>
          {error && <p className="mt-2 text-danger text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
}
