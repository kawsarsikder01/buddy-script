import Image from "next/image";

export default function LoginLeft() {
    return (
        <div className="_social_login_left">
            <div className="_social_login_left_image">
                <img src={`/assets/images/login.png`} alt="Login Image" className="_left_img"   />
            </div>
        </div>
    )
}