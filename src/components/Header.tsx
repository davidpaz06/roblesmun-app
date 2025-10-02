import type { FC } from "react";
import { useEffect, useState } from "react";
import { CiLogin } from "react-icons/ci";
import { CiUser } from "react-icons/ci";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const Header: FC = () => {
  const { user, logout } = useAuth();
  const headerTabs = [
    // { name: "PRENSA", path: "/press" },
    { name: "PATROCINADORES", path: "/sponsors" },
    { name: "COMITÉS", path: "/committees" },
    { name: "INSCRIPCIONES", path: "/registrations" },
  ];

  const [direction, setDirection] = useState<"up" | "down">("up");

  useEffect(() => {
    let prevScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > prevScrollY) {
        setDirection("down");
      } else {
        setDirection("up");
      }
      prevScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      className="text-white font-montserrat-light w-[90%] max-w-[800px] min-w-[580px] m-4 fixed z-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: direction === "down" ? -100 : 0 }}
      onHoverStart={() => setDirection("up")}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {user ? (
        <span
          onClick={() => {
            console.log(user);
          }}
          className="p-2 absolute top-[-4px] right-0 z-10 flex items-center gap-2 text-xs"
        >
          <CiUser size={24} />
          <p>{user.email}</p>

          <button
            className="p-2  flex items-center gap-2 text-xs bg-glass cursor-pointer"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </span>
      ) : (
        <Link to="/login">
          <span className="p-2 absolute top-[-4px] right-0 z-10 flex items-center gap-2 text-xs">
            <CiLogin size={24} />
            <p>INICIAR SESIÓN</p>
          </span>
        </Link>
      )}

      <nav>
        <ul className="mt-12 w-full h-12 flex items-center justify-around bg-glass">
          <li className="h-full">
            <Link className="h-full flex items-center px-1" to="/">
              <img
                src="src/assets/img/logo-white.png"
                alt="Logo de Roblesmun"
                className="h-9 w-auto"
              />
            </Link>
          </li>

          {headerTabs.map((tab) => (
            <li className="h-full" key={tab.name}>
              <Link
                className="h-full flex items-center px-3  md:px-6"
                to={tab.path}
              >
                {tab.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
