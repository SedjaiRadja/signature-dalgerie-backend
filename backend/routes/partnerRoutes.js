const express = require("express");
const router = express.Router();

const {
  applyAsPartner,
} = require("../controllers/partnerController");

router.post("/apply", applyAsPartner);

module.exports = router;