import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Home from "./views/Home";
import Footer from "./components/Footer";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col justify-start items-center">
      <Sidebar />
      {!isMobile && <Header />}

      <main className="w-full flex flex-col justify-center items-center box-border">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/press" element={<PressSection />} />
          <Route path="/sponsors" element={<SponsorsSection />} /> */}
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
