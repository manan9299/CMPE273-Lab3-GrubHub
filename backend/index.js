var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var { buildSchema } = require('graphql')
var graphqlHttp = require('express-graphql');
var cors = require('cors');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var userRouter = require('./routers/users');
var restaurantManagementRouter = require('./routers/restaurantManagement');
var buyerRouter = require('./routers/buyer');
var orderRouter  = require('./routers/orders');

var constants = require('./lib/constants');
var mongoDatabase = require('./mongoDatabase');
var mongodb;
mongoDatabase.getMongoConnection().then((connection) => {
    mongodb = connection;
});
const JWT_KEY = constants.JWT_KEY;

//use cors to allow cross origin resource sharing
// app.use(cors({ origin: 'http://3.88.210.120.82:3000', credentials: true }));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    res.setHeader('Cache-Control', 'no-cache');
    next();
  });

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));


//use express session to maintain session data
// app.use(session({
//     secret              : 'wzex78675jnkm321pkjohi564',
//     resave              : false, // Forces the session to be saved back to the session store, even if the session was never modified during the request
//     saveUninitialized   : false, // Force to save uninitialized session to db. A session is uninitialized when it is new but not modified.
//     duration            : 60 * 60 * 1000,    // Overall duration of Session : 30 minutes : 1800 seconds
//     activeDuration      :  5 * 60 * 1000
// }));

// app.use(bodyParser.json());

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    type Query {
		loginBuyer(email : String, password : String) : loginStatus
		loginOwner(email : String, password : String) : loginStatus
		getRestaurantInfo(auth : String) : Restaurant
		getSections(auth : String) : Sections
	}
	
	type Mutation {
		registerBuyer(name : String, email : String, password : String, contact : String, address : String ) : Status
		registerOwner(name : String, email : String, password : String, contact : String ) : Status
		updateRestaurant(name : String, address : String, city : String, contact : String, zip : String, auth : String ) : Status
		addSection(name : String, auth : String) : Status
		addItem(itemName : String, description : String, price : String, section : String, restaurantId : String, auth : String) : Status
	}
	
	type Status {
		error : String,
		message : String
	}

	type Sections {
		error : String,
		sections : [String],
		restaurantId : String
	}

	type Restaurant {
		error : String,
		name : String,
		address : String,
		city : String,
		zip : String,
		contact : String
	}

	type loginStatus {
		error : String,
		token : String
	}
`);

// The root provides a resolver function for each API endpoint
var root = {
	addItem : async (args) => {
		console.log(args);
		
		try {
			let restaurant = await restaurantManagementRouter.getRestaurantInfo(args);
			console.log("Restaurant Info ")
			console.log(restaurant);

			let {name, address, city, zip, contact} = restaurant;

			let { itemName, description, price, section, restaurantId } = args;

            let restaurantDetails = {
                name : name,
                address : address,
                city : city,
                zip, zip,
                contact : contact
            }
            let item = {
                name : itemName,
                description : description,
                price : price,
                section : section,
                restaurant : restaurantDetails
            }

            let items = mongodb.collection('items');
			let addItemResult = await items.insertOne(item);
			
			return {
				"error" : "",
				"message" : "Item Added Successfully"
			}

		} catch(err) {
			console.log(err);
			return {
				"error" : "Failed to add item",
				"message" : ""
			};
		}
	},
	getSections : async (args) => {
		console.log(args);
		
		try {
			let restaurant = await restaurantManagementRouter.getRestaurantInfo(args);
			console.log("Restaurant Info ")
			console.log(restaurant);
			let { sections, name } = restaurant;
			return {
				"error" : "",
				"sections" : sections,
				"restaurantId" : name
			};

		} catch(err) {
			console.log(err);
			return {
				"error" : "Failed to get Sections Info",
				"sections" : [],
				"restaurantId" : ""
			};
		}
	},
	addSection : async (args) => {
		console.log(args);
		
		try {
			let restaurant = await restaurantManagementRouter.addSection(args);
			console.log("Restaurant Info ")
			console.log(restaurant);

			let sections = restaurant.sections || [] ;
			sections.push(args.name);

			let restaurants = mongodb.collection('restaurants');
			let updateSectionResult = await restaurants.updateOne({ownerEmail : restaurant.ownerEmail}, { $set : {sections : sections} }, {upsert : true});
			
			return {
				"error" : "",
				"message" : "Section Added Successfully"
			}

		} catch(err) {
			console.log(err);
			return {
				"error" : "Failed to add section",
				"message" : ""
			};
		}
	},
	getRestaurantInfo : async (args) => {
		console.log(args);
		
		try {
			let restaurant = await restaurantManagementRouter.getRestaurantInfo(args);
			console.log("Restaurant Info ")
			console.log(restaurant);
			let { name, address, city, zip, contact } = restaurant;
			return {
				"error" : "",
				"name" : name,
				"address" : address,
				"city" : city,
				"zip" : zip,
				"contact" : contact
			};

		} catch(err) {
			console.log(err);
			return {
				"error" : "Failed to get Restaurant Info",
				"name" : "",
				"address" : "",
				"city" : "",
				"zip" : "",
				"contact" : ""
			};
		}
	},
	updateRestaurant : async (args) => {
		console.log(args);
		
		try {
			let restaurant = await restaurantManagementRouter.updateRestaurant(args);
			
			return {
				"message" : "Restaurant Info Updated",
				"error" : ""
			};

		} catch(err) {
			console.log(err);
			return {
				"message" : "",
				"error" : "Failed to Update Restaurant Info"
			};
		}
	},
	loginOwner : async (args) => {
		console.log(args);
		
		try {
			let owner = await userRouter.ownerLogin(args);
			
			let passwordMatches = await bcrypt.compare(args.password, owner.password);
        
			if(!passwordMatches){
				return {
					"token" : "",
					"error" : "Invalid Credentials"
				};
			} else {
				let token = jwt.sign({email : args.email}, JWT_KEY);
				console.log(token);
				return {
					"error" : "",
					"token" : token
				};
			}

		} catch(err) {
			console.log(err);
			return {
				"token" : "",
				"error" : "Login attempt failed"
			};
		}
	},
	
	loginBuyer : async (args) => {
		console.log(args);
		
		try {
			let buyer = await userRouter.login(args);
			
			let passwordMatches = await bcrypt.compare(args.password, buyer.password);
        
			if(!passwordMatches){
				return {
					"token" : "",
					"error" : "Invalid Credentials"
				};
			} else {
				let token = jwt.sign({email : args.email}, JWT_KEY);
				console.log(token);
				return {
					"error" : "",
					"token" : token
				};
			}

		} catch(err) {
			console.log(err);
			return {
				"token" : "",
				"error" : "Login attempt failed"
			};
		}
	},
	registerBuyer : async (args) => {
		console.log(args);
		
		try {
			let results = await userRouter.signUp(args);
			
			return {
				"message" : "Buyer Created",
				"error" : ""
			};

		} catch(err) {
			console.log(err);
			if(err.code == "11000"){
				return {
					"message" : "",
					"error" : "Email used by another user"
				};
			} else {
				return {
					"message" : "",
					"error" : "Failed to Create buyer"
				};
			}
		}
	},
	registerOwner : async (args) => {
		console.log(args);
		
		try {
			let results = await userRouter.ownerSignUp(args);
			
			return {
				"message" : "Owner Created",
				"error" : ""
			};

		} catch(err) {
			console.log(err);
			if(err.code == "11000"){
				return {
					"message" : "",
					"error" : "Email used by another owner"
				};
			} else {
				return {
					"message" : "",
					"error" : "Failed to Create Owner"
				};
			}
		}
	}
};

app.use('/graphql', graphqlHttp({
	schema: schema,
	rootValue: root,
	graphiql: true,
}));

app.listen(3001);
console.log('Server Listening on port 3001');