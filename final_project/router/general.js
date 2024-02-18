const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Get the list of available books
public_users.get('/', function (req, res) {
  // Use JSON.stringify for displaying the output neatly
  const booksList = Object.values(books);
  const formattedBooks = booksList.map(book => {
    return {
      title: book.title,
      author: book.author,
      // Include other relevant details if needed
    };
  });

  // Return the formatted list of books to the user
  return res.status(200).json({ books: formattedBooks });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbnToFind = req.params.isbn;

  // Find the book with the given ISBN
  const book = books[isbnToFind];

  if (book) {
    // Return the details of the book
    return res.status(200).json({ book: book });
  } else {
    // If the book with the given ISBN is not found, return a 404 response
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorToFind = req.params.author;

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' array and check if the author matches the one provided
  const authorBooks = bookKeys.reduce((acc, key) => {
    const book = books[key];
    if (book.author === authorToFind) {
      acc.push({ isbn: key, details: book });
    }
    return acc;
  }, []);

  if (authorBooks.length > 0) {
    // Return the details of the books by the specified author
    return res.status(200).json({ books: authorBooks });
  } else {
    // If no books by the author are found, return a 404 response
    return res.status(404).json({ message: "Books by the author not found" });
  }
});

// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const titleToFind = req.params.title;

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' array and check if the title matches the one provided
  const titleBooks = bookKeys.reduce((acc, key) => {
    const book = books[key];
    if (book.title === titleToFind) {
      acc.push({ isbn: key, details: book });
    }
    return acc;
  }, []);

  if (titleBooks.length > 0) {
    // Return the details of the books with the specified title
    return res.status(200).json({ books: titleBooks });
  } else {
    // If no books with the title are found, return a 404 response
    return res.status(404).json({ message: "Books with the title not found" });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbnToFind = req.params.isbn;

  // Get the book reviews based on ISBN provided in the request parameters
  const bookReviews = books[isbnToFind]?.reviews || {};

  if (Object.keys(bookReviews).length > 0) {
    // Return the reviews for the book with the specified ISBN
    return res.status(200).json({ reviews: bookReviews });
  } else {
    // If no reviews for the book are found, return a 404 response
    return res.status(404).json({ message: "Reviews for the book not found" });
  }
});

// Register a new user
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

module.exports.general = public_users;
