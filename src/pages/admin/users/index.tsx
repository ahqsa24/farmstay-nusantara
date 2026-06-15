import React, { useState, useEffect } from "react";
import Head from "next/head";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RoleGuard from "@/components/guards/RoleGuard";
import { adminService } from "@/services/adminService";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminUsersPage() {
  const { locale } = useTranslation();
  const isId = locale === "id";

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const [editFormData, setEditFormData] = useState<any>({
    nama: "",
    email: "",
    password: "",
    role: "visitor",
    status: "active",
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(page, 10, search, roleFilter);
      if (response.status === "success") {
        const data = response.data;
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data?.data) {
          setUsers(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages || 1);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setFormError("");
    setEditFormData({ nama: "", email: "", password: "", role: "visitor", status: "active" });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (user: any) => {
    setIsEditing(true);
    setSelectedUser(user);
    setFormError("");
    setEditFormData({
      nama: user.nama,
      email: user.email,
      password: "",
      role: user.role?.name || user.role,
      status: user.status,
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenDeleteModal = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      if (isEditing && selectedUser) {
        // Update: hanya nama, role, status — email & password tidak bisa diubah
        await adminService.updateUser(selectedUser.id, {
          nama: editFormData.nama,
          role: editFormData.role,
          status: editFormData.status,
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, nama: editFormData.nama, role: editFormData.role, status: editFormData.status }
              : u
          )
        );
      } else {
        // Create baru
        const res = await adminService.createUser({
          nama: editFormData.nama,
          email: editFormData.email,
          password: editFormData.password,
          role: editFormData.role,
          status: editFormData.status,
        });
        if (res.status === "success" && res.data) {
          setUsers((prev) => [res.data, ...prev]);
        }
      }
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isId ? "Gagal menyimpan data pengguna." : "Failed to save user data.");
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isId ? "Gagal menghapus pengguna." : "Failed to delete user.");
      alert(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const getRoleBadge = (roleName: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      owner: "bg-emerald-100 text-emerald-800",
      farmstay_owner: "bg-emerald-100 text-emerald-800",
      visitor: "bg-blue-100 text-blue-800",
    };
    return styles[roleName] || "bg-zinc-100 text-zinc-800";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-red-100 text-red-800",
      suspended: "bg-amber-100 text-amber-800",
    };
    return styles[status] || "bg-zinc-100 text-zinc-800";
  };

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <DashboardLayout>
        <Head>
          <title>{isId ? "User Management — Farmstay Nusantara" : "User Management — Farmstay Nusantara"}</title>
        </Head>

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-farm-text">
                {isId ? "User Management" : "User Management"}
              </h1>
              <p className="text-sm text-farm-text-light mt-1 font-light">
                {isId ? "Daftar pengguna dan detail manajemen" : "User list and detail management"}
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="h-10 px-5 bg-farm-green text-white text-sm font-semibold rounded-lg hover:bg-farm-green-hover transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {isId ? "Tambah Pengguna" : "Add User"}
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-farm-text-light">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isId ? "Cari nama atau email..." : "Search name or email..."}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-farm-border bg-white text-sm text-farm-text placeholder:text-farm-text-light/60 focus:outline-none focus:ring-2 focus:ring-farm-green/30 focus:border-farm-green"
                />
              </div>
              <button type="submit" className="h-10 px-5 bg-farm-green text-white text-sm font-semibold rounded-lg hover:bg-farm-green-hover transition-colors">
                {isId ? "Cari" : "Search"}
              </button>
            </form>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-10 px-4 min-w-[140px] appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer"
            >
              <option value="">{isId ? "Semua Role" : "All Roles"}</option>
              <option value="admin">Admin</option>
              <option value="owner">{isId ? "Pemilik Farmstay" : "Farmstay Owner"}</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-farm-border rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-farm-border bg-farm-beige/50">
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider w-16">No.</th>
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">{isId ? "Nama" : "Name"}</th>
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">Role</th>
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">{isId ? "Terdaftar" : "Registered"}</th>
                    <th className="text-right px-5 py-3 font-semibold text-farm-text text-xs uppercase tracking-wider">{isId ? "Aksi" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-farm-text-light">
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-green border-t-transparent"></div>
                          <span className="text-xs">{isId ? "Memuat data..." : "Loading..."}</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-farm-text-light text-sm">
                        {isId ? "Tidak ada data pengguna ditemukan." : "No users found."}
                      </td>
                    </tr>
                  ) : (
                    users.map((u: any, idx: number) => (
                      <tr key={u.id} className="border-b border-farm-border/50 hover:bg-farm-beige/30 transition-colors">
                        <td className="px-5 py-3.5 text-farm-text-light text-xs font-medium">
                          {(page - 1) * 10 + idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-farm-green flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                              {u.nama?.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-farm-text truncate max-w-[150px]">{u.nama}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-farm-text-light">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getRoleBadge(u.role?.name || u.role)}`}>
                            {u.role?.name || u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${getStatusBadge(u.status)}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-farm-text-light text-xs">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString(isId ? "id-ID" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : "-"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors focus:outline-none"
                              title={isId ? "Edit" : "Edit"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenDeleteModal(u)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                              title={isId ? "Hapus" : "Delete"}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-farm-border bg-farm-beige/30">
                <span className="text-xs text-farm-text-light">
                  {isId ? `Halaman ${page} dari ${totalPages}` : `Page ${page} of ${totalPages}`}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 px-3 rounded-lg border border-farm-border text-xs font-semibold text-farm-text disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    {isId ? "← Sebelumnya" : "← Prev"}
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 px-3 rounded-lg border border-farm-border text-xs font-semibold text-farm-text disabled:opacity-40 hover:bg-white transition-colors"
                  >
                    {isId ? "Berikutnya →" : "Next →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit User Modal */}
        {isAddEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddEditModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-farm-border bg-farm-beige/30 shrink-0">
                <h2 className="font-serif text-lg font-bold text-farm-text">
                  {isEditing ? (isId ? "Edit Pengguna" : "Edit User") : (isId ? "Tambah Pengguna" : "Add User")}
                </h2>
                <button onClick={() => setIsAddEditModalOpen(false)} className="text-farm-text-light hover:text-farm-text p-1 rounded-full hover:bg-farm-beige">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="p-5 sm:p-6 flex flex-col gap-4">
                  {/* Nama */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-farm-text">{isId ? "Nama Lengkap" : "Full Name"} *</label>
                    <input
                      type="text"
                      value={editFormData.nama}
                      onChange={(e) => setEditFormData({ ...editFormData, nama: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30"
                      required
                    />
                  </div>

                  {/* Email — hanya untuk tambah baru, disabled saat edit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-farm-text flex items-center gap-2">
                      Email *
                      {isEditing && (
                        <span className="text-[10px] font-normal text-farm-text-light bg-zinc-100 px-2 py-0.5 rounded-full">
                          {isId ? "Tidak dapat diubah" : "Cannot be changed"}
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => !isEditing && setEditFormData({ ...editFormData, email: e.target.value })}
                      className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none ${
                        isEditing
                          ? "border-farm-border/50 bg-zinc-50 text-farm-text-light cursor-not-allowed"
                          : "border-farm-border bg-white text-farm-text focus:ring-2 focus:ring-farm-green/30"
                      }`}
                      required={!isEditing}
                      readOnly={isEditing}
                      tabIndex={isEditing ? -1 : undefined}
                    />
                  </div>

                  {/* Password — hanya ditampilkan saat tambah baru, disembunyikan saat edit */}
                  {!isEditing && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-farm-text">Password *</label>
                      <input
                        type="password"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30"
                        required
                        minLength={8}
                        placeholder={isId ? "Minimal 8 karakter" : "Minimum 8 characters"}
                      />
                    </div>
                  )}

                  {/* Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-farm-text">Role *</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                      className="w-full h-10 px-4 appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer"
                    >
                      <option value="visitor">Visitor</option>
                      <option value="owner">Farmstay Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-farm-text">Status *</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      className="w-full h-10 px-4 appearance-none rounded-lg border border-farm-border bg-white text-sm text-farm-text focus:outline-none focus:ring-2 focus:ring-farm-green/30 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>

                  {/* Error message */}
                  {formError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
                      {formError}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 p-5 border-t border-farm-border bg-zinc-50/50">
                  <button
                    type="button"
                    onClick={() => setIsAddEditModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-farm-text-light hover:text-farm-text transition-colors"
                  >
                    {isId ? "Batal" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-farm-green text-white text-sm font-semibold rounded-lg hover:bg-farm-green-hover transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan" : "Save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
              <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-farm-text">
                    {isId ? "Hapus Pengguna?" : "Delete User?"}
                  </h3>
                  <p className="text-sm text-farm-text-light mt-1.5">
                    {isId
                      ? `Apakah Anda yakin ingin menghapus pengguna "${selectedUser?.nama}"? Tindakan ini tidak dapat dibatalkan.`
                      : `Are you sure you want to delete user "${selectedUser?.nama}"? This action cannot be undone.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 border-t border-farm-border bg-zinc-50/50">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-farm-text border border-farm-border rounded-lg hover:bg-white transition-colors shadow-sm"
                >
                  {isId ? "Batal" : "Cancel"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isDeleting ? (isId ? "Menghapus..." : "Deleting...") : (isId ? "Hapus" : "Delete")}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </RoleGuard>
  );
}
