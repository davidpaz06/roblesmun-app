import {
  useState,
  useEffect,
  type FC,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { PressItem } from "../../interfaces/PressItem";
import type { PressSection } from "../../interfaces/PressSection";
import {
  FaTrash,
  FaEdit,
  FaImage,
  FaSave,
  FaTimes,
  FaSortAlphaDown,
  FaSortAlphaUp,
  FaClock,
  FaHome,
  FaVideo,
  FaPlay,
  FaFolder,
} from "react-icons/fa";
import Loader from "../../components/Loader";
import { FirestoreService } from "../../firebase/firestore";
import { SupabaseStorage } from "../../supabase/storage";
import { Link } from "react-router-dom";
import { type ReactElement } from "react";
import { formatToBucket } from "../../utils/formatToBucket";

type SortOption = "newest" | "oldest" | "alphabetical" | "reverse-alphabetical";

const PressManagement: FC = () => {
  const [pressItems, setPressItems] = useState<PressItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PressItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [showSectionManager, setShowSectionManager] = useState<boolean>(false);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [sections, setSections] = useState<PressSection[]>([]);

  const [formData, setFormData] = useState<PressItem>({
    edition: "XVII",
    type: "photo",
    url: "",
    title: "",
    section: "",
  });

  const fetchPressItems = async () => {
    setIsLoading(true);
    try {
      const data = await FirestoreService.getAll<PressItem>("press");
      setPressItems(data.length > 0 ? data : []);
    } catch (error) {
      console.error("Error fetching press items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const data = await FirestoreService.getAll<PressSection>("pressSections");
      setSections(data);
      console.log("✅ Secciones cargadas desde Firestore:", data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    }
  };

  const sortItems = (
    itemsList: PressItem[],
    option: SortOption
  ): PressItem[] => {
    const sorted = [...itemsList];

    switch (option) {
      case "newest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || "");
          const dateB = new Date(b.createdAt || "");
          return dateB.getTime() - dateA.getTime();
        });

      case "oldest":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt || "");
          const dateB = new Date(b.createdAt || "");
          return dateA.getTime() - dateB.getTime();
        });

      case "alphabetical":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));

      case "reverse-alphabetical":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));

      default:
        return sorted;
    }
  };

  const filterItems = (itemsList: PressItem[], search: string): PressItem[] => {
    if (!search.trim()) return itemsList;

    const searchLower = search.toLowerCase();
    return itemsList.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.section.toLowerCase().includes(searchLower) ||
        item.edition.toLowerCase().includes(searchLower)
    );
  };

  useEffect(() => {
    const filtered = filterItems(pressItems, searchTerm);
    const sorted = sortItems(filtered, sortOption);
    setFilteredItems(sorted);
  }, [pressItems, sortOption, searchTerm]);

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  const handleMediaChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Por favor selecciona un archivo de imagen o video válido");
      return;
    }

    if (isImage && file.size > 10 * 1024 * 1024) {
      alert("La imagen no debe superar los 10MB");
      return;
    }

    if (isVideo && file.size > 100 * 1024 * 1024) {
      alert("El video no debe superar los 100MB");
      return;
    }

    setMediaFile(file);
    setFormData((prev) => ({ ...prev, type: isImage ? "photo" : "video" }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      edition: "XVII",
      type: "photo",
      url: "",
      title: "",
      section: "",
    });
    setMediaFile(null);
    setMediaPreview("");
    setEditingId(null);
    setShowForm(false);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let mediaUrl = formData.url;

      if (mediaFile) {
        try {
          setUploadProgress(30);

          const sectionBucket = formatToBucket(formData.section);

          if (formData.type === "photo") {
            mediaUrl = await SupabaseStorage.uploadPressImage(
              mediaFile,
              sectionBucket
            );
          } else {
            mediaUrl = await SupabaseStorage.uploadPressVideo(
              mediaFile,
              sectionBucket
            );
          }

          setUploadProgress(100);
          console.log("✅ Archivo subido:", mediaUrl);
        } catch (uploadError) {
          console.error("❌ Error subiendo archivo:", uploadError);
          alert("Error subiendo el archivo.");
          setUploadProgress(0);
          return;
        }
      }

      const sectionBucket = formatToBucket(formData.section);

      const pressData: PressItem = {
        edition: formData.edition,
        type: formData.type,
        url: mediaUrl,
        title: formData.title,
        section: formData.section,
        sectionBucket: sectionBucket, // ✅ Guardar bucket formateado
      };

      if (editingId) {
        const currentItem = pressItems.find((item) => item.id === editingId);
        if (currentItem?.url && mediaFile && currentItem.url !== mediaUrl) {
          try {
            await SupabaseStorage.deletePressFile(currentItem.url);
            console.log("✅ Archivo anterior eliminado");
          } catch (deleteError) {
            console.warn(
              "⚠️ No se pudo eliminar el archivo anterior:",
              deleteError
            );
          }
        }

        await FirestoreService.update("press", editingId, pressData);
        alert("Elemento actualizado exitosamente");
      } else {
        await FirestoreService.add("press", {
          ...pressData,
          createdAt: new Date().toISOString(),
        });
        alert("Elemento agregado exitosamente");
      }

      resetForm();
      await fetchPressItems();
    } catch (error) {
      console.error("Error al guardar elemento:", error);
      alert("Error al guardar elemento: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };
  const handleEdit = (item: PressItem) => {
    setFormData({
      edition: item.edition,
      type: item.type,
      url: item.url,
      title: item.title,
      section: item.section,
    });
    setMediaPreview(item.url);
    setEditingId(item.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!id) {
      console.error("Invalid press item ID");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar este elemento? Esta acción eliminará también el archivo."
    );
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      const item = pressItems.find((p) => p.id === id);
      if (item?.url) {
        try {
          await SupabaseStorage.deletePressFile(item.url);
          console.log("✅ Archivo eliminado de Storage");
        } catch (deleteError) {
          console.warn("⚠️ No se pudo eliminar el archivo:", deleteError);
        }
      }

      await FirestoreService.delete("press", id);
      alert("Elemento eliminado exitosamente");
      await fetchPressItems();
    } catch (error) {
      console.error("Error al eliminar elemento:", error);
      alert("Error al eliminar elemento: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      alert("Ingresa un nombre válido para la sección");
      return;
    }

    const bucketName = formatToBucket(newSectionName);
    try {
      const sectionExists = sections.some(
        (s) => s.bucket.toLowerCase() === bucketName.toLowerCase()
      );

      if (sectionExists) {
        alert("Esta sección ya existe");
        return;
      }

      const sectionData: PressSection = {
        name: newSectionName.trim(),
        bucket: bucketName,
        createdAt: new Date().toISOString(),
      };

      await FirestoreService.add("pressSections", sectionData);

      console.log(
        `✅ Sección guardada en Firestore: "${newSectionName}" → Bucket: "${bucketName}"`
      );

      alert(
        `Sección "${newSectionName}" creada exitosamente.\nBucket: ${bucketName}`
      );

      setNewSectionName("");
      setShowSectionManager(false);

      await fetchSections();
    } catch (error) {
      console.error("Error creando sección:", error);
      alert("Error al crear la sección: " + (error as Error).message);
    }
  };

  const handleDeleteSection = async (sectionName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la sección "${sectionName}"? Esta acción no eliminará los archivos asociados.`
    );
    if (!confirmDelete) return;

    try {
      const sectionToDelete = sections.find((s) => s.name === sectionName);

      if (!sectionToDelete || !sectionToDelete.id) {
        alert("Sección no encontrada.");
        return;
      }
      await FirestoreService.delete("pressSections", sectionToDelete.id);
      alert(`Sección "${sectionName}" eliminada exitosamente.`);
      await fetchSections();
    } catch (error) {
      console.error("Error al eliminar sección:", error);
      alert("Error al eliminar la sección: " + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchPressItems();
    fetchSections();
  }, []);

  const sortOptions: Array<{
    value: SortOption;
    label: string;
    icon: ReactElement;
  }> = [
    { value: "newest", label: "Recientes", icon: <FaClock /> },
    { value: "oldest", label: "Antiguos", icon: <FaClock /> },
    { value: "alphabetical", label: "A-Z", icon: <FaSortAlphaDown /> },
    { value: "reverse-alphabetical", label: "Z-A", icon: <FaSortAlphaUp /> },
  ];

  const availableSections = Array.from(
    new Set([
      ...sections.map((s) => s.name),
      ...pressItems.map((item) => item.section),
    ])
  ).sort();

  return (
    <div className="p-12 font-montserrat-light w-full">
      <div className="p-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <div className="flex flex-col items-start">
            <h1 className="text-4xl font-montserrat-bold">Prensa</h1>
            <Link
              to="/admin"
              className="px-6 py-2 my-4 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] hover:border-[#d53137] hover:bg-gray-700 transition-colors flex items-center gap-2 font-medium"
            >
              <FaHome size={16} />
              Panel Admin
            </Link>
            <p className="text-gray-400">
              Total de archivos: {pressItems.length}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
            />
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#d53137] text-white cursor-pointer px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#b71c1c] transition-colors"
            >
              {showForm ? "Cancelar" : "Nuevo Archivo"}
            </button>
          </div>
        </div>

        {!isLoading && (
          <div className="mb-8 bg-glass p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-montserrat-bold flex items-center gap-2">
                <FaFolder className="text-[#d53137]" />
                Secciones ({availableSections.length})
              </h2>
              <button
                onClick={() => setShowSectionManager(!showSectionManager)}
                className="bg-[#d53137] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-[#b71c1c] transition-colors flex items-center gap-2"
              >
                {showSectionManager ? "Cancelar" : "Nueva Sección"}
              </button>
            </div>

            {showSectionManager && (
              <div className="mb-4 p-4 bg-[#101010] rounded-lg">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Nombre de la nueva sección
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    placeholder="Ej: Inauguración, Clausura, Sesiones..."
                    className="flex-1 p-3 bg-glass border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateSection();
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateSection}
                    className="bg-[#d53137] cursor-pointer text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </div>
            )}

            {availableSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableSections.map((section) => {
                  const itemsInSection = pressItems.filter(
                    (item) => item.section === section
                  );
                  const photosCount = itemsInSection.filter(
                    (i) => i.type === "photo"
                  ).length;
                  const videosCount = itemsInSection.filter(
                    (i) => i.type === "video"
                  ).length;

                  const sampleItem = itemsInSection[0];
                  const bucketName =
                    sampleItem?.sectionBucket || formatToBucket(section);

                  return (
                    <div
                      key={section}
                      className="p-4 bg-[#101010] rounded-lg border border-gray-600 hover:border-[#d53137] transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FaFolder className="text-[#d53137]" />
                          <h3 className="font-montserrat-bold text-sm">
                            {section}
                          </h3>
                        </div>
                        <button
                          onClick={() => handleDeleteSection(section)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Eliminar sección"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <p>
                          Total: {itemsInSection.length} archivo
                          {itemsInSection.length !== 1 ? "s" : ""}
                        </p>
                        <p>
                          {photosCount} foto{photosCount !== 1 ? "s" : ""} •{" "}
                          {videosCount} video{videosCount !== 1 ? "s" : ""}
                        </p>
                        <p className="text-gray-300">
                          Bucket:{" "}
                          <span className="font-montserrat-bold">
                            {bucketName}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <FaFolder className="mx-auto text-4xl mb-2 opacity-30" />
                <p className="text-sm">
                  No hay secciones creadas. Agrega archivos para crear secciones
                  automáticamente.
                </p>
              </div>
            )}
          </div>
        )}

        {!isLoading && pressItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-sm text-gray-300 font-medium">
              Ordenar por:
            </span>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className={`px-4 py-2 cursor-pointer rounded-lg flex items-center gap-2 text-sm transition-colors ${
                    sortOption === option.value
                      ? "bg-[#d53137] text-white"
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
          <form
            onSubmit={handleSubmit}
            className="bg-glass p-6 rounded-lg mb-8"
          >
            <h2 className="text-2xl font-montserrat-bold mb-6">
              {editingId ? "Editar Archivo" : "Nuevo Archivo"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Título *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                    placeholder="Ej: Inauguración del evento"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Edición *
                  </label>
                  <input
                    type="text"
                    name="edition"
                    value={formData.edition}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                    placeholder="Ej: XVII"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Sección *
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    list="sections"
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none"
                    placeholder="Ej: Inauguración"
                  />
                  <datalist id="sections">
                    {availableSections.map((section) => (
                      <option key={section} value={section} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-400 mt-1">
                    Escribe una nueva sección o selecciona una existente
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Tipo
                  </label>
                  <select
                    aria-label="Tipo"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    disabled={!!mediaFile}
                    className="w-full p-3 bg-[#101010] border border-gray-600 rounded-lg text-[#f0f0f0] focus:border-[#d53137] outline-none disabled:opacity-50"
                  >
                    <option value="photo">Foto</option>
                    <option value="video">Video</option>
                  </select>
                  {mediaFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Tipo detectado automáticamente al seleccionar archivo
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Archivo (Foto o Video) *
                  </label>

                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-[#d53137] transition-colors">
                    {mediaPreview ? (
                      <div className="space-y-4">
                        {formData.type === "photo" ? (
                          <img
                            src={mediaPreview}
                            alt="Preview"
                            className="mx-auto max-h-48 max-w-full object-contain rounded-lg"
                          />
                        ) : (
                          <div className="relative">
                            <video
                              src={mediaPreview}
                              className="mx-auto max-h-48 max-w-full rounded-lg"
                              controls
                            />
                            <FaPlay className="absolute inset-0 m-auto text-white text-4xl opacity-70 pointer-events-none" />
                          </div>
                        )}
                        <div className="flex gap-2 justify-center">
                          <label className="bg-[#d53137] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#b71c1c] transition-colors flex items-center gap-2">
                            {formData.type === "photo" ? (
                              <FaImage />
                            ) : (
                              <FaVideo />
                            )}
                            Cambiar archivo
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleMediaChange}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMediaPreview("");
                              setMediaFile(null);
                            }}
                            className="bg-glass text-[#f0f0f0] px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <FaTimes />
                            Quitar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.type === "photo" ? (
                          <FaImage className="mx-auto text-6xl text-gray-400" />
                        ) : (
                          <FaVideo className="mx-auto text-6xl text-gray-400" />
                        )}
                        <div>
                          <label className="bg-[#d53137] text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-[#b71c1c] transition-colors inline-flex items-center gap-2">
                            {formData.type === "photo" ? (
                              <FaImage />
                            ) : (
                              <FaVideo />
                            )}
                            Seleccionar archivo
                            <input
                              type="file"
                              accept="image/*,video/*"
                              onChange={handleMediaChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <p className="text-sm text-gray-400">
                          Imágenes: Máximo 10MB • JPG, PNG, GIF, WebP
                          <br />
                          Videos: Máximo 100MB • MP4, WebM
                        </p>
                      </div>
                    )}
                  </div>

                  {mediaFile && (
                    <p className="text-sm text-gray-400 mt-2">
                      Archivo seleccionado: {mediaFile.name} (
                      {Math.round(mediaFile.size / 1024 / 1024)} MB)
                    </p>
                  )}

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="mt-2">
                      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#d53137] h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 text-center">
                        Subiendo... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-600">
              <button
                type="submit"
                disabled={isSubmitting || !mediaFile}
                className="bg-[#d53137] cursor-pointer text-white px-8 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                className="bg-glass text-[#f0f0f0] px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Cancelar
              </button>
            </div>
          </form>
        )}

        {isLoading && <Loader message="Cargando archivos..." />}

        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-glass rounded-lg border border-gray-700 hover:border-[#d53137] transition-all duration-300"
              >
                <div className="w-full h-48 flex items-center justify-center mb-4 bg-[#101010] rounded overflow-hidden">
                  {item.type === "photo" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="max-w-full max-h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA9TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI26TDEyIDJaIiBmaWxsPSIjNjY2Ii8+Cjwvc3ZnPgo=";
                      }}
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <FaPlay className="text-white text-4xl opacity-70" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-montserrat-bold line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span className="bg-[#d53137] px-2 py-1 rounded">
                      {item.edition}
                    </span>
                    <span className="bg-blue-600 px-2 py-1 rounded">
                      {item.section}
                    </span>
                    <span className="bg-gray-700 px-2 py-1 rounded">
                      {item.type === "photo" ? "Foto" : "Video"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-600">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-glass cursor-pointer text-white px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FaEdit />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className="flex-1 bg-[#d53137] cursor-pointer text-white px-3 py-2 rounded flex items-center justify-center gap-2 hover:bg-red-700 transition-colors text-sm"
                  >
                    <FaTrash />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* {!isLoading && pressItems.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FaImage className="mx-auto text-8xl mb-6 opacity-30" />
            <h3 className="text-2xl font-montserrat-bold mb-2">
              No hay archivos registrados
            </h3>
            <p className="text-lg mb-6">
              Haz clic en "Nuevo Archivo" para agregar el primero
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d53137] text-white px-8 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors inline-flex items-center gap-2"
            >
              <FaPlus />
              Agregar Archivo
            </button>
          </div>
        )} */}

        {!isLoading && pressItems.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <FaImage className="mx-auto text-8xl mb-6 opacity-30" />
            <h3 className="text-2xl font-montserrat-bold mb-2">
              No se encontraron archivos
            </h3>
            <p className="text-lg mb-4">
              Intenta ajustar los términos de búsqueda
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-[#d53137] text-white px-6 py-3 rounded-lg hover:bg-[#b71c1c] transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-glass rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-montserrat-bold text-[#f0f0f0]">
                {pressItems.length}
              </div>
              <div className="text-sm text-gray-400">Total Archivos</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat-bold text-blue-400">
                {pressItems.filter((i) => i.type === "photo").length}
              </div>
              <div className="text-sm text-gray-400">Fotos</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat-bold text-purple-400">
                {pressItems.filter((i) => i.type === "video").length}
              </div>
              <div className="text-sm text-gray-400">Videos</div>
            </div>
            <div>
              <div className="text-2xl font-montserrat-bold text-green-400">
                {availableSections.length}
              </div>
              <div className="text-sm text-gray-400">Secciones</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PressManagement;
