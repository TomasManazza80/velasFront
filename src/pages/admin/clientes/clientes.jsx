import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiPlus,
  FiCheck,
  FiUserPlus,
  FiList,
  FiPhone,
  FiMapPin,
  FiActivity,
  FiUser,
  FiCreditCard,
  FiX,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiImage,
  FiSend,
  FiSearch,
} from "react-icons/fi";
import { IKContext, IKUpload } from "imagekitio-react";
const API_URL = import.meta.env.VITE_API_URL;
/* --- CONFIGURACIÓN DE ESTILOS SAAS --- */
const STYLES = {
  title: "font-bold text-gray-900",
  label: "text-xs font-medium text-gray-700 mb-2 block",
  tech: "", 
  input:
    "w-full bg-white border border-gray-200 rounded-xl p-2.5 px-4 text-sm text-gray-900 focus:border-[#0A58CA] focus:ring-1 focus:ring-[#0A58CA] outline-none transition-all placeholder:text-gray-400",
  glass: "bg-white border border-gray-100 rounded-2xl shadow-sm",
  buttonPrimary:
    "bg-[#0A58CA] text-white font-medium text-sm rounded-xl py-3 px-6 hover:bg-[#084298] transition-all shadow-sm",
  buttonSecondary:
    "bg-white border border-gray-200 text-gray-600 font-medium text-sm rounded-xl py-3 px-6 hover:bg-gray-50 transition-all",
  tabActive:
    "text-[#0A58CA] border-[#0A58CA] bg-[#F8FAFC]",
  tabInactive:
    "text-gray-500 border-transparent hover:text-gray-900 hover:bg-gray-50",
};
const initialClientState = { nombre: "", telefono: "", dni: "", direccion: "" };
/* --- COMPONENTE: FORMULARIO DE CLIENTES --- */
const RegistroClienteContent = ({
  fetchClients,
  editingClient,
  setEditingClient,
}) => {
  const [cliente, setCliente] = useState(initialClientState);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });
  useEffect(() => {
    if (editingClient) {
      setCliente(editingClient);
    } else {
      setCliente(initialClientState);
    }
  }, [editingClient]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };
  const handleGuardarCliente = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (cliente.id) {
        await axios.put(`${API_URL}/clientes/${cliente.id}`, cliente);
        setNotification({
          show: true,
          type: "success",
          message: "CLIENTE ACTUALIZADO CORRECTAMENTE",
        });
      } else {
        await axios.post(`${API_URL}/clientes`, cliente);
        setNotification({
          show: true,
          type: "success",
          message: "CLIENTE INGRESADO AL SISTEMA",
        });
      }
      setCliente(initialClientState);
      if (setEditingClient) setEditingClient(null);
      if (fetchClients) fetchClients();
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "ERROR AL REGISTRAR CLIENTE";
      setNotification({
        show: true,
        type: "error",
        message: String(errorMsg).toUpperCase(),
      });
    } finally {
      setLoading(false);
      setTimeout(
        () => setNotification((prev) => ({ ...prev, show: false })),
        3000,
      );
    }
  };
  return (
    <div className={`${STYLES.glass} overflow-hidden relative`}>
      {" "}
      {/* --- NOTIFICACIÓN (OVERLAY) --- */}{" "}
      {notification.show && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
          {" "}
          <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center mb-6 shadow-sm animate-in zoom-in duration-500 bg-white ${notification.type === "success" ? "border-green-200" : "border-red-200"}`}>
            {" "}
            {notification.type === "success" ? (
              <FiCheck size={48} className="text-green-500 animate-bounce" />
            ) : (
              <FiX size={48} className="text-red-500 animate-pulse" />
            )}{" "}
          </div>{" "}
          <h3
            className={`font-bold text-2xl mb-2 text-center animate-in slide-in-from-bottom-4 duration-500 delay-100 ${notification.type === "success" ? "text-gray-900" : "text-gray-900"}`}
          >
            {" "}
            {notification.type === "success"
              ? "Registro Completado"
              : "Error en el Registro"}{" "}
          </h3>{" "}
          <p
            className="text-gray-500 text-sm font-medium animate-in slide-in-from-bottom-4 duration-500 delay-200"
          >
            {" "}
            {notification.message}{" "}
          </p>{" "}
        </div>
      )}{" "}
      {/* Cabecera Interna */}{" "}
      <div className="px-8 py-6 border-b border-gray-100 bg-[#F8FAFC]">
        {" "}
        <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
          {" "}
          <FiUserPlus className="text-[#0A58CA]" size={20} />{" "}
          {editingClient
            ? "Editar Cliente Existente"
            : "Registro de Nuevo Cliente"}{" "}
        </h2>{" "}
      </div>{" "}
      <div className="p-4 md:p-10">
        {" "}
        <form onSubmit={handleGuardarCliente} className="space-y-10">
          {" "}
          {/* I. Datos Personales */}{" "}
          <section>
            {" "}
            <h3
              className="text-sm text-gray-900 font-semibold mb-6 flex items-center gap-2"
            >
              {" "}
              <FiActivity size={16} className="text-[#0A58CA]" /> 01 Datos Personales{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {" "}
              <div>
                {" "}
                <label className={STYLES.label}>Nombre Completo</label>{" "}
                <div className="relative">
                  {" "}
                  <FiUser
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="text"
                    name="nombre"
                    value={cliente.nombre}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="Ej: Juan Perez"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className={STYLES.label}>
                  DNI / Identificación
                </label>{" "}
                <div className="relative">
                  {" "}
                  <FiCreditCard
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="text"
                    name="dni"
                    value={cliente.dni}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    placeholder="00.000.000"
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
          {/* II. Contacto y Ubicación */}{" "}
          <section>
            {" "}
            <h3
              className="text-sm text-gray-900 font-semibold mb-6 flex items-center gap-2"
            >
              {" "}
              <FiPhone size={16} className="text-[#0A58CA]" /> 02 Contacto y Ubicación{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {" "}
              <div>
                {" "}
                <label className={STYLES.label}>
                  Teléfono de Contacto
                </label>{" "}
                <div className="relative">
                  {" "}
                  <FiPhone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="text"
                    name="telefono"
                    value={cliente.telefono}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="+54 9..."
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div>
                {" "}
                <label className={STYLES.label}>
                  Dirección de Domicilio
                </label>{" "}
                <div className="relative">
                  {" "}
                  <FiMapPin
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="text"
                    name="direccion"
                    value={cliente.direccion}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    placeholder="Calle 123"
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
          {/* Botones */}{" "}
          <div className="flex flex-col md:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
            {" "}
            <button
              type="button"
              onClick={() => {
                setCliente(initialClientState);
                if (setEditingClient) setEditingClient(null);
              }}
              className={STYLES.buttonSecondary}
            >
              {" "}
              {editingClient ? "Cancelar Edición" : "Limpiar Formulario"}{" "}
            </button>{" "}
            <button
              type="submit"
              disabled={loading}
              className={`${STYLES.buttonPrimary} flex items-center justify-center gap-2 disabled:opacity-70`}
            >
              {" "}
              {loading ? (
                <FiActivity className="animate-spin" />
              ) : (
                <FiCheck size={18} />
              )}{" "}
              {loading
                ? "Procesando..."
                : editingClient
                  ? "Actualizar Datos"
                  : "Guardar Cliente"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
/* --- COMPONENTE: LISTA DE CLIENTES --- */
const ListaClientes = ({ clientes, onEdit, fetchClients }) => {
  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Confirma eliminar este cliente? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        await axios.delete(`${API_URL}/clientes/${id}`);
        if (fetchClients) fetchClients();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar cliente");
      }
    }
  };
  return (
    <div className={`${STYLES.glass} p-6 md:p-8`}>
      {" "}
      <div className="mb-6 border-b border-gray-100 pb-4">
        {" "}
        <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
          {" "}
          <FiList className="text-[#0A58CA]" size={20} /> Registro Histórico de Clientes{" "}
        </h2>{" "}
      </div>{" "}
      <div className="overflow-x-auto custom-scrollbar">
        {" "}
        <table className="w-full text-left border-collapse">
          {" "}
          <thead>
            {" "}
            <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase font-bold bg-gray-50">
              {" "}
              <th className="py-4 px-4 rounded-tl-xl">ID</th>{" "}
              <th className="py-4 px-4">Nombre</th>{" "}
              <th className="py-4 px-4">DNI</th>{" "}
              <th className="py-4 px-4">Teléfono</th>{" "}
              <th className="py-4 px-4">Dirección</th>{" "}
              <th className="py-4 px-4 text-right rounded-tr-xl">Acciones</th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody className="text-sm">
            {" "}
            {clientes.length > 0 ? (
              clientes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                >
                  {" "}
                  <td className="py-4 px-4 text-gray-500 text-xs">
                    #{c.id}
                  </td>{" "}
                  <td className="py-4 px-4 text-gray-900 font-bold capitalize">
                    {c.nombre}
                  </td>{" "}
                  <td className="py-4 px-4 text-gray-600 text-xs">
                    {c.dni || "-"}
                  </td>{" "}
                  <td className="py-4 px-4 text-gray-600 text-xs">
                    {c.telefono || "-"}
                  </td>{" "}
                  <td className="py-4 px-4 text-gray-600 text-xs">
                    {c.direccion || "-"}
                  </td>{" "}
                  <td className="py-4 px-4 text-right">
                    {" "}
                    <div className="flex items-center justify-end gap-2">
                      {" "}
                      <button
                        onClick={() => onEdit(c)}
                        className="p-2 text-gray-400 hover:text-[#0A58CA] hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar cliente"
                      >
                        {" "}
                        <FiEdit size={18} />{" "}
                      </button>{" "}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Eliminar cliente"
                      >
                        {" "}
                        <FiTrash2 size={18} />{" "}
                      </button>{" "}
                    </div>{" "}
                  </td>{" "}
                </tr>
              ))
            ) : (
              <tr>
                {" "}
                <td
                  colSpan="6"
                  className="py-12 text-center text-gray-500 font-medium"
                >
                  No hay datos registrados{" "}
                </td>{" "}
              </tr>
            )}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>{" "}
    </div>
  );
};
/* --- COMPONENTE: MARKETING WHATSAPP --- */
const MarketingTab = ({ clientes }) => {
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingAll, setSendingAll] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const authenticator = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/imagekit`);
      if (!response.ok) throw new Error("Auth failed");
      return await response.json();
    } catch (error) {
      console.error(error);
      alert("ERROR DE AUTENTICACIÓN IMAGEKIT");
    }
  };
  const handleSendWhatsApp = async (phone, name) => {
    if (!message) return alert("REDACTE UN MENSAJE");
    let finalMessage = `Hola ${name}! ${message}`;
    if (imageUrl) {
      finalMessage += `\n\nVer imagen: ${imageUrl}`;
    }
    try {
      const res = await axios.post(`${API_URL}/qr/send-message`, {
        phone: phone,
        message: finalMessage,
      });
      if (res.data.success) {
        console.log(`Mensaje enviado a ${name}`);
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert("ERROR AL ENVIAR MENSAJE. VERIFIQUE QUE WHATSAPP ESTÉ CONECTADO.");
      const encodedMessage = encodeURIComponent(finalMessage);
      const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodedMessage}`;
      window.open(whatsappUrl, "_blank");
    }
  };
  const handleSendAll = async () => {
    if (!message) return alert("REDACTE UN MENSAJE PARA LA CAMPAÑA");
    if (filteredClientes.length === 0)
      return alert("NO HAY CLIENTES EN LA LISTA FILTRADA");
    const confirmMsg = `¿ESTÁ SEGURO DE ENVIAR ESTE MENSAJE A LOS ${filteredClientes.length} CLIENTES FILTRADOS?`;
    if (!window.confirm(confirmMsg)) return;
    setSendingAll(true);
    setProgress({ current: 0, total: filteredClientes.length });
    for (let i = 0; i < filteredClientes.length; i++) {
      const client = filteredClientes[i];
      setProgress((prev) => ({ ...prev, current: i + 1 }));
      let finalMessage = `Hola ${client.nombre}! ${message}`;
      if (imageUrl) {
        finalMessage += `\n\nVer imagen: ${imageUrl}`;
      }
      try {
        await axios.post(`${API_URL}/qr/send-message`, {
          phone: client.telefono,
          message: finalMessage,
        });
        console.log(`Mensaje masivo enviado a ${client.nombre}`);
      } catch (error) {
        console.error(`Error en envío masivo a ${client.nombre}:`, error);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    setSendingAll(false);
    alert("CAMPAÑA FINALIZADA");
  };
  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono?.includes(searchTerm),
  );
  return (
    <IKContext
      publicKey={import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY}
      urlEndpoint={import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT}
      authenticator={authenticator}
    >
      {" "}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {" "}
        {/* Panel de Redacción */}{" "}
        <div className={`${STYLES.glass} p-6 md:p-8 space-y-8`}>
          {" "}
          <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
            {" "}
            <FiMessageSquare className="text-[#0A58CA]" size={20} /> Configuración de Campaña{" "}
          </h2>{" "}
          <div className="space-y-6">
            {" "}
            <div>
              {" "}
              <label className={STYLES.label}>Mensaje Publicitario</label>{" "}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`${STYLES.input} min-h-[150px] resize-none`}
                placeholder="Escriba el mensaje aquí... (El nombre del cliente se agregará automáticamente)"
              />{" "}
            </div>{" "}
            <div>
              {" "}
              <label className={STYLES.label}>
                Imagen Adjunta (Opcional)
              </label>{" "}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                {" "}
                {imageUrl ? (
                  <div className="relative group overflow-hidden border border-gray-200 rounded-xl shadow-sm">
                    {" "}
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-40 transition-all duration-500"
                    />{" "}
                    <button
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur p-2 text-gray-500 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                      {" "}
                      <FiTrash2 size={16} />{" "}
                    </button>{" "}
                  </div>
                ) : (
                  <>
                    {" "}
                    <FiImage className="text-gray-400" size={32} />{" "}
                    <IKUpload
                      fileName="marketing_promo"
                      useUniqueFileName={true}
                      folder="/marketing"
                      onUploadStart={() => setUploading(true)}
                      onSuccess={(res) => {
                        setImageUrl(res.url);
                        setUploading(false);
                      }}
                      onError={() => {
                        alert("Error al subir imagen");
                        setUploading(false);
                      }}
                      className="hidden"
                      id="file-upload"
                    />{" "}
                    <label
                      htmlFor="file-upload"
                      className="text-sm cursor-pointer text-[#0A58CA] font-medium hover:text-[#084298] transition-colors py-2 px-4 bg-white border border-blue-100 rounded-lg shadow-sm"
                    >
                      {" "}
                      {uploading ? "Subiendo..." : "Seleccionar Imagen"}{" "}
                    </label>{" "}
                  </>
                )}{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          {/* Botón de Envío Masivo */}{" "}
          <div className="pt-6 border-t border-gray-100">
            {" "}
            <button
              onClick={handleSendAll}
              disabled={sendingAll || !message || filteredClientes.length === 0}
              className={`w-full ${STYLES.buttonPrimary} flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {" "}
              {sendingAll ? (
                <FiActivity className="animate-spin" />
              ) : (
                <FiSend />
              )}{" "}
              {sendingAll
                ? `Enviando Campaña [${progress.current}/${progress.total}]`
                : `Enviar a Todos (${filteredClientes.length} Clientes)`}{" "}
            </button>{" "}
            {sendingAll && (
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                {" "}
                <div
                  className="bg-[#0A58CA] h-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                ></div>{" "}
              </div>
            )}{" "}
          </div>{" "}
        </div>{" "}
        {/* Lista de Envío */}{" "}
        <div className={`${STYLES.glass} p-6 md:p-8 flex flex-col h-full`}>
          {" "}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {" "}
            <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
              {" "}
              <FiSend className="text-[#0A58CA]" size={20} /> Listado de Envío{" "}
            </h2>{" "}
            <div className="relative w-full md:w-48">
              {" "}
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />{" "}
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cliente..."
                className={`${STYLES.input} py-2 pl-9`}
              />{" "}
            </div>{" "}
          </div>{" "}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
            {" "}
            {filteredClientes.length > 0 ? (
              <div className="space-y-3">
                {" "}
                {filteredClientes.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all group"
                  >
                    {" "}
                    <div>
                      {" "}
                      <p className="text-sm font-bold text-gray-900 capitalize">
                        {c.nombre}
                      </p>{" "}
                      <p className="text-xs text-gray-500 mt-1">
                        {c.telefono}
                      </p>{" "}
                    </div>{" "}
                    <button
                      onClick={() => handleSendWhatsApp(c.telefono, c.nombre)}
                      className="p-2.5 bg-[#F8FAFC] text-[#0A58CA] border border-blue-50 rounded-lg hover:bg-[#0A58CA] hover:text-white transition-all shadow-sm"
                      title="Enviar vía WhatsApp"
                    >
                      {" "}
                      <FiSend size={16} />{" "}
                    </button>{" "}
                  </div>
                ))}{" "}
              </div>
            ) : (
              <p className="text-center py-12 text-gray-500 font-medium">
                No se encontraron resultados
              </p>
            )}{" "}
          </div>{" "}
          <div className="mt-6 pt-6 border-t border-gray-100">
            {" "}
            <p className="text-xs text-gray-500 font-medium italic">
              {" "}
              * El envío se realiza individualmente para cumplir con las políticas de WhatsApp y evitar bloqueos de cuenta.{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </IKContext>
  );
};
/* --- COMPONENTE PRINCIPAL --- */
const ModuloClientes = () => {
  const [activeTab, setActiveTab] = useState("registro");
  const [clientes, setClientes] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const handleEdit = (client) => {
    setEditingClient(client);
    setActiveTab("registro");
  };
  const fetchClients = async () => {
    setLoadingList(true);
    try {
      const res = await axios.get(`${API_URL}/clientes`);
      setClientes(res.data);
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      setLoadingList(false);
    }
  };
  useEffect(() => {
    if (activeTab === "lista" || activeTab === "marketing") {
      fetchClients();
    }
  }, [activeTab]);
  return (
    <div className="min-h-screen bg-[#F4F7FE] text-gray-900 p-4 md:p-12 font-['Inter'] selection:bg-[#0A58CA] selection:text-white max-w-7xl mx-auto">
      {" "}
      {/* Header Fedecell */}{" "}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Módulo de Clientes
          </h1>{" "}
          <p
            className="font-medium text-xs text-gray-500 mt-2"
          >
            Gestión de clientes y marketing
          </p>{" "}
        </div>{" "}
        <div className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-[#0A58CA] uppercase shadow-sm flex items-center gap-2">
          {" "}
          <FiActivity size={14} /> Base de Datos Activa{" "}
        </div>{" "}
      </div>{" "}
      {/* Tabs Premium */}{" "}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar bg-white rounded-t-2xl px-2 pt-2">
        {" "}
        <button
          className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === "registro" ? STYLES.tabActive : STYLES.tabInactive}`}
          onClick={() => {
            setActiveTab("registro");
            setEditingClient(null);
          }}
        >
          {" "}
          <FiPlus size={16} /> Registrar Cliente{" "}
        </button>{" "}
        <button
          className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === "lista" ? STYLES.tabActive : STYLES.tabInactive}`}
          onClick={() => setActiveTab("lista")}
        >
          {" "}
          <FiList size={16} /> Lista Completa{" "}
        </button>{" "}
        <button
          className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === "marketing" ? STYLES.tabActive : STYLES.tabInactive}`}
          onClick={() => setActiveTab("marketing")}
        >
          {" "}
          <FiMessageSquare size={16} /> Marketing WhatsApp{" "}
        </button>{" "}
      </div>{" "}
      {/* Contenido Dinámico */}{" "}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        {" "}
        {activeTab === "registro" && (
          <RegistroClienteContent
            fetchClients={fetchClients}
            editingClient={editingClient}
            setEditingClient={setEditingClient}
          />
        )}{" "}
        {activeTab === "lista" &&
          (loadingList ? (
            <div className="flex justify-center items-center gap-3 py-12 text-gray-500 font-medium">
              <FiActivity className="animate-spin text-[#0A58CA]" size={20} />
              Cargando datos...
            </div>
          ) : (
            <ListaClientes
              clientes={clientes}
              onEdit={handleEdit}
              fetchClients={fetchClients}
            />
          ))}{" "}
        {activeTab === "marketing" && <MarketingTab clientes={clientes} />}{" "}
      </div>{" "}
    </div>
  );
};
export default ModuloClientes;
