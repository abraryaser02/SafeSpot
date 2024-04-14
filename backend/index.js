const { configDotenv } = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const pinRoute = require("./routes/pins");

dotenv.config();


// use anything as a json
app.use(express.json());

mongoose
    .connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
    console.log("MongoDB connected");
    })
    .catch((err) => console.log(err));

    
    app.use("/api/pins", pinRoute);


app.listen(8800,()=>{
    console.log("Backend server is running!")
})