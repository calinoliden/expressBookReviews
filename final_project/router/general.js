const express = require('express');
const config = require('../config'); // Adjust the path based on your project structure
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the 'users' array
  users.push({ username, password });

  // Return a success message
  return res.status(200).json({ message: "User registered successfully" });
});

// Rest of your code...

module.exports.general = public_users;
