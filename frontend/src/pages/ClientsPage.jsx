import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Loader2,
  Users,
  FilePenLine,
  Archive,
  ArchiveRestore,
  PlusCircle,
} from "lucide-react";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get("/clients");
      setClients(response.data.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const clientData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        billingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: "India",
        },
      };

      if (editingClient) {
        await axiosPrivate.patch(`/clients/${editingClient._id}`, clientData);
      } else {
        await axiosPrivate.post("/clients", clientData);
      }

      setIsModalOpen(false);
      setEditingClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error("Failed to save client:", error);
    }
  };

  const handleEdit = async (client) => {
    try {
      const response = await axiosPrivate.get(`/clients/${client._id}`);
      const clientData = response.data.data;

      setFormData({
        name: clientData.name || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        street: clientData.billingAddress?.street || "",
        city: clientData.billingAddress?.city || "",
        state: clientData.billingAddress?.state || "",
        postalCode: clientData.billingAddress?.postalCode || "",
      });
      setEditingClient(client);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch client details:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingClient(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Clients</h1>
          <p className="mt-1 text-slate-400">Manage your client information</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <PlusCircle className="h-5 w-5" />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-50">
            No clients yet
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            Get started by adding your first client.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-6 flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <PlusCircle className="h-5 w-5" />
            Add Your First Client
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-700 bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      <div>{client.email || "-"}</div>
                      <div>{client.phone || ""}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          client.isArchived
                            ? "bg-slate-600/50 text-slate-300"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {client.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Edit Client"
                      >
                        <FilePenLine className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingClient ? "Edit Client" : "Add New Client"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Name *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Phone (e.g. +91**********)
            </label>
            <input
              type="tel"
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Street Address
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                City
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                State / Province
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Postal Code
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {editingClient ? "Update Client" : "Add Client"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
