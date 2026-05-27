const express = require('express');
const axios = require('axios');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';

// Task 10
const getAllBooksUsingAxios = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Task 11
const getBookByISBNAxios = async (isbn) => {
  const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
  return response.data;
};

// Task 12
const getBooksByAuthorAxios = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Task 13
const getBooksByTitleAxios = async (title) => {
  const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
  return response.data;
};

const getAllBooks = () => {
  return new Promise((resolve) => {
    resolve(books);
  });
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: 'Book not found' });
    }
  });
};

const getBooksByAuthor = async (author) => {
  const allBooks = await getAllBooks();
  const result = {};

  Object.keys(allBooks).forEach((isbn) => {
    if (allBooks[isbn].author.toLowerCase() === author.toLowerCase()) {
      result[isbn] = allBooks[isbn];
    }
  });

  return result;
};

const getBooksByTitle = async (title) => {
  const allBooks = await getAllBooks();
  const result = {};

  Object.keys(allBooks).forEach((isbn) => {
    if (allBooks[isbn].title.toLowerCase() === title.toLowerCase()) {
      result[isbn] = allBooks[isbn];
    }
  });

  return result;
};

public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: 'User successfully registered. Now you can login'
  });
});

public_users.get('/', async (req, res) => {
  try {
    const bookList = await getAllBooks();
    return res.status(200).json(bookList);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books' });
  }
});

public_users.get('/isbn/:isbn', (req, res) => {
  getBookByISBN(req.params.isbn)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json(error));
});

public_users.get('/author/:author', async (req, res) => {
  const result = await getBooksByAuthor(req.params.author);

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: 'No books found for this author' });
  }

  return res.status(200).json(result);
});

public_users.get('/title/:title', async (req, res) => {
  const result = await getBooksByTitle(req.params.title);

  if (Object.keys(result).length === 0) {
    return res.status(404).json({ message: 'No books found for this title' });
  }

  return res.status(200).json(result);
});

public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: 'Book not found' });
  }

  if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
    return res.status(200).json({ message: 'No reviews found for this book.' });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
module.exports.getAllBooksUsingAxios = getAllBooksUsingAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBooksByAuthorAxios = getBooksByAuthorAxios;
module.exports.getBooksByTitleAxios = getBooksByTitleAxios;