import type { FC } from "react";
import { CiLogin } from "react-icons/ci";
import { Link } from "react-router-dom";

const Header: FC = () => {
  const headerTabs = [
    { name: "PRENSA", path: "/press" },
    { name: "PATROCINADORES", path: "/sponsors" },
    { name: "INSCRIPCIONES", path: "/registrations" },
    { name: "COMITÉS", path: "/committees" },
  ];

  return (
    <header className="text-white font-montserrat-light w-[90%] max-w-[800px] min-w-[580px] m-8 fixed z-10">
      <Link to="/login">
        <span className="p-2 absolute top-[-8px] right-0 z-10 flex items-center gap-2 text-xs">
          <p>INICIAR SESIÓN</p>
          <CiLogin size={16} />
        </span>
      </Link>
      <nav>
        <ul className="bg-transparent/60 mt-10 w-full h-12 flex items-center justify-around rounded-lg bg-glass">
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
    </header>
  );
};

export default Header;
