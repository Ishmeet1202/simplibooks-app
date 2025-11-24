import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  // --- THIS IS THE FIX ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get("/dashboard/stats");
        setDashboardData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [axiosPrivate]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-16">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-400" />
      </div>
    );
  }

  // Handle error case where data fetching failed
  if (!dashboardData) {
    return (
      <div className="rounded-lg border-2 border-dashed border-red-700 bg-red-800/20 p-12 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-50">
          Failed to Load Dashboard
        </h3>
        <p className="mt-2 text-sm text-red-300">
          Could not fetch dashboard statistics. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const { stats, chartData } = dashboardData;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows chart to fill the container height
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#cbd5e1", // slate-300 for legend text
        },
      },
      title: {
        display: true,
        text: "Income vs Expenses (Last 12 Months)",
        color: "#f8fafc", // slate-50 for title
      },
      tooltip: {
        backgroundColor: "#0f172a", // slate-900
        titleColor: "#f8fafc",
        bodyColor: "#cbd5e1",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => "₹" + value.toLocaleString(),
          color: "#94a3b8", // slate-400 for y-axis labels
        },
        grid: {
          color: "#334155", // slate-700 for grid lines
        },
      },
      x: {
        ticks: {
          color: "#94a3b8", // slate-400 for x-axis labels
        },
        grid: {
          color: "transparent", // Hide x-axis grid lines
        },
      },
    },
  };

  const chartDataConfig = {
    labels: chartData?.map((item) => item.month) || [],
    datasets: [
      {
        label: "Income",
        data: chartData?.map((item) => item.income) || [],
        backgroundColor: "rgba(99, 102, 241, 0.6)", // indigo-500
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Expenses",
        data: chartData?.map((item) => item.expenses) || [],
        backgroundColor: "rgba(239, 68, 68, 0.6)", // red-500
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-50">{value}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
          icon={TrendingUp}
          color="text-green-400"
        />
        <StatCard
          title="Total Expenses"
          value={`₹${stats?.totalExpenses?.toLocaleString() || "0"}`}
          icon={TrendingDown}
          color="text-red-400"
        />
        <StatCard
          title="Net Profit"
          value={`₹${stats?.netProfit?.toLocaleString() || "0"}`}
          icon={DollarSign}
          color="text-indigo-400"
        />
        <StatCard
          title="Overdue Invoices"
          value={stats?.overdueInvoicesCount || 0}
          icon={AlertTriangle}
          color="text-yellow-400"
        />
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-sm">
        <div className="h-96">
          {" "}
          <Bar data={chartDataConfig} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
