const Router = require("express");
const { handleIdentify } = require("../controllers/identify.controller");

const identifyRouter = Router();

identifyRouter.post("/", handleIdentify);

module.exports = identifyRouter;
