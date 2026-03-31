import LoginLeft from "@/component/login/left";
import LoginRight from "@/component/login/right";
import Shape from "@/component/login/shape";

export default function Login() {
    return (
        <section className="_social_login_wrapper _layout_main_wrapper">
            <Shape shapeClass="_shape_one" shapeImages={{ lightShape: "shape1.svg", darkShape: "dark_shape.svg" }} />
            <Shape shapeClass="_shape_two" shapeImages={{ lightShape: "shape2.svg", darkShape: "dark_shape1.svg" }} />
            <Shape shapeClass="_shape_three" shapeImages={{ lightShape: "shape3.svg", darkShape: "dark_shape2.svg" }} />
            <div className="_social_login_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <LoginLeft />
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <LoginRight />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}