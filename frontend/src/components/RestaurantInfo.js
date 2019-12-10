import React, {Component} from 'react';
import { Form, Button, Card, Table } from 'react-bootstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';
import ApolloClient from 'apollo-boost';

import gql from 'graphql-tag';
import '../css/App.css';
const client = new ApolloClient({
    uri : "http://localhost:3001/graphql"
});

class RestaurantInfo extends Component {

    constructor(){
        super();
        this.state = {
            restaurantId : "",
            name : "",
            address : "",
            city : "",
            zip : "",
            contact : "",
            updateMessage : "",
            infoNotFound : false
        }
    }

    componentDidMount(){

        let auth = localStorage.getItem("grubhubToken");
        let updateQuery = gql`
				query getRestaurantInfo($auth : String ){
					getRestaurantInfo(auth : $auth) {
						error,
                        name,
                        address,
                        city,
                        zip,
                        contact
					}
				}
            `;
            
        client.query({
			query: updateQuery,
			variables : {
                auth
			}
		  }).then(data => {
            let {name, address, city, zip, contact} = data.data.getRestaurantInfo;

            this.setState({
                name : name,
                address : address,
                city : city,
                zip : zip,
                contact : contact
            });
		  })
		  .catch(error => {
              console.log(error);
                this.setState({
                    infoNotFound : true
                });
		  });
    }

    submitUpdate = () => {
        let {name, address, city, zip, contact} = this.state;
        let auth = localStorage.getItem("grubhubToken");
        let updateQuery = gql`
				mutation updateRestaurant($name: String, $address: String, $city: String, $zip: String, $contact: String, $auth : String ){
					updateRestaurant(name: $name, address: $address, city : $city, zip : $zip, contact : $contact, auth : $auth) {
						error,
						message
					}
				}
			`;
		
		client.mutate({
			mutation: updateQuery,
			variables : {
                name,
                address,
                city,
                zip,
                contact,
                auth
			}
		  }).then(data => {
			  
				let {error, message} = data.data.updateRestaurant;
				if(error == ""){
					this.setState({
                        updateMessage : "Restaurant Info updated successfully",
                        infoNotFound : false
                    });
				} else {
					this.setState({
                        updateMessage : "Failed to update restaurant Info"
                    });
				}
		  })
		  .catch(error => {
			  	console.log(error);
                  this.setState({
                    updateMessage : "Failed to update restaurant Info"
                });
		  });
    }

    getTableContents = () => {
        
        let { name, address, city, contact, zip} = this.state;
        let tableData = (
            <tbody>
                {/* <tr>
                    <td style={{fontWeight : 'bold', width: '50%'}}>Name</td>
                    <td>{restaurantInfo["Name"]}</td>
                </tr> */}
                <tr>
                    <td style={{fontWeight : 'bold', width: '50%'}}>Name</td>
                    <td>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Control type="text" defaultValue={name}
                                onChange={(e) => this.setState({
                                    name : e.target.value
                                }) }
                            />
                        </Form.Group>
                    </td>
                </tr>
                
                <tr>
                    <td style={{fontWeight : 'bold'}}>Address</td>
                    <td>
                        <Form.Group controlId="formBasicEmail">
                            <Form.Control type="text" defaultValue={address}
                                onChange={(e) => this.setState({
                                    address : e.target.value
                                }) }
                            />
                        </Form.Group>
                    </td>
                </tr>
                <tr>
                    <td style={{fontWeight : 'bold'}}>City</td>
                    <td >
                        <Form.Group controlId="formBasicEmail">
                            <Form.Control type="text" defaultValue={city}
                                onChange={(e) => this.setState({
                                    city : e.target.value
                                }) }
                            />
                        </Form.Group>
                    
                    </td>
                </tr>
                <tr>
                    <td style={{fontWeight : 'bold'}}>ZIP</td>
                    <td >
                        <Form.Group controlId="formBasicEmail">
                            <Form.Control type="text" defaultValue={zip}
                                onChange={(e) => {this.setState({
                                    zip : e.target.value
                                })} }
                            />
                        </Form.Group>
                    </td>
                </tr>
                <tr>
                    <td style={{fontWeight : 'bold'}}>Contact</td>
                    <td >
                        <Form.Group controlId="formBasicEmail">
                            <Form.Control type="text" defaultValue={contact}
                                onChange={(e) => this.setState({
                                    contact : e.target.value
                                }) }
                            />
                        </Form.Group>
                    </td>
                </tr>
                <tr>
                    <td colSpan='2'>
                        <Button onClick={this.submitUpdate} variant="primary" type="submit" block>
                            Update Restaurant Info
                        </Button>
                    </td>

                </tr>
            </tbody>
            
        );
        return tableData;
    }

  	
	render() {
        let redirectVar = null;
		if(!localStorage.getItem('grubhubToken')){
			redirectVar = <Redirect to= "/ownerlogin"/>
		}

        let tableData = this.getTableContents();

        return(
            // className="offset-sm-3 col-sm-8"
            <div >
                {redirectVar}
                
                <Table className="offset-sm-3" style={{width: '50%', marginTop: '2rem'}}>
                <thead>
                    <tr>
                        <th colSpan='2' style={{fontWeight: 'bold', fontSize: '30px'}}>Restaurant Info :</th>
                    </tr>
                </thead>
                    {tableData}
                    {this.state.updateMessage}
                </Table>
			</div>
        );
        
	}
}

export default RestaurantInfo;
