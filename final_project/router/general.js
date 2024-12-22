const express = require('express');
let books = require("./booksdb.js");
const { restart } = require('nodemon');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Route to handle user registration
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    console.log("Username: " + username)
    console.log("Pass: " + password)
  
    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user. Missing username or password" });
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {

    new Promise((resolve) => {
        resolve(books);
    })
    .then((data) => {
        return res.status(200).json(data);
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });
    
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn

    console.log("Asked for ISBN " + isbn)

    new Promise((resolve, reject) => {
        book = books[isbn]
        if (book){
            resolve(books[isbn])
        }
        reject(new Error("Book not found"))
    })
    .then((data) => {
            console.log(book.toString())
            return res.status(200).json(data)
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author
    console.log("Asked for Author " + author)

    new Promise((resolve) => {
        resolve(Object.values(books).filter((b) => b.author === author));
    })
    .then((data) => {
        if (data){

            if (data.length > 0) {
                console.log(data.toString())
                return res.status(200).json(data)
            }
            return res.status(400).json({message: "No books found from " + author});
        }
        return res.status(400).json({message: "Author not found"});
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title
    console.log("Asked for Title " + title)

    new Promise((resolve) => {
        resolve(Object.values(books).filter((b) => b.title === title));
    })
    .then((data) => {
        if (data){

            if (data.length > 0) {
                console.log(data.toString())
                return res.status(200).json(data)
            }
            return res.status(400).json({message: "No books found from " + title});
        }
        return res.status(400).json({message: "title not found"});
    })
    .catch((error) => {
        res.status(500).json({ message: error.message });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn

    console.log("Asked for ISBN " + isbn)
    const book = books[isbn]

    if (book){
        console.log(book.toString())
        return res.status(200).json(book.reviews)
    }
    return res.status(400).json({message: "ISBN not found"});
});

module.exports.general = public_users;
