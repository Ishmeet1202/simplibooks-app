import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Loader2 } from "lucide-react";

const OnboardingPage = () => {
  const { setOrganizationCreated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    gstin: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const axiosPrivate = useAxiosPrivate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axiosPrivate.post("/organizations", {
        name: formData.name,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: "India",
        },
        gstin: formData.gstin,
      });

      setOrganizationCreated();
      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create organization. Please try again."
      );
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900 p-4 text-white">
      <div className="w-full max-w-2xl animate-in fade-in-50 slide-in-from-bottom-5 duration-500 rounded-lg border border-slate-700 bg-slate-800 p-8 shadow-lg">
        <div className="space-y-4 text-center">
          <span className="text-3xl font-bold text-indigo-400">
            🧾 SimpliBooks
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            Setup Your Organization
          </h1>
          <p className="text-sm text-slate-400">
            Tell us about your business to get started.
          </p>
        </div>

        <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-900 bg-red-900/20 p-3 text-sm font-semibold text-red-400">
              {error}
            </div>
          )}

          {/* Business Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">
              Business Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300"
                >
                  Business Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Acme Innovations"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="gstin"
                  className="block text-sm font-medium text-slate-300"
                >
                  GSTIN (Optional)
                </label>
                <input
                  id="gstin"
                  name="gstin"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your GSTIN"
                  value={formData.gstin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Business Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700 pb-2">
              Business Address
            </h3>
            <div>
              <label
                htmlFor="street"
                className="block text-sm font-medium text-slate-300"
              >
                Street Address
              </label>
              <input
                id="street"
                name="street"
                type="text"
                className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="123 Main St"
                value={formData.street}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-slate-300"
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-slate-300"
                >
                  State / Province
                </label>
                <input
                  id="state"
                  name="state"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.state}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-slate-300"
                >
                  Postal Code
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.postalCode}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Save and Continue to Dashboard"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;
