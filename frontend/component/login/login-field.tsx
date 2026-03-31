"use client";

import { Input } from "../ui/input";
import Label from "../ui/label";

const LoginField = ({ label, type, placeholder, setValue, value }: { label: string; type: string; placeholder: string; setValue: (value: string) => void; value: string }) => {
    return (
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
            <div className="_social_login_form_input _mar_b14">
                <Label>{label}</Label>
                <Input type={type} placeholder={placeholder} onChange={(e) => setValue(e.target.value)} value={value} />
            </div>
        </div>
    )
}

export default LoginField;