const express = require("express");
const mongoose = require("mongoose");
const bcypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const productsRoutes = require("./routes/products");
const Category = require("./models/Category");

const app = express();

const PORT = 5000;

app.use(express.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://adnan:ecom@cluster0.m2drltj.mongodb.net/ecom?retryWrites=true&w=majority"
);

const useSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", useSchema);

app.use("/api/v1/products", productsRoutes);

app.get("/api/v1/categories", async (req, res) => {
  try {
    const cat = await Category.find();
    res.json(cat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/v1/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "bN*9wL$1@ZsR8cT2", {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on PORT 5000");
});
