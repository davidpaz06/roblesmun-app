import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import { IoEyeOffOutline, IoEyeOutline } from "react-icons/io5";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo es requerido")
    .email("Debe ser un correo válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
    ),
});

const registerSchema = loginSchema.extend({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El apellido solo puede contener letras"
    ),
  institution: z.string().min(1, "Debes seleccionar una institución"),
  facultyCode: z.string().optional(),
});

const facultySchema = registerSchema.extend({
  facultyCode: z.string().regex(/^\d{6}$/, "Código inválido"),
});

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institution: string;
  facultyCode: string;
}

interface FormFields {
  label: string;
  name: keyof FormData;
  type: string;
  isRegistering: boolean;
  options?: string[];
}

const Login: FC = () => {
  const { login, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      institution: "",
      facultyCode: "",
    }),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [showPassword, setShowPassword] = useState<boolean>(false),
    [isRegistering, setIsRegistering] = useState<boolean>(false),
    [isFaculty, setIsFaculty] = useState<boolean>(false);

  const formFields: Array<FormFields> = [
    {
      label: "Institución",
      name: "institution",
      type: "select",
      isRegistering: true,
      options: [
        "U.E. Liceo Los Robles",
        "U.E. Colegio Mater Salvatoris",
        "U.E. Colegio Altamira",
        "U.E. Colegio Bellas Artes",
        "U.E. Colegio San Ignacio",
        "Universidad Católica Andrés Bello",
        "Universidad Central de Venezuela",
        "Universidad Simón Bolívar",
      ],
    },
    {
      label: "Correo Electrónico Institucional",
      name: "email",
      type: "email",
      isRegistering: false,
    },
    {
      label: "Contraseña",
      name: "password",
      type: "password",
      isRegistering: false,
    },
    { label: "Nombre", name: "firstName", type: "text", isRegistering: true },
    { label: "Apellido", name: "lastName", type: "text", isRegistering: true },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsFaculty(e.target.checked);
    if (!e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        facultyCode: "",
      }));
      if (errors.facultyCode) {
        setErrors((prev) => ({
          ...prev,
          facultyCode: "",
        }));
      }
    }
  };

  const validateForm = () => {
    try {
      let schema;

      if (isRegistering) {
        schema = isFaculty ? facultySchema : registerSchema;
      } else {
        schema = loginSchema;
      }

      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            formattedErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form with data:", formData);

    if (!validateForm()) {
      return;
    }

    if (isRegistering) {
      const success = await register({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        institution: formData.institution,
        facultyCode: isFaculty ? formData.facultyCode : null,
      });

      if (success) {
        navigate("/");
      } else {
        setErrors({
          submit: "Error al registrar usuario. Intenta nuevamente.",
        });
      }
    } else {
      const success = await login(formData.email, formData.password);

      if (success) {
        navigate("/");
      } else {
        setErrors({
          submit: "Credenciales inválidas. Verifica tu email y contraseña.",
        });
      }
    }
  };

  const handleIsRegistering = () => {
    setIsRegistering(!isRegistering);
    setErrors({});
    setIsFaculty(false);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      institution: "",
      facultyCode: "",
    });
  };

  const fieldsToShow = formFields.filter(
    (field) => !field.isRegistering || (field.isRegistering && isRegistering)
  );

  return (
    <>
      <section className="text-[#f0f0f0] w-full justify-center bg-transparent flex flex-row">
        <div className="sm:w-1/2 w-full flex flex-col items-center">
          <span className="flex flex-row items-center gap-4 my-4">
            <Link className="h-full flex items-center px-1" to="/">
              <img
                src="src/assets/img/logo-white.png"
                alt="Logo de Roblesmun"
                className="h-12 w-auto"
              />
            </Link>

            <h2 className="lg:text-[3.5em] text-[2.5em] font-montserrat-bold transition-all duration-500 ease-in-out">
              {isRegistering ? "Regístrate" : "Iniciar Sesión"}
            </h2>
          </span>

          <div className="text-center">
            <p className="sm:text-[1.5em] text-[0.5em] mb-4 font-montserrat-light">
              {isRegistering
                ? "¿Ya tienes una cuenta?"
                : "¿No tienes una cuenta aún?"}
              <button
                onClick={handleIsRegistering}
                className="text-gray-400 hover:text-white font-montserrat-bold transition-colors cursor-pointer ml-1"
              >
                {isRegistering ? "Iniciar Sesión" : "Regístrate aquí"}
              </button>
            </p>
          </div>

          <Link
            to="/"
            className="text-gray-400 text-center hover:text-white font-montserrat-light transition-colors cursor-pointer"
          >
            Volver a inicio
          </Link>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-6 rounded-lg mt-8 w-[90%] max-w-lg sm:h-120 max-h-[75dvh] overflow-y-auto"
          >
            {errors.submit && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded">
                {errors.submit}
              </div>
            )}

            {fieldsToShow.map((field) => (
              <div key={field.name} className="flex flex-col">
                <label
                  htmlFor={field.name}
                  className="mb-2 font-montserrat-bold"
                >
                  {field.label}
                </label>

                {field.type === "select" ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`p-4 cursor-pointer bg-glass rounded-lg focus:outline-none focus:ring-2 transition-colors text-[#f0f0f0] ${
                      errors[field.name]
                        ? "border border-red-500 focus:ring-red-500"
                        : "focus:ring-gray-400 focus:border-transparent"
                    }`}
                  >
                    <option value="" disabled className="bg-[#101010]">
                      Selecciona tu institución
                    </option>
                    {field.options?.map((option) => (
                      <option
                        key={option}
                        value={option}
                        className="bg-[#242424]"
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                ) : field.type === "password" ? (
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className={`w-full p-2 pr-12 bg-glass rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        errors[field.name]
                          ? "border border-red-500 focus:ring-red-500"
                          : "focus:ring-blue-500 focus:border-transparent"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      className="cursor-pointer absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {showPassword ? (
                        <IoEyeOffOutline size={24} />
                      ) : (
                        <IoEyeOutline size={24} />
                      )}
                    </button>
                  </div>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className={`p-2 bg-glass rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                      errors[field.name]
                        ? "border border-red-500 focus:ring-red-500"
                        : "focus:ring-blue-500 focus:border-transparent"
                    }`}
                  />
                )}

                {errors[field.name] && (
                  <span className="text-red-400 text-sm mt-1 font-montserrat-light">
                    {errors[field.name]}
                  </span>
                )}
              </div>
            ))}

            {isRegistering && (
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isFaculty"
                  checked={isFaculty}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 cursor-pointer bg-glass border-gray-600 rounded focus:ring-gray-400 focus:ring-1"
                />
                <label
                  htmlFor="isFaculty"
                  className="text-sm font-montserrat-light cursor-pointer"
                >
                  Soy Faculty
                </label>
              </div>
            )}

            {isRegistering && isFaculty && (
              <div className="flex flex-col">
                <label
                  htmlFor="facultyCode"
                  className="mb-2 font-montserrat-bold"
                >
                  Código de Faculty
                </label>
                <input
                  type="text"
                  id="facultyCode"
                  name="facultyCode"
                  value={formData.facultyCode}
                  onChange={handleChange}
                  placeholder="Ingresa tu código de Faculty"
                  className={`p-2 bg-glass rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.facultyCode
                      ? "border border-red-500 focus:ring-red-500"
                      : "focus:ring-blue-500 focus:border-transparent"
                  }`}
                />
                {errors.facultyCode && (
                  <span className="text-red-400 text-sm mt-1 font-montserrat-light">
                    {errors.facultyCode}
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-glass cursor-pointer rounded-lg font-montserrat-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? isRegistering
                  ? "REGISTRANDO..."
                  : "INICIANDO SESIÓN..."
                : isRegistering
                ? "REGISTRARSE"
                : "INICIAR SESIÓN"}
            </button>
          </form>
        </div>

        <div className="sm:w-1/2 w-1/3 bg-login sm:block hidden">
          <div className="bg-black/55 w-full h-full flex flex-col justify-center items-center"></div>
        </div>
      </section>
    </>
  );
};

export default Login;
