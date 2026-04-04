"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiJson, ApiError } from "@/lib/api";
import { setAuthToken } from "@/lib/auth-storage";
import Button from "../ui/button";
import LoginChekcbox from "./login-chekbox";
import LoginField from "./login-field";

interface AuthResponse {
    token: string;
}

export default function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
             await apiJson<AuthResponse>("/api/login", "POST", {
                email,
                password,
            }); 
            router.push("/");
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message);
            } else {
                setError("Unable to login. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="_social_login_form" onSubmit={onSubmit}>
            <div className="row">
                <LoginField type="text" label="Email" placeholder="Enter your email" setValue={setEmail} value={email} />
                <LoginField type="password" label="Password" placeholder="Enter your password" setValue={setPassword} value={password} />
            </div>
            <div className="row">
                <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                    <LoginChekcbox label="Remember me" setValue={setRememberMe} value={rememberMe} />
                </div>
                <div className="col-lg-6 col-xl-6 col-md-6 col-sm-12">
                    <div className="_social_login_form_left">
                        <p className="_social_login_form_left_para">Forgot password?</p>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-12 col-md-12 col-xl-12 col-sm-12">
                    <div className="_social_login_form_btn _mar_t40 _mar_b60">
                        <Button type="submit" className="_social_login_form_btn_link" disabled={loading}>
                            {loading ? "Logging in..." : "Login now"}
                        </Button>
                        {error ? <p className="mt-2 text-danger">{error}</p> : null}
                    </div>
                </div>
            </div>
        </form>
    )
}
