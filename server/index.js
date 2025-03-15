require("dotenv").config(); // Load environment variables

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // For cookie-based tracking
const requestIp = require("request-ip"); // For IP tracking

const app = express();

// Enable CORS
app.use(cors({ 
  origin: "https://assignment-r5h2apt89-kola-bhavani-prasads-projects.vercel.app", 
  credentials: true 
}));
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Enable cookies
app.use(requestIp.mw()); // Get IP from requests

// Use MongoDB connection from .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// List of available coupons
const couponList = ["Coupon1", "Coupon2", "Coupon3", "Coupon4", "Coupon5", "Coupon6"];

const CouponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  code: { type: String, required: true },
  lastClaimedAt: { type: Date, default: null },
  ip: { type: String, required: true } // Store user's IP
});

const Coupon = mongoose.model("Coupon", CouponSchema);

// Define wait time (30 seconds)
const WAIT_TIME = 30 * 1000; // 30 seconds

// Store countdown timers for each IP
const waitTimes = {};

// API Route to Claim Coupon (Sequential and Circular Restriction)
app.post("/api/coupons/add-coupon", async (req, res) => {
  try {
      const { code } = req.body;
      const userIp = req.clientIp;
      // const { code } = req.body;
      console.log("Received coupon code:", code);
      
      if (!code || !couponList.includes(code)) {
          return res.status(400).json({ message: "Invalid coupon selection." });
      }

      const claimedCoupons = await Coupon.find({ ip: userIp }).sort({ lastClaimedAt: 1 });
      const claimedCodes = claimedCoupons.map(c => c.code);

      // ✅ Fix: Allow new users to claim any first coupon
      if (claimedCoupons.length === 0) {
          // This is the first claim for the user, allow any selection
      } else {
          // Get the last claimed coupon
          const lastClaimedCoupon = claimedCoupons.length ? claimedCoupons[claimedCoupons.length - 1] : null;

          if (lastClaimedCoupon) {
              const timeSinceLastClaim = new Date() - lastClaimedCoupon.lastClaimedAt;

              // ⏳ Enforce wait time before claiming next coupon
              if (timeSinceLastClaim < WAIT_TIME) {
                  const timeRemaining = Math.ceil((WAIT_TIME - timeSinceLastClaim) / 1000);
                  return res.status(403).json({ message: `You must wait ${timeRemaining} seconds before claiming another coupon.` });
              }
          }

          // 🔄 Circular claiming: Start sequential claiming after the first coupon
          let nextCouponIndex = claimedCodes.length % couponList.length;
          if (claimedCodes.length === couponList.length) {
              nextCouponIndex = 0;  // Reset to start from Coupon1
          }
          const expectedNextCoupon = couponList[nextCouponIndex];

          if (code !== expectedNextCoupon) {
              return res.status(403).json({ message: `You must claim ${expectedNextCoupon} next before claiming ${code}.` });
          }
      }

      // Generate userId
      const newUserId = new mongoose.Types.ObjectId();

      const newCoupon = new Coupon({
          userId: newUserId,
          code,
          lastClaimedAt: new Date(),
          ip: userIp
      });
      await newCoupon.save();

      res.cookie("claimedCoupon", "true", { maxAge: WAIT_TIME, httpOnly: true });

      res.status(201).json({ 
          message: `Coupon ${code} assigned successfully!`, 
          coupon: { userId: newUserId.toString(), code }
      });

  } catch (err) {
      res.status(500).json({ message: "Database error", error: err.message });
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ⏳ Print remaining wait time every second
setInterval(() => {
  Object.keys(waitTimes).forEach(ip => {
    if (waitTimes[ip] > 0) {
      console.log(`⏳ IP ${ip} must wait ${waitTimes[ip]} seconds before claiming another coupon.`);
      waitTimes[ip]--; // Decrease the remaining time by 1 second
    } else {
      console.log(`✅ IP ${ip} can now claim a coupon.`);
      delete waitTimes[ip]; // Remove from tracker when countdown reaches 0
    }
  });
}, 1000);
