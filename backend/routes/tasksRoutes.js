const express = require("express")
const { protect, authorize } = require("../middleware/auth");
const router = express.Router();

const { createDelivery, getDelivery, updateDelivery, 
    deleteDelivery, acceptDelivery, rejectDelivery, 
updateDeliveryStatus } = require("../controllers/deliveryController")
const { assignRiderToDelivery, getAssignedDeliveries, 
    getRiderAssignedDeliveries } = require("../controllers/assignmentController")

router.post('/delivery/:deliveryId/assign', protect, assignRiderToDelivery)
router.get('/delivery/assigned', protect,  getAssignedDeliveries)
router.get('/delivery/:riderId/assigned', protect, getRiderAssignedDeliveries)


router.post('/delivery', protect, authorize("retailer"), createDelivery)
router.get('/delivery', protect, authorize("retailer", "dispatcher"), getDelivery)
router.put('/delivery/update/:id', protect, authorize("retailer"), updateDelivery)
router.delete('/delivery/delete/:id', protect, authorize("retailer"), deleteDelivery)

router.patch('/delivery/:deliveryId/accept', protect, authorize("rider"), acceptDelivery)
router.patch('/delivery/:deliveryId/reject', protect, authorize("rider"), rejectDelivery)

router.patch('/delivery/:deliveryId/status', protect, authorize("rider"), updateDeliveryStatus)


module.exports = router;