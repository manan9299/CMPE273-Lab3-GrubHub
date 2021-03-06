import React, {Component} from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';
import ApolloClient from 'apollo-boost';

import gql from 'graphql-tag';
import '../css/App.css';
const client = new ApolloClient({
	uri : "http://localhost:3001/graphql"
});
class OwnerLogin extends Component {

  	constructor(props){
		
		super(props);

		this.state = {
			email : "",
			password : "",
			authFlag : false,
			authMessage : "",
			isEmailValid : false,
			isPasswordValid : false,
			redirectToHome : null
		}
		this.emailChangeHandler = this.emailChangeHandler.bind(this);
		this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
		this.submitLogin = this.submitLogin.bind(this);
	}

	submitLogin = (event) => {
		event.preventDefault();
		
		let email = this.state.email;
		let password = this.state.password;

		let loginQuery = gql`
				query loginOwner($email: String, $password: String ){
					loginOwner(email: $email, password: $password) {
						error,
						token
					}
				}
			`;
		
		client.query({
			query: loginQuery,
			variables : {
				email,
				password
			}
		  }).then(data => {
			  
				let {error, token} = data.data.loginOwner;
				if(error == ""){
					localStorage.setItem('grubhubToken', token);
					this.setState({
						authFlag : true,
						authMessage : "",
						redirectToHome : <Redirect to= "/ownerhome"/>
					});
				} else {
					this.setState({
						authFlag : false,
						authMessage : error,
					});
				}
		  })
		  .catch(error => {
			  	console.log(error);
				this.setState({
					authFlag : false,
					authMessage : "Error while logging in",
				});
		  });

		// axios.post('http://localhost:3001/ownerlogin', reqData)
		// 	.then(response => {
		// 		console.log("response is " + JSON.stringify(response));
		// 		if (response.status == 200){
		// 			let status = response.data.status;
		// 			if (status == "200") {
		// 				let token = response.data.token;
		// 				localStorage.setItem('grubhubToken', token);
		// 				this.setState({
		// 					authFlag : true,
		// 					authMessage : "",
		// 					redirectToHome : <Redirect to= "/ownerhome"/>
		// 				});
		// 			} else if (status == "403") {
		// 				this.setState({
		// 					authFlag : false,
		// 					authMessage : "Invalid Credentials",
		// 				});
		// 			} else {
		// 				this.setState({
		// 					authFlag : false,
		// 					authMessage : "Internal Server Error",
		// 				});
		// 			}
		// 		} else {
		// 			this.setState({
		// 				authFlag : false,
		// 				authMessage : "Error while fetching Data from Backend"
		// 			})
		// 		}
		// 	})
	}

	emailChangeHandler = (event) => {
		let email = event.target.value;
		let emailRegex = new RegExp(".+@.+\..+");
		if (email != "" && emailRegex.test(email)){
			this.setState({
				email : email,
				isEmailValid : true
			});
		} else {
			this.setState({
				isEmailValid : false
			});
		}
	}

	passwordChangeHandler = (event) => {
		let password = event.target.value;
		if (password != ""){
			this.setState({
			password : password,
			isPasswordValid : true
			});
		} else {
			this.setState({
			isPasswordValid : false
			});
		}
	}

	render() {
		let redirectVar = null;
		if(cookie.load('grubhubcookie')){
			redirectVar = <Redirect to= "/ownerhome"/>
		}
		let {isEmailValid, isPasswordValid} = this.state;
		let emailErrorMessage = isEmailValid ? "" : "Email is Invalid";
		let passwordErrorMessage = isPasswordValid ? "" : "Password is Invalid";
		let authMessage = this.state.authFlag ? "" : this.state.authMessage;
		let redirectToHome = this.state.redirectToHome;

		return (
			<div className="offset-sm-4 col-sm-3">
				{redirectVar}
				{redirectToHome}
				<Form>
					<Form.Text>
					Partner Sign In
					</Form.Text>
					<Form.Group controlId="ownerEmailId">
						<Form.Label>Email address</Form.Label>
						<Form.Control onChange={this.emailChangeHandler} className='form-group' type="email" />
						{emailErrorMessage}
					</Form.Group>
					<Form.Group controlId="ownerPassword">
						<Form.Label>Password</Form.Label>
						<Form.Control onChange={this.passwordChangeHandler} type="password" />
						{passwordErrorMessage}
						<br/>
						{authMessage}
					</Form.Group>
					<Form.Group>
						<Button onClick={this.submitLogin} variant="danger" type="submit" block>
							Sign In
						</Button>
					</Form.Group>
					<Form.Group>
						<Button variant="link" type="submit" href='ownersignup' block>
							Become a Partner
						</Button>
					</Form.Group>
				</Form>
			</div>
		);
	}
}

export default OwnerLogin;
