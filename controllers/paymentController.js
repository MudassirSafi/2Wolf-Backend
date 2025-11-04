import Stripe from "stripe";
import Order from "../Models/Order.js";
import Product from "../Models/product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ⚠️ Use a proper rate — You can also make this dynamic via API if you want.
const PKR_TO_USD_RATE = 280; // 1 USD ≈ 280 PKR

// ==============================
// 🟢 CREATE CHECKOUT SESSION
// ==============================
export const createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.body;

    // ✅ Find order and populate product details
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Build Stripe line items
    const lineItems = order.products.map((item) => {
      const pricePKR = Number(item.productId.price) || 0;

      // ⚙️ Convert PKR to USD properly
      const priceUSD = pricePKR / PKR_TO_USD_RATE;

      // ✅ Stripe expects amount in cents (integer)
      const amountInCents = Math.round(priceUSD * 100);

      // ⚠️ Prevent $0 items (Stripe rejects them)
      if (amountInCents < 50) {
        throw new Error(`Invalid price for product: ${item.productId.name}`);
      }

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.productId.name,
            description: item.productId.description || "No description",
            images: item.productId.images ? [item.productId.images[0]] : [],
          },
          unit_amount: amountInCents,
        },
        quantity: item.quantity,
      };
    });

    // ✅ Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("❌ Stripe checkout error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// 🟢 VERIFY CHECKOUT SESSION
// ==============================
export const verifyCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // ✅ Expand payment_intent for real-time status
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent"],
    });

    const orderId = session.metadata?.orderId || null;
    let finalStatus = session.payment_status || "unknown";

    // ✅ Robust check for paid status
    if (
      session.payment_intent?.status === "succeeded" ||
      session.payment_status === "paid" ||
      session.payment_status === "complete"
    ) {
      finalStatus = "paid";

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "Done" });
      }
    }

    console.log(`💳 Verify: Session ${session.id} → ${finalStatus}`);

    return res.json({
      success: true,
      payment_status: finalStatus,
      orderId,
    });
  } catch (error) {
    console.error("❌ Stripe verify error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
