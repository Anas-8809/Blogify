require("dotenv").config();

const path = require("path");
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const Blog = require("./models/blog");
const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const app = express();
const PORT = process.env.PORT;


// for local : 'mongodb://localhost:27017/blogify'
mongoose.connect(process.env.MONGO_URL)
  .then((e) => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err)); // Add error handling

app.set('view engine', "ejs");
app.set('views', path.resolve('./views'));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public"))); //for using images from public

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { error: err });
});

app.get("/", async (req, res, next) => {
  try {
    const allBlogs = await Blog.find({});
    res.render("home", {
      user: req.user,
      blogs: allBlogs,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));