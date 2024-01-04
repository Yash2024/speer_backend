const express = require('express');
const app= express();
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Note = require('./api/models/note');


userRoutes = require('./api/routes/users');
noteRoutes = require('./api/routes/notes');

mongoose.connect('mongodb+srv://node-shop:node-shop@cluster0.giegz.mongodb.net/speer?retryWrites=true&w=majority');



mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())
app.use(cors());

app.use('/api/auth', userRoutes);
app.use('/api/notes', noteRoutes);

app.get('/api/search', (req, res, next) => {
    // const { q: query } = req.query;
    // console.log(query);
    
    const email = req.body.email;  

    const { q: query } = req.query;


    Note.find({
        $and: [
            {
              $or: [
                { content: { $regex: new RegExp(query, 'i') } },
                { title: { $regex: new RegExp(query, 'i') } },
              ],
            },
            { 'sharedWith.useremail': req.body.email },
          ],
      })
      .then(docs => {
        console.log(docs);
        res.status(200).json(docs);
      })
      .catch(err=>{
        res.status(506).json({
            error:err,
            message:'Error searching for notes'
        })
      })



      
  });

app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status=404;
    next(error);
});

app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: "something went wrong"
        }
    });
});

module.exports = app;