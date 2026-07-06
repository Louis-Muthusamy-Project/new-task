const express = require('express');
const router = express.Router();

const customerController = require('../../controllers/store/customerController');
const asyncHandler = require('../../utils/asyncHandler');

// Mounted under /api/store
// Admin CRUD for StoreCustomer — Create / Edit / Delete used by the
// Customers tab in StoresTab.jsx.

router.get('/:storeId/admin/customers', asyncHandler(customerController.listCustomers));
router.post('/:storeId/admin/customers', asyncHandler(customerController.createCustomer));
router.get('/:storeId/admin/customers/:id', asyncHandler(customerController.getCustomer));
router.patch('/:storeId/admin/customers/:id', asyncHandler(customerController.updateCustomer));
router.delete('/:storeId/admin/customers/:id', asyncHandler(customerController.deleteCustomer));

module.exports = router;
