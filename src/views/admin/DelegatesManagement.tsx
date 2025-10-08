import {
  useEffect,
  useState,
  type FC,
  type ReactElement,
  type FormEvent,
} from "react";
import { FirestoreService } from "../../firebase/firestore";
import Loader from "../../components/Loader";
import {
  FaSearch,
  FaClipboardList,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaClock,
  FaSortNumericDown,
  FaSortNumericUp,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSave,
  FaTimes,
  FaExclamationTriangle,
  FaHome,
} from "react-icons/fa";
import type { Delegate } from "../../interfaces/Delegate";
import { Link } from "react-router-dom";

type SortOption =
  | "newest"
  | "oldest"
  | "alphabetical"
  | "reverse-alphabetical"
  | "year-asc"
  | "year-desc";

const sortOptions: Array<{
  value: SortOption;
  label: string;
  icon: ReactElement;
}> = [
  { value: "newest", label: "Recientes", icon: <FaClock /> },
  { value: "oldest", label: "Antiguos", icon: <FaClock /> },
  { value: "alphabetical", label: "A-Z", icon: <FaSortAlphaDown /> },
  { value: "reverse-alphabetical", label: "Z-A", icon: <FaSortAlphaUp /> },
  { value: "year-asc", label: "Año ↑", icon: <FaSortNumericDown /> },
  { value: "year-desc", label: "Año ↓", icon: <FaSortNumericUp /> },
];

const initialForm: Omit<Delegate, "id"> = {
  nombre: "",
  apellido: "",
  año: 1,
  seccion: "",
  inscritoEn: "",
  estado: "",
  montoBs: 0,
  montoDolar: 0,
  tasa: 0,
};

const COLLECTIONS = [
  { value: "minurDelegates", label: "MINUR Delegados" },
  { value: "roblesmunDelegates", label: "ROBLESMUN Delegados" },
];

const DelegatesManagement: FC = () => {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [filteredDelegates, setFilteredDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Delegate, "id">>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [collection, setCollection] = useState<string>(COLLECTIONS[0].value);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchDelegates();
    // eslint-disable-next-line
  }, [collection]);

  const fetchDelegates = async () => {
    setLoading(true);
    try {
      const data = await FirestoreService.getAll<Delegate>(collection);
      setDelegates(data);
    } catch (error) {
      console.error("Error fetching delegates:", error);
      setDelegates([]);
    } finally {
      setLoading(false);
    }
  };

  const filterDelegates = (delegatesList: Delegate[], search: string) => {
    if (!search.trim()) return delegatesList;
    const searchLower = search.toLowerCase();
    return delegatesList.filter(
      (d) =>
        d.nombre.toLowerCase().includes(searchLower) ||
        d.apellido.toLowerCase().includes(searchLower) ||
        d.seccion.toLowerCase().includes(searchLower) ||
        (d.estado || "").toLowerCase().includes(searchLower) ||
        String(d.año).includes(searchLower)
    );
  };

  const sortDelegates = (delegatesList: Delegate[], option: SortOption) => {
    const sorted = [...delegatesList];
    switch (option) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.inscritoEn || "").getTime();
          const dateB = new Date(b.inscritoEn || "").getTime();
          return dateB - dateA;
        });
      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.inscritoEn || "").getTime();
          const dateB = new Date(b.inscritoEn || "").getTime();
          return dateA - dateB;
        });
      case "alphabetical":
        return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case "reverse-alphabetical":
        return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre));
      case "year-asc":
        return sorted.sort((a, b) => (a.año || 0) - (b.año || 0));
      case "year-desc":
        return sorted.sort((a, b) => (b.año || 0) - (a.año || 0));
      default:
        return sorted;
    }
  };

  useEffect(() => {
    const filtered = filterDelegates(delegates, search);
    const sorted = sortDelegates(filtered, sortOption);
    setFilteredDelegates(sorted);
  }, [delegates, search, sortOption]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "año"
          ? Number(value)
          : name === "montoBs" || name === "montoDolar" || name === "tasa"
          ? Number(value)
          : value,
    }));
  };

  const handleEdit = (delegate: Delegate) => {
    setFormData({
      nombre: delegate.nombre,
      apellido: delegate.apellido,
      año: delegate.año,
      seccion: delegate.seccion,
      inscritoEn: delegate.inscritoEn,
      estado: delegate.estado,
      montoBs: delegate.montoBs,
      montoDolar: delegate.montoDolar,
      tasa: delegate.tasa,
    });
    setEditingId(delegate.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este delegado?"
    );
    if (!confirmDelete) return;
    setLoading(true);
    try {
      await FirestoreService.delete(collection, id);
      await fetchDelegates();
    } catch (error) {
      alert("Error al eliminar delegado");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCollection = async () => {
    setIsClearing(true);
    try {
      for (const delegate of delegates) {
        if (delegate.id) {
          await FirestoreService.delete(collection, delegate.id);
        }
      }
      await fetchDelegates();
      setShowConfirmModal(false);
    } catch (error) {
      alert("Error al vaciar la colección");
      console.log(error);
    } finally {
      setIsClearing(false);
    }
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setShowForm(false);
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await FirestoreService.update(collection, editingId, formData);
      } else {
        await FirestoreService.add(collection, {
          ...formData,
          inscritoEn: formData.inscritoEn || new Date().toISOString(),
        });
      }
      resetForm();
      await fetchDelegates();
    } catch (error) {
      alert("Error al guardar delegado");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalInscritos = delegates.filter(
    (d) => d.estado && d.estado.toLowerCase() === "inscrito"
  ).length;
  const totalExonerados = delegates.filter(
    (d) => d.estado && d.estado.toLowerCase() === "exonerado"
  ).length;
  const totalBs = delegates
    .filter((d) => d.estado && d.estado.toLowerCase() === "inscrito")
    .reduce((sum, d) => sum + (d.montoBs || 0), 0);
  const totalUsd = delegates
    .filter((d) => d.estado && d.estado.toLowerCase() === "inscrito")
    .reduce((sum, d) => sum + (d.montoDolar || 0), 0);

  return (
    <div className="p-12 font-montserrat-light w-full">
      <div className="p-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div className="flex flex-col items-start">
            <h1 className="text-4xl font-montserrat-bold flex items-center gap-2">
              Delegados
            </h1>
            <Link
              to="/admin"
              className="px-6 py-2 my-4 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] hover:border-[#d53137] hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FaHome size={16} />
              Panel Admin
            </Link>
            <p className="text-gray-400 mt-2">
              Total de delegados: {delegates.length}
            </p>
          </div>

          <div className="flex-col sm:flex-row items-center gap-4">
            <label className="font-montserrat-bold text-lg text-gray-300">
              Colección:
            </label>
            <select
              aria-label="Seleccionar colección"
              value={collection}
              onChange={(e) => {
                setCollection(e.target.value);
                setShowForm(false);
                setSearch("");
              }}
              className="bg-[#181818] border border-gray-600 rounded-lg px-4 py-2 text-[#f0f0f0] focus:border-[#d53137] outline-none"
            >
              {COLLECTIONS.map((col) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowConfirmModal(true)}
              className="bg-[#d53137] text-[#f0f0f0] px-6 py-3 rounded-lg font-montserrat-bold transition-colors my-4 sm:m-8"
              disabled={delegates.length === 0}
              title="Vaciar colección"
            >
              Vaciar colección
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar delegado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none pl-10"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData(initialForm);
              }}
              className="bg-[#d53137] text-[#f0f0f0] cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#b71c1c] transition-colors"
            >
              <FaPlus />
              Nuevo Delegado
            </button>
          </div>
        </div>

        {!loading && delegates.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-gray-300 font-medium">
              Ordenar por:
            </span>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortOption(option.value)}
                  className={`px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 text-sm transition-colors ${
                    sortOption === option.value
                      ? "bg-[#d53137] text-[#f0f0f0]"
                      : "bg-glass text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-8 bg-glass p-8 rounded-lg border border-gray-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-montserrat-bold mb-6 flex items-center gap-2">
              <FaClipboardList />
              {editingId ? "Editar Delegado" : "Nuevo Delegado"}
            </h2>
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Nombre"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Apellido"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Año *
                </label>
                <input
                  type="number"
                  name="año"
                  value={formData.año}
                  onChange={handleInputChange}
                  min={1}
                  max={6}
                  required
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Año"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Sección *
                </label>
                <input
                  type="text"
                  name="seccion"
                  value={formData.seccion}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Sección"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Estado *
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Estado"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Inscrito En
                </label>
                <input
                  aria-label="Fecha de inscripción"
                  type="date"
                  name="inscritoEn"
                  value={
                    formData.inscritoEn
                      ? formData.inscritoEn.slice(0, 10)
                      : new Date().toISOString().slice(0, 10)
                  }
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      inscritoEn: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    }))
                  }
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Monto Bs
                </label>
                <input
                  type="number"
                  name="montoBs"
                  value={formData.montoBs}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Monto Bs"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Monto Dólar
                </label>
                <input
                  type="number"
                  name="montoDolar"
                  value={formData.montoDolar}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Monto Dólar"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Tasa
                </label>
                <input
                  type="number"
                  name="tasa"
                  value={formData.tasa}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                  placeholder="Tasa"
                />
              </div>
              <div className="flex-col md:col-span-2 flex gap-4 mt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#d53137] cursor-pointer text-center text-[#f0f0f0] px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <FaSave />
                  {isSubmitting
                    ? "Guardando..."
                    : editingId
                    ? "Actualizar"
                    : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-glass cursor-pointer text-[#f0f0f0] text-center px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <FaTimes />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal de confirmación */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#181818] border border-[#d53137] rounded-lg p-8 max-w-md w-full text-center shadow-lg">
              <FaExclamationTriangle className="text-5xl text-[#d53137] mx-auto mb-4" />
              <h2 className="text-2xl font-montserrat-bold mb-4 text-[#d53137]">
                ¿Vaciar colección?
              </h2>
              <p className="text-gray-300 mb-6">
                Esta acción eliminará <b>todos los delegados</b> de la colección{" "}
                <b>{COLLECTIONS.find((c) => c.value === collection)?.label}</b>
                . <br />
                Esta acción{" "}
                <span className="text-[#d53137] font-bold">
                  no se puede deshacer
                </span>
                .
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleClearCollection}
                  disabled={isClearing}
                  className="bg-[#d53137] hover:bg-red-900 text-[#f0f0f0] px-6 py-2 rounded-lg font-montserrat-bold transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isClearing ? "Eliminando..." : "Sí, vaciar"}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isClearing}
                  className="bg-glass text-[#f0f0f0] px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-montserrat-bold"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {!showForm &&
          (loading ? (
            <Loader message="Cargando delegados..." />
          ) : (
            <>
              {filteredDelegates.length > 0 ? (
                <div className="w-full overflow-x-auto pb-4">
                  <table className="min-w-max w-full bg-glass rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-[#181818] text-[#d53137] text-left">
                        <th className="py-3 px-4 font-montserrat-bold">
                          Nombre
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Apellido
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">Año</th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Sección
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Inscrito En
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Estado
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Monto Bs
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">
                          Monto $
                        </th>
                        <th className="py-3 px-4 font-montserrat-bold">Tasa</th>
                        <th className="py-3 px-4 font-montserrat-bold text-center">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDelegates.map((d, idx) => (
                        <tr
                          key={d.id || idx}
                          className="border-b border-gray-700 hover:bg-[#232323] transition-colors"
                        >
                          <td className="py-2 px-4">{d.nombre}</td>
                          <td className="py-2 px-4">{d.apellido}</td>
                          <td className="py-2 px-4">{d.año}</td>
                          <td className="py-2 px-4">{d.seccion}</td>
                          <td className="py-2 px-4">
                            {d.inscritoEn
                              ? new Date(d.inscritoEn).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-2 px-4">{d.estado}</td>
                          <td className="py-2 px-4">{d.montoBs ?? 0}</td>
                          <td className="py-2 px-4">{d.montoDolar ?? 0}</td>
                          <td className="py-2 px-4">{d.tasa}</td>
                          <td className="py-2 px-4 flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(d)}
                              className="bg-glass cursor-pointer text-[#f0f0f0] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                            >
                              <FaEdit />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(d.id!)}
                              className="bg-[#d53137] cursor-pointer text-[#f0f0f0] px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
                            >
                              <FaTrash />
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <FaClipboardList className="mx-auto text-8xl mb-6 opacity-30" />
                  <h3 className="text-2xl font-montserrat-bold mb-2">
                    No hay delegados registrados
                  </h3>
                  <p className="text-lg mb-6">
                    Cuando se registren delegados aparecerán aquí.
                  </p>
                </div>
              )}
            </>
          ))}

        {!showForm && (
          <div className="mt-8 p-4 bg-glass rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-montserrat-bold text-[#f0f0f0]">
                  {delegates.length}
                </div>
                <div className="text-sm text-gray-400">Total Delegados</div>
              </div>
              <div>
                <div className="text-2xl font-montserrat-bold text-blue-400">
                  {filteredDelegates.length}
                </div>
                <div className="text-sm text-gray-400">Mostrando</div>
              </div>
              <div>
                <div className="text-2xl font-montserrat-bold text-green-400">
                  {totalInscritos}
                </div>
                <div className="text-sm text-gray-400">Inscritos</div>
              </div>
              <div>
                <div className="text-2xl font-montserrat-bold text-yellow-400">
                  {totalExonerados}
                </div>
                <div className="text-sm text-gray-400">Exonerados</div>
              </div>
              <div>
                <div className="text-lg font-montserrat-bold text-[#d53137]">
                  Bs{" "}
                  {totalBs.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}
                  <br />
                  <span className="text-green-400">
                    $
                    {totalUsd.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="text-sm text-gray-400">Total Recaudado</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DelegatesManagement;
