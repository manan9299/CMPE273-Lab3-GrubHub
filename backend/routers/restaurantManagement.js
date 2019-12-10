const express = require('express')
var pool = require('../database');
const ownerAuth = require('../auth');

const router = express.Router();
const jwt = require('jsonwebtoken');

var constants = require('../lib/constants');

const OWNER = constants.OWNER;

var mongoDatabase = require('../mongoDatabase');
var mongodb;
mongoDatabase.getMongoConnection().then((connection) => {
    mongodb = connection;
});

var getRestaurantInfo = (args) => {

    let {auth} = args;

    const token = auth;
    const data = jwt.verify(token, constants.JWT_KEY)
    let ownerEmail = data.email;
    
    let restaurants = mongodb.collection('restaurants');

    return restaurants.findOne({ownerEmail : ownerEmail})
    // .then((restaurant) => {
    //     console.log("Restaurant found ===> " + JSON.stringify(restaurant));
    //     let payload = "";
    //     if(restaurant){
    //         payload = restaurant;
    //     }
    //     res.json({
    //         "status" : 200,
    //         "payload" : payload
    //     });

    // }).catch((err) => {
    //     res.json({
    //         "status" : 404,
    //         "payload" : ""
    //     });
    // });
};

// var getSections = (args) => {

//     let {auth} = args;

//     const token = auth;
//     const data = jwt.verify(token, constants.JWT_KEY)
//     let ownerEmail = data.email;
    
//     let restaurants = mongodb.collection('restaurants');

//     return restaurants.findOne({ownerEmail : ownerEmail});
    // .then((restaurant) => {
        
    //     if(restaurant){
    //         res.json({
    //             "status" : 200,
    //             "payload" : restaurant.sections,
    //             "restaurant_id" : restaurant.name
    //         });
    //     } else {
    //         res.json({
    //             "status" : 200,
    //             "payload" : [],
    //             "restaurant_id" : ""
    //         });
    //     }

    // }).catch((err) => {
    //     res.json({
    //         "status" : 404,
    //         "payload" : [],
    //         "restaurant_id" : ""
    //     });
    // });
    
// };

var updateRestaurant = (args) => {
    let {name, address, city, zip, contact, auth} = args;

    const token = auth;
    const data = jwt.verify(token, constants.JWT_KEY)
    let ownerEmail = data.email;
    
    let restaurants = mongodb.collection('restaurants');

    let restaurantPayload = {
        name : name,
        address : address,
        city : city,
        zip : zip,
        contact : contact,
        ownerEmail : ownerEmail
    };

    return restaurants.updateOne({ownerEmail:ownerEmail}, { $set : restaurantPayload }, {upsert : true})
    // .then((result) => {
    //     let owners = mongodb.collection('owners');

    //     owners.updateOne({email:ownerEmail}, { $set : {restaurantOwned : name} }, {upsert : true}).then((results) => {
    //         res.json({
    //             "status" : 200
    //         });
    //     }).catch((err) => {
    //         res.json({
    //             "status" : 404
    //         });
    //     });
        
    // }).catch((err) => {
    //     console.log(err.toString());
    //     res.json({
    //         "status" : 500
    //     });
    // });
    
};

var addSection = (args) => {

    let {auth} = args;

    const token = auth;
    const data = jwt.verify(token, constants.JWT_KEY)
    let ownerEmail = data.email;
    
    let restaurants = mongodb.collection('restaurants');

    return restaurants.findOne({ownerEmail : ownerEmail});
    
};

// router.post('/addItem', ownerAuth, (req,res) => {

//     if (req.userType == OWNER){
//         let {description, price, section} = req.body;
//         let ownerEmail = req.user.email;

//         let restaurants = mongodb.collection('restaurants');
        
//         restaurants.findOne({ownerEmail : ownerEmail})
//         .then((restaurant) => {
//             let {name, address, city, zip, contact} = restaurant;
//             let restaurantDetails = {
//                 name : name,
//                 address : address,
//                 city : city,
//                 zip, zip,
//                 contact : contact
//             }
//             let item = {
//                 name : req.body.name,
//                 description : description,
//                 price : price,
//                 section : section,
//                 restaurant : restaurantDetails
//             }

//             let items = mongodb.collection('items');
//             items.insertOne(item).then((results) => {
//                 res.json({
//                     "status" : 200
//                 });
//             }).catch((err) => {
//                 console.log("Failed to insert item. Error => " + err.toString());
//                 res.json({
//                     "status" : 200
//                 });
//             })

//         }).catch((err) => {
//             res.json({
//                 "status" : 500
//             });
//         });
//     } else {
//         res.json({
//             "status" : 500
//         });
//     }
// });

exports.updateRestaurant = updateRestaurant;
exports.getRestaurantInfo = getRestaurantInfo;
exports.addSection = addSection;