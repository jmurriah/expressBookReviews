const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

// Function to check if the user is authenticated
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        console.log("Matching user & pass. Autenticated")
        return user.username === username && user.password === password;
    });
    console.log("Not matching user & pass")
    return validusers.length > 0;
};


// Route to handle user login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
          data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
          accessToken, username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    console.log("Entering Put /auth/review/:isbn")
    if (req.session.authorization) { // Get the authorization object stored in the session
        token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
        jwt.verify(token, "access", (err, user) => { // Use JWT to verify token
            if (!err) {
                req.user = user;
                let username = req.session.authorization.username;
                let review = req.body.review;
                let isbn = req.params.isbn;

                const book = books[isbn];
                if (!book){
                    return res.status(400).json({message: "ISBN not found"});
                }
                
                const fullReview = { "username": {username}, "review":{review} };
                console.log(fullReview);
                book.reviews[username] = {review};
                return res.status(200).json({review});;

            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
    return res.status(403).json({ message: "User not logged in" });
    }

});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    console.log("Entering Delete /auth/review/:isbn")
    if (req.session.authorization) { // Get the authorization object stored in the session
        token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
        jwt.verify(token, "access", (err, user) => { // Use JWT to verify token
            if (!err) {
                req.user = user;
                let username = req.session.authorization.username;
                let isbn = req.params.isbn;

                const book = books[isbn];
                if (!book){
                    return res.status(400).json({message: "ISBN not found"});
                }
                book.reviews[username] = {};
                return res.status(200).json({message: "Review deleted"});;

            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
    return res.status(403).json({ message: "User not logged in" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
