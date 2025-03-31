const express=require("express");
const app=new express();
const mongoose=require("mongoose");
const cors = require("cors");
app.use(cors());
const authRoute=require('./routes/authRoute')
const rideRoute=require('./routes/rideRoute')
const chatbotRoute=require('./routes/chatbotRoute')
const ratingRoute=require('./routes/ratingRoute')

const chatbotRoute=require('./routes/chatbotRoute')

mongoose.connect("mongodb+srv://adithyagunasekara2000:YvovidOF8PJwJoTI@cluster0.ksfu6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
var db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to DB"));
db.once('open', () => console.log("Connected to DB"));
app.use(express.json());


app.use('/api/auth',authRoute)
app.use('/api/ride',rideRoute)
app.use('/api/chatbot',chatbotRoute)
app.use('/api/ride',ratingRoute)
app.use('/api/chatbot',chatbotRoute);


app.listen(2052,()=>{
    console.log("Backend server is running")
});
