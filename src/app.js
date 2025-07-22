import express from 'express';
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const app = express();

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())

import receiptRouter from "./routes/receipt.routes.js"
import expenseRoute from "./routes/expense.routes.js"

app.use("/api/v1/expenses", receiptRouter)
app.use("/api/v1", expenseRoute);

app.use(errorHandler)

export { app };