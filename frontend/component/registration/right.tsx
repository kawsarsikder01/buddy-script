import RegistrationForm from "./registration-form";
import Link from "next/link";

export default function RegistrationRight() {
  return (
    <div className="_social_registration_content">
      <div className="_social_registration_right_logo _mar_b28">
        <img src="/assets/images/logo.svg" alt="Image" className="_right_logo" />
      </div>
      <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
      <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>
      <button type="button" className="_social_registration_content_btn _mar_b40 w-100">
        <img src="/assets/images/google.svg" alt="Image" className="_google_img" /> <span>Register with google</span>
      </button>
      <div className="_social_registration_content_bottom_txt _mar_b40">
        <span>Or</span>
      </div>
      <RegistrationForm />
      <div className="row">
        <div className="col-xl-12 col-lg-12 col-md-12 col-sm-12">
          <div className="_social_registration_bottom_txt">
            <p className="_social_registration_bottom_txt_para">
              Already have an account? <Link href="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
