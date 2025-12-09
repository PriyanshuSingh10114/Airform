const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  // Prevent Airtable from embedding callback page in an iframe
  res.setHeader("X-Frame-Options", "DENY");
  next();
});


// CORS needs credentials enabled for sessions to work
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// Session middleware (IMPORTANT for OAuth state)
app.use(
  session({
    name: "airform.sid",
    secret: "someRandomSecretKey123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,       // MUST be false for localhost
      sameSite: "lax",     // IMPORTANT → must be lax
    }
  })
);


app.use(express.json());

// Serve static files (uploads)
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/forms", require("./routes/formRoutes"));
app.use("/responses", require("./routes/responseRoutes"));
app.use("/webhooks", require("./routes/webhookRoutes"));

app.get("/", (req, res) => {
  res.send("AirForm Backend Running");
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log("Server running on port", PORT));
