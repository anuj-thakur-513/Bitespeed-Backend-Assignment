require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const identifyRouter = require("./routes/identify.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// logging
app.use(morgan("short"));
app.use("/identify", identifyRouter);

app.get("/", (req, res) => {
  res.send("<h1>Server started</h1>");
});

const init = async () => {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`server started on PORT: ${PORT}`);
  });
};

init();
