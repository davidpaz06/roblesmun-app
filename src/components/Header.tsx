import type { FC } from "react";
import { CiLogin } from "react-icons/ci";
import { Link } from "react-router-dom";

const Header: FC = () => {
  return (
    <header className="text-white font-montserrat-light w-[95%] max-w-[768px] mt-16 mb-8">
      <Link to="/login">
        <span className="p-2 absolute top-4 right-4 flex items-center gap-2 text-sm">
          <p>INICIAR SESIÓN</p>
          <CiLogin size={18} />
        </span>
      </Link>
      <nav>
        <ul className="bg-[#ab0d13] w-full h-12 flex items-center justify-around rounded-lg">
          <li className="h-full">
            <Link className="h-full flex items-center px-1" to="/">
              <img
                src="src/assets/img/logo-white.png"
                alt="Logo de Roblesmun"
                className="h-9 w-auto"
              />
            </Link>
          </li>
          <li className="h-full">
            <Link
              className="h-full flex items-center px-3  md:px-6"
              to="/prensa"
            >
              PRENSA
            </Link>
          </li>
          <li className="h-full">
            <Link
              className="h-full flex items-center px-3  md:px-6"
              to="/patrocinadores"
            >
              PATROCINADORES
            </Link>
          </li>
          <li className="h-full">
            <Link
              className="h-full flex items-center px-3 md:px-6"
              to="/inscripciones"
            >
              INSCRIPCIONES
            </Link>
          </li>
          <li className="h-full">
            <Link
              className="h-full flex items-center px-3  md:px-6"
              to="/comites"
            >
              COMITÉS
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
