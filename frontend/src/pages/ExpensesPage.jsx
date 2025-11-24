import { useState, useEffect, useMemo } from "react";
import {
  Loader2,
  TrendingUp,
  FilePenLine,
  Trash2,
  PlusCircle,
  FilterX,
} from "lucide-react";
import { formatDate, formatCurrency } from "../utils/formatters";
import Modal from "../components/Modal"; 
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
  });
  const [formData, setFormData] = useState({
    category: "Other",
    description: "",
    amount: "",
    expenseDate: new Date().toISOString().split("T")[0],
  });

  const categories = [
    "Marketing",
    "Software",
    "Travel",
    "Supplies",
    "Meals & Entertainment",
    "Other",
  ];

  const [debouncedDescription, setDebouncedDescription] = useState(
    formData.description
  );

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDescription(formData.description);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.description]);


  useEffect(() => {
    if (
      !editingExpense &&
      debouncedDescription &&
      debouncedDescription.length > 3
    ) {
      predictCategory(debouncedDescription);
    }
  }, [debouncedDescription, editingExpense]);

  useEffect(() => {
    fetchExpenses();
  }, [filters]);

  const fetchExpenses = async () => {
    if (expenses.length === 0) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      const response = await axiosPrivate.get(`/expenses?${params.toString()}`);
      setExpenses(response.data.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const predictCategory = async (description) => {
    if (!description || description.length < 3) return;
    setIsPredicting(true);
    try {
      const response = await axiosPrivate.post("/ai/predict-category", {
        description,
      });
      const predictedCategory = response.data.data.category;
      if (categories.includes(predictedCategory)) {
        setFormData((prev) => ({ ...prev, category: predictedCategory }));
      }
    } catch (error) {
      console.error("Failed to predict category:", error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const expenseData = {
        category: formData.category,
        description: formData.description,
        amount: Number.parseFloat(formData.amount),
        expenseDate: formData.expenseDate,
      };

      if (editingExpense) {
        await axiosPrivate.patch(
          `/expenses/${editingExpense._id}`,
          expenseData
        );
      } else {
        await axiosPrivate.post("/expenses", expenseData);
      }
      handleModalClose();
      fetchExpenses();
    } catch (error) {
      console.error("Failed to save expense:", error);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      expenseDate: new Date(expense.expenseDate).toISOString().split("T")[0],
    });
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      await axiosPrivate.delete(`/expenses/${expenseToDelete._id}`);
      fetchExpenses();
    } catch (error) {
      console.error("Failed to delete expense:", error);
    } finally {
      setIsDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      category: "Other",
      description: "",
      amount: "",
      expenseDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    resetForm();
  };

  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  if (loading && expenses.length === 0) {
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
          <h1 className="text-3xl font-bold text-slate-50">Expenses</h1>
          <p className="mt-1 text-slate-400">
            Track and manage your business expenses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          <PlusCircle className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Filters Card */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Category
            </label>
            <select
              className="block w-full rounded-md border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          {/* Add Date Filters Here if axiosPrivate supports them */}
          <div className="flex items-end md:col-start-4">
            <button
              onClick={() =>
                setFilters({ category: "", startDate: "", endDate: "" })
              }
              className="flex items-center justify-center gap-x-2 w-full rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-600"
            >
              <FilterX className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {loading && expenses.length > 0 && (
        <div className="text-center text-slate-400 flex items-center justify-center gap-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Updating results...</span>
        </div>
      )}

      {!loading && expenses.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-700 bg-slate-800/50 p-12 text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-slate-500" />
          <h3 className="mt-4 text-lg font-semibold text-slate-50">
            No expenses found
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {filters.category ? "Try adjusting your filters, or " : "Start by "}
            <button
              onClick={() => setIsModalOpen(true)}
              className="font-medium text-indigo-400 hover:underline"
            >
              add your first expense
            </button>
            .
          </p>
        </div>
      ) : (
        <div
          className={`rounded-lg border border-slate-700 bg-slate-800 transition-opacity ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-slate-50">
              Total Expenses: {formatCurrency(totalExpenses)}
            </h3>
            <p className="text-sm text-slate-400">
              {expenses.length} expense{expenses.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-slate-900/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {formatDate(expense.expenseDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-50">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-slate-600/50 text-slate-300">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-50">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        title="Edit Expense"
                      >
                        <FilePenLine className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            {" "}
            {/* Added relative positioning */}
            <label className="block text-sm font-medium text-slate-300">
              Description *
            </label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" // Added padding-right
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            {/* Prediction loading indicator */}
            {isPredicting && (
              <div className="absolute inset-y-0 right-0 top-6 flex items-center pr-3">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Category *
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Amount *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300">
              Expense Date *
            </label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.expenseDate}
              onChange={(e) =>
                setFormData({ ...formData, expenseDate: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleModalClose}
              className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading["submit"]}
              className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading["submit"] && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingExpense ? "Update Expense" : "Add Expense"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Confirm Deletion"
      >
        <div>
          <p className="text-slate-300">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </p>
          <p className="mt-2 font-semibold text-slate-50">
            {expenseToDelete?.description}
          </p>
          <p className="text-sm text-slate-400">
            {formatCurrency(expenseToDelete?.amount || 0)}
          </p>
          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(false)}
              className="rounded-md bg-slate-700 px-4 py-2 text-sm font-medium text-slate-50 transition-colors hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
            >
              Delete Expense
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpensesPage;
