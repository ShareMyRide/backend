const router = require("express").Router();
const {verifyToken}=require("../Security/auth")
const CustomMessage = require("../models/chatbotData");

const chatbotData = {
    categories: [
      "General",
      "Driver-Specific",
      "Passenger-Specific",
      "Account and Profile",
      "Technical Issues",
      "App Features",
      "Custom Message"
    ],
    questions: {
      "Custom Message":[],
      "General": [

        {
            question: "What is ShareMyRide?",
            answer: "ShareMyRide is a ride-sharing app that connects drivers with passengers traveling along the same route. Drivers can list their routes and available seats, and passengers can join rides easily."
          },
          {
            question: "How do I sign up for ShareMyRide?",
            answer: "Simply click the 'Sign Up' button on the home screen, enter your details, and verify your account through email."
          },
          {
            question: "How can I reset my password?",
            answer: "On the login page, click 'Forgot Password.' Follow the instructions to reset your password via email."
          }
        
      ],
      "Driver-Specific": [

        {
            question: "How can I add a ride?",
            answer: "Go to the 'Add Ride' page, fill in the details like route, time, and available seats, and submit. Your ride will now be visible to potential passengers."
          },
          {
            question: "Can I edit the details of a ride I’ve posted?",
            answer: "Yes, go to the 'My Rides' section, select the ride you want to edit, and update the details."
          },
          {
            question: "How do I remove a ride I posted?",
            answer: "Navigate to 'My Rides,' select the ride, and click the 'Delete' option."
          }
        
      ],
      "Passenger-Specific": [

        {
            question: "How can I find available rides?",
            answer: "Use the search bar on the 'Find Rides' page to enter your starting point and destination. A list of matching rides will appear."
          },
          {
            question: "How do I book a seat?",
            answer: "Select a ride that matches your route and click the 'Book Seat' button."
          },
          {
            question: "What happens if I need to cancel my booking?",
            answer: "You can cancel your booking from the 'My Bookings' section. Note that cancellation policies may apply."
          }
        
      ],
      "Account and Profile": [

        {
            question: "How do I update my profile details?",
            answer: "Go to the 'Profile' page, click 'Edit,' and update your information."
          },
          {
            question: "Can I deactivate my account?",
            answer:"Yes, go to the Settings page and click Deactivate Account. Follow the prompts to confirm."
          },
          {
            question: "How can I view my ride history?",
            answer: "Your ride history can be viewed in the 'History' section. It will show all rides you have posted or booked."
          }
        
      ],
      "Technical Issues": [

        {
            question:" I am having trouble logging in. What should I do?",
            answer: "Ensure you are entering the correct email and password. If the issue persists, try resetting your password."
          },
          {
            question: "The app is not loading properly.",
            answer: "Check your internet connection. If the issue continues, clear your app cache or reinstall the app."
          },
          {
            question: "I am unable to book a ride.",
            answer: " Ensure the ride still has available seats and that your payment method is valid. If you face further issues, contact our support team."
          }
        
      ],
      "App Features": [

        {
            question: "How do I rate a driver or passenger?",
            answer: "After completing a ride, you will be prompted to rate the driver or passenger. You can also rate from the ride history."
          },
          {
            question:"Can I chat with my driver or passenger?",
            answer:"Yes, once a booking is confirmed, you can use the in-app chat feature to communicate with your driver or passenger"
          },
          {
            question:"What happens if the driver cancels the ride?",
            answer:"You wll be notified of the cancellation and receive a refund if you have already paid. You can then book another ride."
          }
        
      ]
    }
  };

  router.post("/chatbot",async (req, res) => {

    const { category, question, customMessage } = req.body;

    if (!category) {
      return res.json({ categories: chatbotData.categories });
    }

    //when we create frontend, we can remove this
    if (!chatbotData.questions[category]) {
      return res.status(400).json({ error: "Invalid category." });
    }
  
    if (question) {
      const foundQuestion = chatbotData.questions[category].find(
        q => q.question.toLowerCase() === question.toLowerCase()
      );
  
      if (foundQuestion) {
        return res.json({ answer: foundQuestion.answer });
      }
  
      return res.json({
        message: "Sorry, I couldn't find an answer to your question. You can send a custom message.",
        suggestion: "To send a custom message, include 'customMessage' in your request body."
      });
    }
    

    if (customMessage) {
      try {
        // Create a new custom message document
        const newMessage = new CustomMessage({
          message: customMessage,
          category: category || "Custom Message" // Use provided category or default to "Custom Message"
        });
        
        // Save to database
        await newMessage.save();
        
        // Respond to the user
        return res.json({
          success: true,
          message: "Thank you for your message! We will review it and improve our chatbot."
        });
      } catch (err) {
        console.error("Error saving custom message:", err);
        return res.status(500).json({
          success: false,
          error: "An error occurred while saving your message. Please try again later."
        });
      }
    }
    
      const questionsList = chatbotData.questions[category].map(q => q.question);
      return res.json({ questions: questionsList });
    });


    module.exports=router;

