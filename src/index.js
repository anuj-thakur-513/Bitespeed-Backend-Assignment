require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// logging
app.use(morgan("short"));

app.get("/", (req, res) => {
  res.send("<h1>Server started</h1>");
});

const init = async () => {
  app.listen(process.env.PORT, () => {
    console.log(`server started on PORT: ${process.env.PORT}`);
  });
};

init();
