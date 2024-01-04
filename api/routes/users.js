const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const checkAuth=require('../middleware/checkauth');
const User = require('../models/user');




router.post('/signup',(req,res,next)=>{
    User.find({email: req.body.email})
    .then(user=>{
        if(user.length>=1)
        {
            return res.status(409).json({
                message : 'Mail exists'
            })
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err){
                    return res.status(500).json({
                        error: err
                    })
                }else{
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash,
                        name: req.body.name
                    });
                    user.save()
                    .then( result => {
                        console.log(result)
                        res.status(201).json({
                            message: 'user created'
                        })
                    })
                    .catch( err =>{
                        console.log(err);
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })   
        }
    })
    
})


const JWT_KEY = "secret";
router.post('/login', (req,res,next) => {
    User.find({email: req.body.email})
    .then(user => {
        if(user.length < 1)
        {
            return res.status(401).json({
                dep: "123",
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            // console.log(err);
            if(!result)
            {
                console.log(500);
                return res.status(401).json({
                    message: "Auth failed"
                });
            }
            if(result){
                const token = jwt.sign(
                {
                    email: user[0].email,
                    password: user[0]._id
                }
                ,JWT_KEY,
                {
                    expiresIn: "365d"
                }
                
                )
                
                return res.status(200).json({
                    message: 'Auth Successful',
                    token: token,
                    _id: user[0]._id,
                    name: user[0].name,
                    email: user[0].email
                })
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });
});

router.delete('/:email',checkAuth,  (req,res,next) => {
    const useremail =  req.params.email;
    User.find({email: useremail})
    .then(doc => {
        User.remove({_id: doc[0]._id})
        .then( result =>{
            res.status(200).json({
                message: "user deleted successfully"
            })
        })
        .catch( err =>{
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})


module.exports = router;