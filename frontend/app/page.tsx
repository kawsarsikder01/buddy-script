import Switching from "@/component/feed/switching";
import HeaderMobileMenu from "@/component/header-mobile-menu";
import MobileNavigation from "@/component/mobile-navigation";
import Navbar from "@/component/navbar";
import LeftSidebar from "./feed/left-sidebar";
import MiddleFeed from "./feed/middle-feed";


export default function Home() {
  return (
    <div className="_layout _layout_main_wrapper">
      <Switching />
      <div className="_main_layout">
        <Navbar/>
        <HeaderMobileMenu />
        <MobileNavigation />
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                <LeftSidebar />
              </div>
              <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                <MiddleFeed />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
