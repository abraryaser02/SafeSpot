require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 8800;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  }).then(() => {
    console.log("MongoDB connected");
  }).catch((err) => console.error(err));

// Routes
app.use('/api/reports', reportRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  res.status(500).send({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});







// const { configDotenv } = require("dotenv");
// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const app = express();
// const pinRoute = require("./routes/pins");

// dotenv.config();


// // use anything as a json
// app.use(express.json());

// mongoose
//     .connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => {
//     console.log("MongoDB connected");
//     })
//     .catch((err) => console.log(err));

//     app.use("/api/pins", pinRoute);


// app.listen(8800,()=>{
//     console.log("Backend server is running!")
// })


