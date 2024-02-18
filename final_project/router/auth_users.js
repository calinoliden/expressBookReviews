const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const config = require('../config'); // Adjust the path based on your project structure
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) { 
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '1h' });

  return res.status(200).json({ token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }  

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const username = decoded.username;

    const isbnToReview = req.params.isbn;
    const reviewText = req.query.review;

    if (!isbnToReview || !reviewText) {
      return res.status(400).json({ message: "ISBN and review text are required" });
    }

    const book = books[isbnToReview];

    if (book) {
      if (book.reviews && book.reviews[username]) {
        book.reviews[username] = reviewText;
        return res.status(200).json({ message: "Review modified successfully" });
      } else {
        if (!book.reviews) {
          book.reviews = {};
        }
        book.reviews[username] = reviewText;
        return res.status(200).json({ message: "Review added successfully" });
      }
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const username = decoded.username;

    const isbnToDelete = req.params.isbn;

    // Check if the ISBN is provided
    if (!isbnToDelete) {
      return res.status(400).json({ message: "ISBN is required" });
    }

    // Check if the book with the given ISBN exists
    const book = books[isbnToDelete];

    if (book) {
      // Check if the user has posted a review for this book
      if (book.reviews && book.reviews[username]) {
        // If the user has posted a review, delete the review
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully" });
      } else {
        // If the user has not posted a review, return a 404 response
        return res.status(404).json({ message: "Review not found" });
      }
    } else {
      // If the book with the given ISBN is not found, return a 404 response
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
