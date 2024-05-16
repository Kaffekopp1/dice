const express = require("express");
const router = express.Router();
const diceController = require("../controllers/diceController");

router.get("/test", diceController.getTest);
router.get("/throws", diceController.getThrows);

module.exports = router;
