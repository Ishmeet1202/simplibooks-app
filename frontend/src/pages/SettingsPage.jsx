import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { Loader2, User, KeyRound, Building, FileCog } from "lucide-react";

const TabButton = ({ id, name, icon: Icon, activeTab, setActiveTab }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex w-full items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      activeTab === id
        ? "bg-slate-700 text-indigo-400"
        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
    }`}
  >
    <Icon className="h-5 w-5" />
    {name}
  </button>
);

// Reusable Form Card Component
const FormCard = ({ title, children, message, messageType }) => (
  <div className="rounded-lg border border-slate-700 bg-slate-800 animate-in fade-in-50 duration-500">
    <div className="p-6">
      <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
      {message && (
        <div
          className={`mt-4 rounded-md p-3 text-sm font-semibold ${
            messageType === "success"
              ? "border border-green-900 bg-green-900/20 text-green-400"
              : "border border-red-900 bg-red-900/20 text-red-400"
          }`}
        >
          {message}
        </div>
      )}
      {children}
    </div>
  </div>
);

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState({});
  const [organization, setOrganization] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: user?.name || "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [orgForm, setOrgForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    gstin: "",
  });
  const [invoiceForm, setInvoiceForm] = useState({
    prefix: "",
    notes: "",
    terms: "",
  }); // Added notes and terms
  const [messages, setMessages] = useState({
    profile: "",
    password: "",
    organization: "",
    invoice: "",
  });
  const [errorMessages, setErrorMessages] = useState({
    profile: "",
    password: "",
    organization: "",
    invoice: "",
  });

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axiosPrivate.get("/organizations/mine");
        const org = response.data.data;
        setOrganization(org);
        setProfileForm({ name: user?.name || "" }); // Also reset profile form on load
        setOrgForm({
          name: org.name || "",
          street: org.address?.street || "",
          city: org.address?.city || "",
          state: org.address?.state || "",
          postalCode: org.address?.postalCode || "",
          gstin: org.gstin || "",
        });
        setInvoiceForm({
          prefix: org.invoiceSettings?.prefix || "INV-",
          notes: org.invoiceSettings?.notes || "",
          terms: org.invoiceSettings?.terms || "",
        });
      } catch (error) {
        console.error("Failed to fetch organization:", error);
      }
    };
    if (user) {
      fetchOrganization();
    }
  }, [user]);

  const showMessage = (tab, message, isError = false) => {
    if (isError) {
      setErrorMessages((prev) => ({ ...prev, [tab]: message }));
    } else {
      setMessages((prev) => ({ ...prev, [tab]: message }));
    }
    setTimeout(() => {
      setMessages((prev) => ({ ...prev, [tab]: "" }));
      setErrorMessages((prev) => ({ ...prev, [tab]: "" }));
    }, 3000);
  };

  const handleLoading = (form, isLoading) => {
    setLoading((prev) => ({ ...prev, [form]: isLoading }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    handleLoading("profile", true);
    try {
      const response = await axiosPrivate.patch("/users/me", {
        name: profileForm.name,
      });
      updateUser(response.data.data);
      showMessage("profile", "Profile updated successfully!");
    } catch (error) {
      showMessage(
        "profile",
        error.response?.data?.message || "Failed to update profile",
        true
      );
    } finally {
      handleLoading("profile", false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("password", "New passwords do not match", true);
      return;
    }
    handleLoading("password", true);
    try {
      await axiosPrivate.patch("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showMessage("password", "Password changed successfully!");
    } catch (error) {
      showMessage(
        "password",
        error.response?.data?.message || "Failed to change password",
        true
      );
    } finally {
      handleLoading("password", false);
    }
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    handleLoading("organization", true);
    try {
      const payload = {
        name: orgForm.name,
        address: {
          street: orgForm.street,
          city: orgForm.city,
          state: orgForm.state,
          postalCode: orgForm.postalCode,
        },
        gstin: orgForm.gstin,
      };
      await axiosPrivate.patch("/organizations/mine", payload);
      showMessage("organization", "Organization details updated successfully!");
    } catch (error) {
      showMessage(
        "organization",
        error.response?.data?.message || "Failed to update organization",
        true
      );
    } finally {
      handleLoading("organization", false);
    }
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    handleLoading("invoice", true);
    try {
      await axiosPrivate.patch("/organizations/mine", {
        invoiceSettings: {
          prefix: invoiceForm.prefix,
          notes: invoiceForm.notes,
          terms: invoiceForm.terms,
        },
      });
      showMessage("invoice", "Invoice settings updated successfully!");
    } catch (error) {
      showMessage(
        "invoice",
        error.response?.data?.message || "Failed to update invoice settings",
        true
      );
    } finally {
      handleLoading("invoice", false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "password", name: "Password", icon: KeyRound },
    { id: "organization", name: "Organization", icon: Building },
    { id: "invoice", name: "Invoicing", icon: FileCog },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Settings</h1>
        <p className="mt-1 text-slate-400">
          Manage your account and business settings.
        </p>
      </div>

      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        {/* Tab Navigation */}
        <nav className="flex flex-row space-x-2 overflow-x-auto md:flex-col md:space-x-0 md:space-y-1 md:w-48">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              {...tab}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          ))}
        </nav>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <FormCard
              title="Profile Information"
              message={messages.profile || errorMessages.profile}
              messageType={errorMessages.profile ? "error" : "success"}
            >
              <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-slate-400 cursor-not-allowed"
                    value={user?.email || ""}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading["profile"]}
                    className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {loading["profile"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loading["profile"] ? "Updating..." : "Update Profile"}
                  </button>
                </div>
              </form>
            </FormCard>
          )}

          {activeTab === "password" && (
            <FormCard
              title="Change Password"
              message={messages.password || errorMessages.password}
              messageType={errorMessages.password ? "error" : "success"}
            >
              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading["password"]}
                    className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {loading["password"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loading["password"] ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </FormCard>
          )}

          {activeTab === "organization" && (
            <FormCard
              title="Organization Details"
              message={messages.organization || errorMessages.organization}
              messageType={errorMessages.organization ? "error" : "success"}
            >
              <form
                onSubmit={handleOrganizationSubmit}
                className="mt-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={orgForm.name}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={orgForm.gstin}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, gstin: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Street Address
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={orgForm.street}
                    onChange={(e) =>
                      setOrgForm({ ...orgForm, street: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      City
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={orgForm.city}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, city: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      State
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={orgForm.state}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, state: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={orgForm.postalCode}
                      onChange={(e) =>
                        setOrgForm({ ...orgForm, postalCode: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading["organization"]}
                    className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {loading["organization"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loading["organization"]
                      ? "Updating..."
                      : "Update Organization"}
                  </button>
                </div>
              </form>
            </FormCard>
          )}

          {activeTab === "invoice" && (
            <FormCard
              title="Invoice Settings"
              message={messages.invoice || errorMessages.invoice}
              messageType={errorMessages.invoice ? "error" : "success"}
            >
              <form onSubmit={handleInvoiceSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={invoiceForm.prefix}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, prefix: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Next invoice will be: {invoiceForm.prefix}
                    {organization?.invoiceSettings?.nextNumber || 1}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Default Notes
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Thank you for your business!"
                    value={invoiceForm.notes}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, notes: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300">
                    Default Terms & Conditions
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Payment due within 30 days"
                    value={invoiceForm.terms}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, terms: e.target.value })
                    }
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading["invoice"]}
                    className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {loading["invoice"] && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {loading["invoice"] ? "Updating..." : "Update Settings"}
                  </button>
                </div>
              </form>
            </FormCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
