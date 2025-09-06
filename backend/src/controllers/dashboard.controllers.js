import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Organization } from "../models/organizations.model.js";
import { Expense } from "../models/expenses.model.js";
import { Invoice } from "../models/invoices.model.js";

const getDashboardStats = asyncHandler(async (req, res) => {
  const organization = await Organization
    .findOne({ ownerId: req?.user?._id })
    .select('_id')
    .lean();

  if (!organization?._id) {
    throw new ApiError(404, "Cannot fetch dashboard stats: no organization found for this user");
  }

  const organizationId = organization._id;

  const today = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(today.getMonth() - 12);

  const invoiceStatsAgg = Invoice.aggregate([
    { $match: { organizationId } },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$totalAmount", 0] }
        },
        overdueInvoices: {
          $sum: { $cond: [{ $eq: ["$status", "overdue"] }, 1, 0] }
        }
      }
    },
    { $project: { _id: 0, totalRevenue: 1, overdueInvoices: 1 } }
  ]).option({ allowDiskUse: true });

  const expenseStatsAgg = Expense.aggregate([
    { $match: { organizationId } },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: "$amount" }
      }
    },
    { $project: { _id: 0, totalExpenses: 1 } }
  ]).option({ allowDiskUse: true });

  const chartIncomeAgg = Invoice.aggregate([
    {
      $match: {
        organizationId,
        status: "paid",
        issueDate: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: { year: { $year: "$issueDate" }, month: { $month: "$issueDate" } },
        totalIncome: { $sum: "$totalAmount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $project: { _id: 1, totalIncome: 1 } }
  ]).option({ allowDiskUse: true });

  const chartExpenseAgg = Expense.aggregate([
    {
      $match: {
        organizationId,
        expenseDate: { $gte: twelveMonthsAgo }
      }
    },
    {
      $group: {
        _id: { year: { $year: "$expenseDate" }, month: { $month: "$expenseDate" } },
        totalExpense: { $sum: "$amount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    { $project: { _id: 1, totalExpense: 1 } }
  ]).option({ allowDiskUse: true });

  const [
    invoiceStats,
    expenseStats,
    chartIncomeData,
    chartExpenseData
  ] = await Promise.all([invoiceStatsAgg, expenseStatsAgg, chartIncomeAgg, chartExpenseAgg]);

  const totalRevenue = invoiceStats?.[0]?.totalRevenue ?? 0;
  const overdueInvoicesCount = invoiceStats?.[0]?.overdueInvoices ?? 0;
  const totalExpenses = expenseStats?.[0]?.totalExpenses ?? 0;
  const netProfit = totalRevenue - totalExpenses;

  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const chartData = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthName = monthNames[d.getMonth()];

    const incomeEntry = chartIncomeData.find(item => item._id.year === year && item._id.month === month);
    const expenseEntry = chartExpenseData.find(item => item._id.year === year && item._id.month === month);

    chartData.push({
      month: `${monthName} ${year}`,
      income: incomeEntry?.totalIncome ?? 0,
      expenses: expenseEntry?.totalExpense ?? 0
    });
  }

  const dashboardStats = {
    stats: {
      totalRevenue,
      totalExpenses,
      netProfit,
      overdueInvoicesCount
    },
    chartData
  };

  return res
    .status(200)
    .json(new ApiResponse(200, dashboardStats, "Dashboard stats fetched successfully"));
});

export { getDashboardStats };
