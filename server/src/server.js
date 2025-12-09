const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  next();
});


app.set("trust proxy", 1);


app.use(cors({
  origin: "https://airform-tau.vercel.app",
  credentials: true
}));

app.options("*", cors());

app.use(
  session({
    name: "airform.sid",
    secret: process.env.SESSION_SECRET,   
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(express.json());

const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


app.use("/auth", require("./routes/authRoutes"));
app.use("/forms", require("./routes/formRoutes"));
app.use("/responses", require("./routes/responseRoutes"));
app.use("/webhooks", require("./routes/webhookRoutes"));

app.get("/", (req, res) => {
  res.send("AirForm Backend Running");
});


const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log("Server running on port", PORT));
