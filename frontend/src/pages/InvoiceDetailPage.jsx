import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Loader2, Download, ArrowLeft, Edit } from "lucide-react";
import { formatDate, formatCurrency } from "../utils/formatters";

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchAllDetails = async () => {
      setLoading(true);
      try {
        const [invoiceRes, orgRes] = await Promise.all([
          axiosPrivate.get(`/invoices/${id}`),
          axiosPrivate.get("/organizations/mine"),
        ]);
        setInvoice(invoiceRes.data.data);
        setOrganization(orgRes.data.data);
      } catch (error) {
        console.error("Failed to fetch invoice details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllDetails();
  }, [id]);

  const downloadPDF = async () => {
    const element = document.getElementById("invoice-content");
    if (!element) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setDownloading(false);
    }
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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
        <h3 className="text-lg font-semibold text-slate-50">
          Invoice not found
        </h3>
        <p className="mt-2 text-sm text-slate-400">
          The requested invoice could not be found.
        </p>
        <button
          onClick={() => navigate("/invoices")}
          className="mt-6 flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div key={id} className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header and Action Bar */}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">
            Invoice {invoice.invoiceNumber}
          </h1>
          <div className="flex items-center gap-x-3 mt-2">
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(
                invoice.status
              )}`}
            >
              {invoice.status?.charAt(0).toUpperCase() +
                invoice.status?.slice(1)}
            </span>
            <span className="text-sm text-slate-400">
              Issued on {formatDate(invoice.issueDate)}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to={`/invoices/edit/${id}`}
            className="flex items-center justify-center gap-x-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
          >
            <Edit className="h-4 w-4" /> Edit
          </Link>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* Invoice Content - FORCED BLACK & WHITE THEME */}
      <div
        id="invoice-content"
        className="rounded-lg border border-black bg-white text-black p-8 md:p-12"
      >
        {/* Invoice Header */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:items-start mb-12">
          <div>
            <h2 className="text-2xl font-bold text-blue-600">
              {organization?.name || "Your Business"}
            </h2>
            {organization?.address && (
              <div className="text-sm text-gray-600 mt-2">
                {organization.address.street && (
                  <div>{organization.address.street}</div>
                )}
                <div>
                  {[
                    organization.address.city,
                    organization.address.state,
                    organization.address.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
                {organization.gstin && (
                  <div className="mt-1">
                    <strong className="text-black">GSTIN:</strong>{" "}
                    {organization.gstin}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-left sm:text-right">
            <h3 className="text-3xl font-bold text-black">INVOICE</h3>
            <div className="text-sm text-gray-600 mt-2 space-y-1">
              <div>
                <strong className="text-black">Invoice #:</strong>{" "}
                {invoice.invoiceNumber}
              </div>
              <div>
                <strong className="text-black">Issue Date:</strong>{" "}
                {formatDate(invoice.issueDate)}
              </div>
              <div>
                <strong className="text-black">Due Date:</strong>{" "}
                {formatDate(invoice.dueDate)}
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-12">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Bill To:
          </h4>
          <div className="text-sm text-gray-700">
            <div className="font-bold text-black">{invoice.name}</div>
            {invoice?.email && <div>{invoice.email}</div>}
            {invoice?.billingAddress && (
              <div className="mt-1">
                {invoice.billingAddress.street && (
                  <div>{invoice.billingAddress.street}</div>
                )}
                <div>
                  {[
                    invoice.billingAddress.city,
                    invoice.billingAddress.state,
                    invoice.billingAddress.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-12">
          <table className="w-full text-left">
            <thead className="border-b border-black text-sm text-gray-600">
              <tr>
                <th className="py-3 pr-3 font-semibold">Description</th>
                <th className="w-1/6 text-right py-3 px-3 font-semibold">
                  Qty
                </th>
                <th className="w-1/6 text-right py-3 px-3 font-semibold">
                  Unit Price
                </th>
                <th className="w-1/6 text-right py-3 pl-3 font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {invoice.lineItems?.map((item, index) => (
                <tr key={index}>
                  <td className="py-3 pr-3 text-sm font-medium text-black">
                    {item.description}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700 text-right">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-700 text-right">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 pl-3 text-sm font-medium text-black text-right">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Tax ({invoice.tax?.rate * 100}%):</span>
              <span>{formatCurrency(invoice.tax?.amount)}</span>
            </div>
            <div className="flex justify-between border-t border-black pt-2 text-lg font-bold text-black">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Notes and Terms */}
        <div className="space-y-6 text-sm text-gray-600 border-t border-black pt-6">
          {invoice.notes && (
            <div>
              <h4 className="font-semibold text-black mb-2">Notes:</h4>
              <p>{invoice.notes}</p>
            </div>
          )}
          {invoice.terms && (
            <div>
              <h4 className="font-semibold text-black mb-2">
                Terms & Conditions:
              </h4>
              <p>{invoice.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;
