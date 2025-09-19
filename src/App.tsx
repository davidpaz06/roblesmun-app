import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./views/Home";
import Footer from "./components/Footer";
import PressView from "./views/PressView";
import SponsorsView from "./views/SponsorsView";
import CommitteesView from "./views/CommitteesView";
import RegistrationsView from "./views/RegistrationsView";
import Login from "./views/Login";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640),
    location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hideNavigation = ["/login"].includes(location.pathname);

  return (
    <AuthProvider>
      <div className="flex flex-col justify-start items-center">
        {!hideNavigation && <Sidebar />}
        {!isMobile && !hideNavigation && <Header />}

        <main className="w-full flex flex-col justify-center items-center box-border">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/press" element={<PressView />} />
            <Route path="/sponsors" element={<SponsorsView />} />
            <Route path="/registrations" element={<RegistrationsView />} />
            <Route path="/committees" element={<CommitteesView />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
