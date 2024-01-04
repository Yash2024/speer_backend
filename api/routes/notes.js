const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/note');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth=require('../middleware/checkauth');

router.get('/',(req,res,next) => {
    const email= req.body.email

    Note.find({
        sharedWith: {
          $elemMatch: { useremail: email }
        }
      })
    .then(doc =>{
        console.log(doc);
        res.status(200).json(doc);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.get('/:id',(req,res,next) => {
    const id= req.params.id

    Note.find({noteid: id})
    .then(doc =>{
        const t= {
            _id: doc[0]._id,
            noteid: doc[0].noteid,
            title: doc[0].title,
            content: doc[0].content,
            email: doc[0].email,
            sharedWith: doc[0].sharedWith
        }
        console.log(doc);
        res.status(200).json(t);
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})

router.post('/', (req,res,next)=>{
    // console.log('post');
    // console.log(req.body.noteid);
    Note.find({noteid:req.body.noteid})
    .then(note => {
        if(note.length>=1)
        {
            res.status(500).json({
                message: "Note is already added"
            })
        }
        else
        {
            // console.log(req.body.email);

            const note=new Note({
                _id: new mongoose.Types.ObjectId(),
                noteid: req.body.noteid,
                title: req.body.title,
                content: req.body.content,
                email: req.body.email,
                sharedWith: [{useremail:req.body.email}]
            })
            note.save()
            .then(result => {
                console.log(result)
                res.status(200).json({
                    message: "Note added successfully"
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    message: "Something went wrong please try again"
                })
            })
        }
    })
})

router.put('/:id', (req,res,next)=>{
    const noteid = req.params.id;
    console.log(noteid);
    Note.find({noteid: noteid})
    .then(doc=>{
            if(doc.length>=1)
            {
                Note.updateOne(
                    {noteid: noteid},
                    {
                        
                        $set:{
                            title: req.body.title,
                            content: req.body.content,
                            email: req.body.email,
                            sharedWith: req.body.sharedWith
                        }
                    })
                    .then(result => {
                        console.log(result);
                        res.status(200).json(result);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
            }
            else
            {
                res.status(500).json({
                    message: "Note doesn't exists",
                    error: err
                })
            }
        })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: "Note doesn't exists",
            error: err
        })
    })
    
})

router.delete('/:id', (req,res,next)=>{
    const noteid = req.params.id;
    // console.log(id);
    Note.find({noteid: noteid})
    .then(doc => {
        Note.deleteOne({noteid: doc[0].noteid})
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: "Note deleted successfully"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            message: "Note doesn't exists",
            error: err
        })
    })
})

router.post('/:id/share', (req,res,next)=>{

    const noteid = req.params.id;

    const email = req.body.email;
    Note.find({noteid: noteid})
    .then(doc=>{
        if(doc.length>=1)
        {
            const array=doc[0].sharedWith;
            array.push({useremail: email});
            Note.updateOne(
                {noteid: noteid},
                {
                    
                    $set:{
                        sharedWith: array
                    }
                })
                .then(result => {
                    console.log(result);
                    res.status(200).json(result);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    })
                })
        }
        else
        {
            res.status(500).json({
                message: "Note not found"
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error: err
        })
    })
})



module.exports = router;