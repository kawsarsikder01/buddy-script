"use client";

import Checkbox from "../ui/checkbox";
import Label from "../ui/label";

export default function LoginChekcbox({ label, setValue, value }: { label: string; setValue: (value: boolean) => void; value: boolean }) {
    return (
        <div className="form-check _social_login_form_check">
            <Checkbox type="checkbox" id="flexRadioDefault2" onChange={(e) => setValue(!value)} checked={value} />
            <Label className="form-check-label _social_login_form_check_label" htmlFor="flexRadioDefault2">
                {label}
            </Label>
        </div>
    )
}