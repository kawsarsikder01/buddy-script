"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson, ApiError } from "@/lib/api"; 
import RegistrationField from "./registration-field";
import RegistrationCheckbox from "./registration-checkbox";
import RegistrationSubmit from "./registration-submit";

interface AuthResponse {
  token: string;
}

export default function RegistrationForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!agreed) {
      setError("You must agree to terms & conditions.");
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiJson<AuthResponse>("/api/register", "POST", {
        firstName,
        lastName,
        email,
        password,
      }); 
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Unable to register. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="_social_registration_form" onSubmit={handleSubmit}>
      <div className="row">
        <RegistrationField
          label="First Name"
          type="text"
          value={firstName}
          setValue={setFirstName}
          required
          className="col-xl-6 col-lg-6 col-md-12 col-sm-12"
        />
        <RegistrationField
          label="Last Name"
          type="text"
          value={lastName}
          setValue={setLastName}
          required
          className="col-xl-6 col-lg-6 col-md-12 col-sm-12"
        />
        <RegistrationField
          label="Email"
          type="email"
          value={email}
          setValue={setEmail}
          required
        />
        <RegistrationField
          label="Password"
          type="password"
          value={password}
          setValue={setPassword}
          required
          minLength={8}
        />
        <RegistrationField
          label="Repeat Password"
          type="password"
          value={repeatPassword}
          setValue={setRepeatPassword}
          required
          minLength={8}
        />
      </div>
      
      <RegistrationCheckbox
        label="I agree to terms & conditions"
        id="registration-terms"
        checked={agreed}
        setChecked={setAgreed}
      />

      <RegistrationSubmit
        loading={loading}
        error={error}
        buttonText="Register now"
        loadingText="Creating account..."
      />
    </form>
  );
}

