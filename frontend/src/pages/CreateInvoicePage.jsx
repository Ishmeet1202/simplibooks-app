import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    terms: "",
    taxRate: 18,
  });
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axiosPrivate.get("/clients");
        setClients(response.data.data.filter((client) => !client.isArchived));
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      }
    };
    fetchClients();
  }, []);

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    const numericValue =
      field === "quantity" || field === "unitPrice"
        ? parseFloat(value) || 0
        : value;
    updatedItems[index][field] = numericValue;
    setLineItems(updatedItems);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  // Use useMemo for efficient calculations that only re-run when dependencies change
  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  }, [lineItems, formData.taxRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const invoiceData = {
        clientId: formData.clientId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        lineItems: lineItems.map(({ description, quantity, unitPrice }) => ({
          description,
          quantity,
          unitPrice,
        })),
        tax: {
          rate: formData.taxRate,
        },
        notes: formData.notes,
        terms: formData.terms,
      };

      const response = await axiosPrivate.post("/invoices", invoiceData);
      navigate(`/invoices/${response.data.data._id}`);
    } catch (error) {
      console.error("Failed to create invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">
            Create New Invoice
          </h1>
          <p className="mt-1 text-slate-400">
            Fill in the details to create a new invoice for your client.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Client *
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a client
                </option>
                {clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Issue Date *
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Due Date *
              </label>
              <input
                type="date"
                required
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Tax Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-50">Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-x-2 rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end rounded-md bg-slate-900/50 p-4"
              >
                <div className="md:col-span-5">
                  <label className="block text-xs font-medium text-slate-400">
                    Description *
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Service or product"
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(index, "description", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(index, "quantity", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400">
                    Unit Price *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={item.unitPrice}
                    onChange={(e) =>
                      handleLineItemChange(index, "unitPrice", e.target.value)
                    }
                  />
                </div>
                <div className="md:col-span-2 text-right">
                  <label className="block text-xs font-medium text-slate-400">
                    Total
                  </label>
                  <div className="mt-1 text-lg font-medium text-slate-50">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
                <div className="md:col-span-1 flex items-center justify-end">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tax ({formData.taxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 text-lg font-bold text-slate-50">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes & Terms Card */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-300">
              Notes
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Any additional notes for the client"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
            <label className="block text-sm font-medium text-slate-300">
              Terms & Conditions
            </label>
            <textarea
              rows={3}
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Payment due within 30 days"
              value={formData.terms}
              onChange={(e) =>
                setFormData({ ...formData, terms: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => navigate("/invoices")}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;
