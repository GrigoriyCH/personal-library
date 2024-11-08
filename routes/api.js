'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;
require('dotenv').config();

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

// Book schema
const bookSchema = new Schema({
  title: { type: String, required: true },
  comments: { type: [String], default: [] },
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  
  app.route('/api/books')
    
    .get(async function (req, res) {
      try {
        const books = await Book.find();
        const formattedBooks = books.map(book => ({
          _id: book._id,
          title: book.title,
          commentcount: book.comments.length
        }));
        res.json(formattedBooks);
      } catch (error) {
        res.status(500).json({ error: 'Unable to fetch books' });
      }
    })
    
    .post(async function (req, res) {
      const title = req.body.title;
      if (!title) {
        return res.status(200).json('missing required field title');
      }
      
      try {
        const newBook = new Book({ title });
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (error) {
        res.status(500).json({ error: 'Unable to add book' });
      }
    })
    
    .delete(async function(req, res) {
      try {
        await Book.deleteMany();
        res.json('complete delete successful');
      } catch (error) {
        res.status(500).json({ error: 'Unable to delete all books' });
      }
    });

  app.route('/api/books/:id')
    
    .get(async function (req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).json('no book exists');
        }
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (error) {
        res.status(200).json('no book exists');
      }
    })
    
    .post(async function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!comment) {
        return res.json('missing required field comment');
      }

      try {
        const book = await Book.findById(bookid);
        if (!book) {
          return res.status(200).json('no book exists');
        }
        book.comments.push(comment);
        const updatedBook = await book.save();
        res.json({ _id: updatedBook._id, title: updatedBook.title, comments: updatedBook.comments });
      } catch (error) {
        res.status(200).json('no book exists');
      }
    })
    
    .delete(async function (req, res) {
      const bookid = req.params.id;
      try {
        const deletedBook = await Book.findByIdAndDelete(bookid);
        if (!deletedBook) {
          return res.status(200).json('no book exists');
        }
        res.json('delete successful');
      } catch (error) {
        res.status(200).json('no book exists');
      }
    });
};