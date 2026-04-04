import RegistrationLeft from "@/component/registration/left";
import RegistrationRight from "@/component/registration/right";
import Shape from "@/component/login/shape";

export default function RegistrationPage() {
  return (
    <section className="_social_registration_wrapper _layout_main_wrapper">
      <Shape shapeClass="_shape_one" shapeImages={{ lightShape: "shape1.svg", darkShape: "dark_shape.svg" }} />
      <Shape shapeClass="_shape_two" shapeImages={{ lightShape: "shape2.svg", darkShape: "dark_shape1.svg" }} />
      <Shape shapeClass="_shape_three" shapeImages={{ lightShape: "shape3.svg", darkShape: "dark_shape2.svg" }} />
      <div className="_social_registration_wrap">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-7 col-lg-7 col-md-12 col-sm-12">
              <RegistrationLeft />
            </div>
            <div className="col-xl-5 col-lg-5 col-md-12 col-sm-12">
              <RegistrationRight />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
