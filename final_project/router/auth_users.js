const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //write code to check if the username is valid
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  //write code to check if username and password match the ones we have in records
  return users.some(user => user.username === username && user.password === password);
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) { 
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Validate the username
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username" });
  }

  // Authenticate the user
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Sign in the user and create a JWT
  const token = jwt.sign({ username }, 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, { expiresIn: '1h' });

  // Return the JWT as a response
  return res.status(200).json({ token });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { token } = req.headers;

  // Check if the token is provided
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Verify the JWT and extract the username
    const decoded = jwt.verify(token, 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);
    const username = decoded.username;

    const isbnToReview = req.params.isbn;
    const reviewText = req.query.review;

    // Check if the ISBN and review text are provided
    if (!isbnToReview || !reviewText) {
      return res.status(400).json({ message: "ISBN and review text are required" });
    }

    // Check if the book with the given ISBN exists
    const book = books[isbnToReview];

    if (book) {
      // Check if the user has already posted a review for this book
      if (book.reviews && book.reviews[username]) {
        // If the user has already posted a review, modify the existing review
        book.reviews[username] = reviewText;
        return res.status(200).json({ message: "Review modified successfully" });
      } else {
        // If the user has not posted a review, add a new review
        if (!book.reviews) {
          book.reviews = {};
        }
        book.reviews[username] = reviewText;
        return res.status(200).json({ message: "Review added successfully" });
      }
    } else {
      // If the book with the given ISBN is not found, return a 404 response
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
    // Verify the JWT and extract the username
    const decoded = jwt.verify(token, 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);
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
