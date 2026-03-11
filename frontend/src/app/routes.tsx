import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OAuthCallback from "./pages/OAuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import Order from "./pages/Order";
import ReservationSuccess from "./pages/ReservationSuccess";
import MyPage from "./pages/MyPage";
import MemberEdit from "./pages/MemberEdit";
import ReservationList from "./pages/ReservationList";
import Wishlist from "./pages/Wishlist";
import HostSpaceForm from "./pages/HostSpaceForm";
import HostSpaces from "./pages/HostSpaces";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", index: true, Component: Home },
      { path: "/login", Component: Login },
      { path: "/signup", Component: Signup },
      { path: "/oauth/callback", Component: OAuthCallback },
      { path: "/order", Component: Order },
      { path: "/reservation/success/:id", Component: ReservationSuccess },
      { path: "/mypage", Component: MyPage },
      { path: "/mypage/edit", Component: MemberEdit },
      { path: "/mypage/reservations", Component: ReservationList },
      { path: "/mypage/wishlist", Component: Wishlist },
      { path: "/mypage/host/spaces", Component: HostSpaces },
      { path: "/admin", Component: AdminDashboard },
      { path: "/host/new", Component: HostSpaceForm },
      { path: "/space/new", Component: HostSpaceForm },
      { path: "/space/:spaceId/edit", Component: HostSpaceForm },
    ],
  },
]);
