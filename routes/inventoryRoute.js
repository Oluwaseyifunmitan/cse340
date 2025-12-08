// routes/inventoryRoute.js
const express = require("express");
const router = new express.Router(); 
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView));

// Route to build the "Add Inventory" form
router.get("/add-inventory",utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory));

// Deliver the add classification form
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  utilities.checkAccountType,
  invValidate.addClassificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);
// ✅ PROCESS THE ADD INVENTORY FORM
// 1. Validate Rules -> 2. Check Data -> 3. Controller
router.post(
  "/add-inventory",
  utilities.checkAccountType,
  invValidate.addInventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

// Route to build the management view
router.get("/",utilities.checkAccountType, utilities.handleErrors(invController.buildManagement));


module.exports = router;