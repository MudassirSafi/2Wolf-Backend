const express  =require ("express");
const { createOrder, 
       getAllOrders, 
       getOrderById, 
        updateOrder,
        deleteOrder} =require ("../Controllers/orderController.js");
const { protect,authorize } =require ("../middlewares/auth.js");


const router = express.Router();

// 🛍️ Create new order (requires login)
router.post("/", protect, createOrder);

// 👑 Admin routes
router.get("/", protect,  getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect,  updateOrder);
router.delete("/:id", protect, deleteOrder);

module.exports = router;
