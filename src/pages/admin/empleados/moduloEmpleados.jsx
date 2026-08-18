import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  FiUser,
  FiShield,
  FiSave,
  FiSearch,
  FiFilter,
  FiTrash,
  FiEye,
  FiX,
  FiMail,
  FiPhone,
  FiPlus,
  FiList,
  FiActivity,
  FiCheck,
  FiLock,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import authContext from "../../../store/store";
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
/* --- COMPONENTE: DETALLE DE USUARIO (MODAL) --- */
const DetalleUsuario = ({ user, onClose }) => {
  if (!user) return null;
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      {" "}
      <div
        className={`${STYLES.glass} w-full max-w-md p-8 relative`}
      >
        {" "}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {" "}
          <FiX size={24} />{" "}
        </button>{" "}
        <div className="mb-6 border-b border-gray-100 pb-4">
          {" "}
          <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
            {" "}
            <FiUser className="text-[#0A58CA]" size={20} /> Ficha de Usuario{" "}
          </h2>{" "}
        </div>{" "}
        <div className="space-y-6">
          {" "}
          <div className="grid grid-cols-2 gap-4">
            {" "}
            <div>
              {" "}
              <label className={STYLES.label}>ID Interno</label>{" "}
              <p className="text-sm text-gray-500 font-medium">
                #{user.id}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className={STYLES.label}>Rol de Acceso</label>{" "}
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F4F7FE] text-[#0A58CA] text-xs font-semibold border border-blue-100 uppercase">
                {" "}
                {user.role || "USER"}{" "}
              </span>{" "}
            </div>{" "}
          </div>{" "}
          <div>
            {" "}
            <label className={STYLES.label}>Nombre Completo</label>{" "}
            <p className="text-gray-900 font-bold text-lg capitalize">
              {user.name}
            </p>{" "}
          </div>{" "}
          <div className="space-y-4">
            {" "}
            <div>
              {" "}
              <label className={STYLES.label}>Email Registrado</label>{" "}
              <div className="flex items-center gap-3 text-gray-700">
                {" "}
                <FiMail className="text-[#0A58CA]" />{" "}
                <p className="text-sm font-medium">
                  {user.email || "NO REGISTRADO"}
                </p>{" "}
              </div>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className={STYLES.label}>Teléfono de Contacto</label>{" "}
              <div className="flex items-center gap-3 text-gray-700">
                {" "}
                <FiPhone className="text-[#0A58CA]" />{" "}
                <p className="text-sm font-medium">
                  {user.number || "NO REGISTRADO"}
                </p>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
            {" "}
            <div>
              {" "}
              <label className={STYLES.label}>Fecha de Alta</label>{" "}
              <p className="text-gray-500 text-xs font-medium">
                {formatDate(user.createdAt)}
              </p>{" "}
            </div>{" "}
            <div>
              {" "}
              <label className={STYLES.label}>Último Log</label>{" "}
              <p className="text-gray-500 text-xs font-medium">
                {formatDate(user.updatedAt)}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
/* --- COMPONENTE: FORMULARIO DE REGISTRO --- */
const RegistroUsuarioContent = ({ fetchUsers }) => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    number: "",
    password: "",
    role: "user",
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleGuardarUsuario = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      /* 1. Crear usuario básico: Enviamos explícitamente solo los datos requeridos. */
      const res = await axios.post(`${API_URL}/createuser`, {
        name: user.name,
        email: user.email,
        number: user.number,
        password: user.password,
      });
      /* Detectamos el ID del usuario creado en la respuesta para asignar el rol */
      const createdUser = res.data.user || res.data.data || res.data;
      if (createdUser?.id && user.role !== "user") {
        await axios.put(`${API_URL}/update-role/${createdUser.id}`, {
          role: user.role,
        });
      }
      setNotification({
        show: true,
        type: "success",
        message: "EMPLEADO REGISTRADO CORRECTAMENTE",
      });
      setUser({ name: "", email: "", number: "", password: "", role: "user" });
      if (fetchUsers) fetchUsers();
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "ERROR AL REGISTRAR";
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
    <div
      className={`${STYLES.glass} overflow-hidden relative`}
    >
      {" "}
      {notification.show && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
          {" "}
          <div className={`w-20 h-20 rounded-full border flex items-center justify-center mb-4 ${notification.type === "success" ? "bg-green-50 border-green-200 text-green-600" : "bg-red-50 border-red-200 text-red-600"}`}>
            {" "}
            {notification.type === "success" ? (
              <FiCheck size={40} />
            ) : (
              <FiX size={40} />
            )}{" "}
          </div>{" "}
          <p
            className="text-sm font-bold text-gray-900 uppercase"
          >
            {notification.message}
          </p>{" "}
        </div>
      )}{" "}
      <div className="px-8 py-6 border-b border-gray-100 bg-[#F8FAFC]">
        {" "}
        <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
          {" "}
          <FiPlus size={20} className="text-[#0A58CA]" /> Registrar Nuevo
          Personal{" "}
        </h2>{" "}
      </div>{" "}
      <div className="p-10">
        {" "}
        <form onSubmit={handleGuardarUsuario} className="space-y-10">
          {" "}
          <section>
            {" "}
            <h3
              className="text-sm text-gray-900 font-semibold mb-6 flex items-center gap-2"
            >
              {" "}
              <FiActivity size={16} className="text-[#0A58CA]" /> 01 Datos Generales{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {" "}
              <div className="space-y-2">
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
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="Ej: Pedro Sánchez"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className={STYLES.label}>Email Corporativo</label>{" "}
                <div className="relative">
                  {" "}
                  <FiMail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="empleado@lu.com"
                  />{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
          <section>
            {" "}
            <h3
              className="text-sm text-gray-900 font-semibold mb-6 flex items-center gap-2"
            >
              {" "}
              <FiShield size={16} className="text-[#0A58CA]" /> 02 Seguridad y Acceso{" "}
            </h3>{" "}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {" "}
              <div className="space-y-2">
                {" "}
                <label className={STYLES.label}>Teléfono Interno</label>{" "}
                <div className="relative">
                  {" "}
                  <FiPhone
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="text"
                    name="number"
                    value={user.number}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="54911..."
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className={STYLES.label}>Contraseña de Acceso</label>{" "}
                <div className="relative">
                  {" "}
                  <FiLock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <input
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11`}
                    required
                    placeholder="••••••••"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="space-y-2">
                {" "}
                <label className={STYLES.label}>Rol Asignado</label>{" "}
                <div className="relative">
                  {" "}
                  <FiShield
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />{" "}
                  <select
                    name="role"
                    value={user.role}
                    onChange={handleInputChange}
                    className={`${STYLES.input} pl-11 appearance-none cursor-pointer capitalize`}
                  >
                    {" "}
                    <option value="user">Usuario</option>{" "}
                    <option value="vendedor">Vendedor</option>{" "}
                    <option value="tecnico">Técnico</option>{" "}
                    <option value="admin">Admin</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </section>{" "}
          <div className="flex justify-end pt-8 border-t border-gray-100">
            {" "}
            <button
              type="submit"
              disabled={loading}
              className={`${STYLES.buttonPrimary} flex items-center justify-center gap-2 w-full md:w-auto disabled:opacity-70`}
            >
              {" "}
              {loading ? (
                <FiActivity className="animate-spin" />
              ) : (
                <FiCheck size={18} />
              )}{" "}
              {loading ? "Procesando..." : "Guardar Usuario"}{" "}
            </button>{" "}
          </div>{" "}
        </form>{" "}
      </div>{" "}
    </div>
  );
};
const ModuloEmpleados = () => {
  const [activeTab, setActiveTab] = useState("lista");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [viewingUser, setViewingUser] = useState(null);
  const authCtx = useContext(authContext);
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/getAllUsers`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.put(`${API_URL}/update-role/${userId}`, { role: newRole });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
      if (window.Swal) {
        Swal.fire({
          icon: "success",
          title: "Rol actualizado",
          text: `Usuario actualizado a: ${newRole.toUpperCase()}`,
          timer: 1500,
          showConfirmButton: false,
          background: "#000",
          color: "#fff",
        });
      }
    } catch (error) {
      console.error("Error al cambiar rol:", error);
      if (window.Swal) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo actualizar el rol.",
          background: "#000",
          color: "#fff",
        });
      } else {
        alert("No se pudo actualizar el rol.");
      }
    }
  };
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm("¿ELIMINAR ESTE USUARIO? ESTA ACCIÓN ES IRREVERSIBLE.")
    ) {
      try {
        await axios.delete(`${API_URL}/delete-user/${userId}`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error al eliminar el usuario.");
      }
    }
  };
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });
  return (
    <div className="min-h-screen bg-[#F4F7FE] text-gray-900 p-4 md:p-12 font-['Inter'] selection:bg-[#0A58CA] selection:text-white max-w-7xl mx-auto">
      {" "}
      <AnimatePresence>
        {" "}
        {viewingUser && (
          <DetalleUsuario
            user={viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}{" "}
      </AnimatePresence>{" "}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {" "}
            Gestión de Personal{" "}
          </h1>{" "}
          <p
            className="font-medium text-xs text-gray-500 mt-2"
          >
            Administración de empleados y roles
          </p>{" "}
        </div>{" "}
        <div
          className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-[#0A58CA] uppercase shadow-sm flex items-center gap-2"
        >
          {" "}
          <FiShield size={14} /> Sesión de Administrador{" "}
        </div>{" "}
      </div>{" "}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto custom-scrollbar bg-white rounded-t-2xl px-2 pt-2">
        {" "}
        <button
          onClick={() => setActiveTab("lista")}
          className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === "lista" ? STYLES.tabActive : STYLES.tabInactive}`}
        >
          {" "}
          <FiList size={16} /> Lista de Personal{" "}
        </button>{" "}
        <button
          onClick={() => setActiveTab("registro")}
          className={`px-6 py-4 text-sm font-medium transition-all flex items-center gap-2 border-b-2 ${activeTab === "registro" ? STYLES.tabActive : STYLES.tabInactive}`}
        >
          {" "}
          <FiPlus size={16} /> Registrar Nuevo{" "}
        </button>{" "}
      </div>{" "}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {" "}
        {activeTab === "registro" ? (
          <RegistroUsuarioContent fetchUsers={fetchUsers} />
        ) : (
          <div className={`${STYLES.glass} p-6 md:p-8`}>
            {" "}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              {" "}
              <h2 className={`${STYLES.title} text-lg flex items-center gap-3`}>
                {" "}
                <FiList className="text-[#0A58CA]" size={20} /> Registros
                Actuales{" "}
              </h2>{" "}
              <div className="flex gap-4 w-full md:w-auto">
                {" "}
                <div className="relative group flex-1 md:w-64">
                  {" "}
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0A58CA] transition-colors" />{" "}
                  <input
                    type="text"
                    placeholder="Buscar empleado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${STYLES.input} py-2 pl-10`}
                  />{" "}
                </div>{" "}
                <div className="relative">
                  {" "}
                  <FiFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />{" "}
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="bg-white border border-gray-200 rounded-xl py-2 pl-4 pr-10 text-sm font-medium text-gray-700 outline-none focus:border-[#0A58CA] appearance-none cursor-pointer"
                  >
                    {" "}
                    <option value="all">Todos los Roles</option>{" "}
                    <option value="admin">Admin</option>{" "}
                    <option value="tecnico">Técnico</option>{" "}
                    <option value="vendedor">Vendedor</option>{" "}
                    <option value="user">User</option>{" "}
                  </select>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
            <div className="overflow-x-auto custom-scrollbar">
              {" "}
              <table className="w-full text-left border-collapse">
                {" "}
                <thead>
                  {" "}
                  <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase font-bold bg-gray-50">
                    {" "}
                    <th className="py-4 px-4 rounded-tl-xl">Empleado</th>{" "}
                    <th className="py-4 px-4">Email Corporativo</th>{" "}
                    <th className="py-4 px-4">Rol de Acceso</th>{" "}
                    <th className="py-4 px-4 text-right rounded-tr-xl">Acciones</th>{" "}
                  </tr>{" "}
                </thead>{" "}
                <tbody className="text-sm">
                  {" "}
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-500 font-medium"
                      >
                        <div className="flex justify-center items-center gap-3">
                          <FiActivity className="animate-spin text-[#0A58CA]" size={20} />
                          Cargando datos...
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-12 text-center text-gray-500 font-medium"
                      >
                        No se encontraron resultados
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                      >
                        {" "}
                        <td className="py-4 px-4">
                          {" "}
                          <div className="flex items-center gap-4">
                            {" "}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${user.role === "admin" ? "bg-blue-100 text-[#0A58CA]" : "bg-gray-100 text-gray-600"}`}
                            >
                              {" "}
                              {user.name.charAt(0).toUpperCase()}{" "}
                            </div>{" "}
                            <span className="text-gray-900 font-bold capitalize">
                              {user.name}
                            </span>{" "}
                          </div>{" "}
                        </td>{" "}
                        <td className="py-4 px-4 text-gray-600">
                          {user.email}
                        </td>{" "}
                        <td className="py-4 px-4">
                          {" "}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase ${user.role === "admin" ? "bg-[#F4F7FE] text-[#0A58CA] border-blue-100" : "bg-gray-100 text-gray-600 border-gray-200"}`}
                          >
                            {" "}
                            {user.role}{" "}
                          </span>{" "}
                        </td>{" "}
                        <td className="py-4 px-4 text-right">
                          {" "}
                          <div className="flex items-center justify-end gap-2">
                            {" "}
                            <button
                              onClick={() => setViewingUser(user)}
                              className="p-2 text-gray-400 hover:text-[#0A58CA] hover:bg-blue-50 rounded-lg transition-all"
                              title="Ver ficha"
                            >
                              <FiEye size={18} />
                            </button>{" "}
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleRoleChange(user.id, e.target.value)
                              }
                              disabled={user.id === authCtx.user?.id}
                              className="bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 py-1.5 px-3 outline-none focus:border-[#0A58CA] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
                            >
                              {" "}
                              <option value="user">Usuario</option>{" "}
                              <option value="vendedor">Vendedor</option>{" "}
                              <option value="tecnico">Técnico</option>{" "}
                              <option value="admin">Admin</option>{" "}
                            </select>{" "}
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === authCtx.user?.id}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-transparent"
                              title="Eliminar usuario"
                            >
                              {" "}
                              <FiTrash size={18} />{" "}
                            </button>{" "}
                          </div>{" "}
                        </td>{" "}
                      </tr>
                    ))
                  )}{" "}
                </tbody>{" "}
              </table>{" "}
            </div>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
export default ModuloEmpleados;
