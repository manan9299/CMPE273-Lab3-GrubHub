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
	}
	
	type Mutation {
		registerBuyer(name : String, email : String, password : String, contact : String, address : String ) : Status
		registerOwner(name : String, email : String, password : String, contact : String ) : Status
	}
	
	type Status {
		error : String,
		message : String
	}

	type loginStatus {
		error : String,
		token : String
	}
`);

// The root provides a resolver function for each API endpoint
var root = {
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

//Allow Access Control
// app.use(function(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//     res.setHeader('Access-Control-Allow-Credentials', true);
//     res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
//     res.setHeader('Cache-Control', 'no-cache');
//     next();
// });

// app.use(userRouter);
// app.use(restaurantManagementRouter);
// app.use(buyerRouter);
// app.use(orderRouter);

app.listen(3001);
console.log('Server Listening on port 3001');

// var express = require('express');
// var graphqlHTTP = require('express-graphql');
// var { buildSchema } = require('graphql');

// // Construct a schema, using GraphQL schema language
// var schema = buildSchema(`
//   input MessageInput {
//     content: String
//     author: String
//   }

//   type Message {
//     id: ID!
//     content: String
//     author: String
//   }

//   type Query {
//     getMessage(id: ID!): Message
//   }

//   type Mutation {
//     createMessage(input: MessageInput): Message
//     updateMessage(id: ID!, input: MessageInput): Message
//   }
// `);

// // If Message had any complex fields, we'd put them on this object.
// class Message {
//   constructor(id, {content, author}) {
//     this.id = id;
//     this.content = content;
//     this.author = author;
//   }
// }

// // Maps username to content
// var fakeDatabase = {};

// var root = {
//   getMessage: ({id}) => {
//     if (!fakeDatabase[id]) {
//       throw new Error('no message exists with id ' + id);
//     }
//     return new Message(id, fakeDatabase[id]);
//   },
//   createMessage: ({input}) => {
//     // Create a random id for our "database".
//     var id = require('crypto').randomBytes(10).toString('hex');

//     fakeDatabase[id] = input;
//     return new Message(id, input);
//   },
//   updateMessage: ({id, input}) => {
//     if (!fakeDatabase[id]) {
//       throw new Error('no message exists with id ' + id);
//     }
//     // This replaces all old data, but some apps might want partial update.
//     fakeDatabase[id] = input;
//     return new Message(id, input);
//   },
// };

// var app = express();
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));
// app.listen(3001, () => {
//   console.log('Running a GraphQL API server at localhost:4000/graphql');
// });