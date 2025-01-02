const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../Security/auth');
const secretKey = 'project@shareMyRide';

