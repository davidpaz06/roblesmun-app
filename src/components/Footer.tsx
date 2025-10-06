import type { FC } from "react";
import { CiInstagram } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { Link } from "react-router-dom";

const Footer: FC = () => {
  return (
    <footer className="border-t-1 border-[#282828] w-full h-48 mt-0 flex flex-col items-center justify-center">
      <div className="w-[480px] flex flex-col sm:flex-row justify-between items-center">
        <Link
          to="https://www.instagram.com/roblesmun"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <CiInstagram className="text-white mx-1" size={24} />
          <p>@roblesmun</p>
        </Link>

        <Link
          to="mailto:mun@losroblesenlinea.com.ve"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          <CiMail className="text-white mx-1" size={24} />
          <p>mun@losroblesenlinea.com.ve</p>
        </Link>
      </div>
      <h6 className="text-xs mt-8 font-montserrat-light">
        © 2026 Roblesmun. Todos los derechos reservados.
      </h6>
    </footer>
  );
};

export default Footer;
