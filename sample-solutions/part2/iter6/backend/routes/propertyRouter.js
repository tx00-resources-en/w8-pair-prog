const express = require("express");
const router = express.Router();
const {
  getAllProperties,
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyControllers");
const auth = require("../middleware/auth");

// GET /api/properties
router.get("/", getAllProperties);

// POST /api/properties
router.post("/", auth, createProperty);

// GET /api/properties/:propertyId
router.get("/:propertyId", getPropertyById);

// PUT /api/properties/:propertyId
router.put("/:propertyId", auth, updateProperty);

// DELETE /api/properties/:propertyId
router.delete("/:propertyId", auth, deleteProperty);

module.exports = router;
