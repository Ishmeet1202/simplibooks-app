import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());

// IMPORTING ROUTERS
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/users.routes.js";
import organizationRouter from "./routes/organizations.routes.js";
import clientRouter from "./routes/clients.routes.js";
import invoiceRouter from "./routes/invoices.routes.js";
import expenseRouter from "./routes/expenses.routes.js";
import dasboardRouter from "./routes/dashboard.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/invoices", invoiceRouter);
app.use("/api/v1/expenses", expenseRouter);
app.use("/api/v1/dashboard", dasboardRouter);

export { app };
