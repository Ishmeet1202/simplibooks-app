import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

const UpdateInvoicePage = () => {
  const { id: invoiceId } = useParams(); // Get invoice ID from URL
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true to fetch data
  const [submitLoading, setSubmitLoading] = useState(false); // Separate loading state for submission
  const [formData, setFormData] = useState({
    clientId: "",
    issueDate: "",
    dueDate: "",
    status: "draft", // Added status field
    notes: "",
    terms: "",
    taxRate: 0,
  });
  const [lineItems, setLineItems] = useState([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [invoiceNumber, setInvoiceNumber] = useState(""); // State to hold the invoice number for display

  const invoiceStatuses = ["draft", "sent", "paid", "overdue", "void"]; // Define possible statuses

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clientsRes, invoiceRes] = await Promise.all([
          axiosPrivate.get("/clients"),
          axiosPrivate.get(`/invoices/${invoiceId}`),
        ]);

        const activeClients = clientsRes.data.data.filter(
          (client) => !client.isArchived
        );
        setClients(activeClients);

        const invoiceData = invoiceRes.data.data;
        setInvoiceNumber(invoiceData.invoiceNumber); // Store invoice number
        setFormData({
          clientId: invoiceData.clientId._id,
          issueDate: new Date(invoiceData.issueDate)
            .toISOString()
            .split("T")[0],
          dueDate: new Date(invoiceData.dueDate).toISOString().split("T")[0],
          status: invoiceData.status || "draft", // Fetch current status
          notes: invoiceData.notes || "",
          terms: invoiceData.terms || "",
          taxRate: invoiceData.tax?.rate || 0,
        });
        // Ensure lineItems always have quantity and unitPrice
        setLineItems(
          invoiceData.lineItems.map((item) => ({
            ...item,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch data for editing:", error);
        // Navigate back if invoice doesn't exist?
        // navigate("/invoices", { state: { error: "Invoice not found." } });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [invoiceId, navigate]); // Added navigate to dependency array

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
    ]); // Default unitPrice to 0
  };

  const removeLineItem = (index) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const { subtotal, taxAmount, totalAmount } = useMemo(() => {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    const taxAmount = (subtotal * (formData.taxRate || 0)) / 100;
    const totalAmount = subtotal + taxAmount;
    return { subtotal, taxAmount, totalAmount };
  }, [lineItems, formData.taxRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true); // Use separate loading state

    try {
      const invoiceData = {
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: formData.status, // Include status in the update payload
        lineItems: lineItems.map(({ description, quantity, unitPrice }) => ({
          description,
          quantity: quantity || 1, // Ensure quantity is at least 1
          unitPrice: unitPrice || 0, // Ensure unitPrice is at least 0
        })),
        tax: {
          rate: formData.taxRate || 0, // Ensure taxRate is at least 0
        },
        notes: formData.notes,
        terms: formData.terms,
      };

      await axiosPrivate.patch(`/invoices/${invoiceId}`, invoiceData);
      navigate(`/invoices/${invoiceId}`); // Navigate back to the detail page
    } catch (error) {
      console.error("Failed to update invoice:", error);
      // Add user-facing error handling (e.g., toast)
    } finally {
      setSubmitLoading(false); // Use separate loading state
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Edit Invoice</h1>
          <p className="mt-1 text-slate-400">
            Update the details for invoice #{invoiceNumber || "..."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details Card */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          {/* Changed grid layout for better alignment */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Client *
              </label>
              <select
                disabled
                required
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-slate-400 cursor-not-allowed"
                value={formData.clientId}
              >
                <option value={formData.clientId}>
                  {clients.find((c) => c._id === formData.clientId)?.name ||
                    "Loading client..."}
                </option>
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
            {/* Status Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-300">
                Status *
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                {invoiceStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {/* Tax Rate - adjusted grid position */}
            <div className="md:col-start-3">
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
                    min="0"
                    step="0.01"
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
                    {formatCurrency(
                      (item.quantity || 0) * (item.unitPrice || 0)
                    )}
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
            onClick={() => navigate(`/invoices/${invoiceId}`)}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitLoading}
            className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLoading ? "Updating..." : "Update Invoice"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateInvoicePage;
