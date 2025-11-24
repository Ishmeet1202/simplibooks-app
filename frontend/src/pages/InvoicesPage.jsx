import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, FileText, PlusCircle, FilterX, Eye } from "lucide-react";
import { formatDate, formatCurrency } from "../utils/formatters";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    clientName: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setFilters((prevFilters) => ({ ...prevFilters, clientName: searchTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.clientName) params.append("clientName", filters.clientName);

      const response = await axiosPrivate.get(`/invoices?${params.toString()}`);
      setInvoices(response.data.data);
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({ status: "", clientName: "" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "sent":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "overdue":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "void":
        return "bg-slate-600/50 text-slate-300 border-slate-600/50";
      default:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    }
  };

  if (loading && invoices.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-50">Invoices</h1>
          <p className="mt-1 text-slate-400">
            Manage your invoices and track payments.
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <PlusCircle className="h-5 w-5" />
          Create Invoice
        </Link>
      </div>

      {/* Filters Card */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Search by Client
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Acme Inc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Status
            </label>
            <select
              className="block w-full rounded-md border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="void">Void</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-x-2 w-full rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading && invoices.length > 0 && (
        <div className="text-center text-slate-400 flex items-center justify-center gap-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Updating results...</span>
        </div>
      )}

      {!loading && invoices.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-50">
            No invoices found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {filters.status || filters.clientName
              ? "Try adjusting your filters or "
              : "Get started by "}
            <Link
              to="/invoices/new"
              className="font-medium text-indigo-400 hover:underline"
            >
              creating your first invoice
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-700 bg-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {invoice?.clientName || "Unknown Client"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-slate-50">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                          invoice.status
                        )}`}
                      >
                        {invoice.status?.charAt(0).toUpperCase() +
                          invoice.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="View Invoice"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
