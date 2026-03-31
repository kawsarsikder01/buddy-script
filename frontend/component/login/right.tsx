import LoginForm from "./login-form";

export default function LoginRight() {
    return (
        <div className="_social_login_content">
            <div className="_social_login_left_logo _mar_b28">
                <img src="assets/images/logo.svg" alt="Image" className="_left_logo" />
            </div>
            <p className="_social_login_content_para _mar_b8">Welcome back</p>
            <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>
            <button type="button" className="_social_login_content_btn _mar_b40">
                <img src="assets/images/google.svg" alt="Image" className="_google_img" /> <span>Or sign-in with google</span>
            </button>
            <div className="_social_login_content_bottom_txt _mar_b40"> <span>Or</span>
            </div>
            <LoginForm />
            <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                    <div className="_social_login_bottom_txt">
                        <p className="_social_login_bottom_txt_para">Dont have an account? <a href="#0">Create New Account</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}