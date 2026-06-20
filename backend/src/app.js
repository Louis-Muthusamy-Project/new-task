const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const routes = require("./routes");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require("cors");
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api", routes);

app.use(require('./middlewares/errorMiddleware'));

module.exports = app;

