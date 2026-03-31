"use client";

import { useState } from "react";
import Button from "../ui/button";
import LoginChekcbox from "./login-chekbox";
import LoginField from "./login-field";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="_social_login_form">
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
                        <Button type="button" className="_social_login_form_btn_link">Login now</Button> 
                    </div>
                </div>
            </div>
        </div>
    )
}