const mongoose=require("mongoose");
const customMessageSchema = new mongoose.Schema({

    message: {
         type: String, 
         required: true 
        },
    category: {
         type: String,
         required: false 
        },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
  });
  
  const CustomMessage = mongoose.model("CustomMessage", customMessageSchema);
  module.exports = CustomMessage;