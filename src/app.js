import express from 'express';
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true,limit:"16kb"}));
app.use(express.static("public"))
app.use(cookieParser())

import receiptRouter from "./routes/receipt.routes.js"

app.use("/api/v1/expenses", receiptRouter)

export {app};