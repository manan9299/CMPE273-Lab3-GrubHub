import React, {Component} from 'react';
import { Form, Button, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import cookie from 'react-cookies';
import {Redirect} from 'react-router';
import SectionDropdown from './SectionDropdown';
import constants from '../config/constants';
import ApolloClient from 'apollo-boost';

import gql from 'graphql-tag';
import '../css/App.css';
const client = new ApolloClient({
    uri : "http://localhost:3001/graphql"
});

class AddItem extends Component {

    constructor(){
        super();
        this.state = {
            name : "",
            description : "",
            price : "",
            section : "",
            restaurantId : "",
            sectionItems : [],
            submitMessage : ""
        }
    }

    componentDidMount(){

        let auth = localStorage.getItem("grubhubToken");
        let query = gql`
				query getSections($auth : String ){
					getSections(auth : $auth) {
                        error,
                        sections
					}
				}
            `;
            
        client.query({
			query: query,
			variables : {
                auth
			}
		  }).then(data => {
            let {sections, name} = data.data.getSections;

            this.setState({
                sectionItems : sections,
                restaurantId : name
            })
            
		  })
		  .catch(error => {
              console.log(error);
                this.setState({
                    infoNotFound : true
                });
		  });
    }

    addItem = (event) => {
        event.preventDefault();
        let {name, description, price, section, restaurantId} = this.state;

        let auth = localStorage.getItem("grubhubToken");

        let query = gql`
            mutation addItem($itemName : String, $description : String, $price : String, $section : String, $restaurantId : String, $auth : String ){
                addItem(itemName : $itemName, description : $description, price : $price, section : $section, restaurantId : $restaurantId, auth : $auth) {
                    error,
                    message
                }
            }
        `;
        
        let itemName = name;
        console.log("Section Name : ");
        console.log(name);
        client.mutate({
            mutation: query,
            variables : {
                itemName,
                description,
                price,
                section,
                restaurantId,
                auth
            }
        }).then(data => {
            let {error, message} = data.data.addItem;

            if(error == ""){
                this.setState({
                    submitMessage : "Item Added Successfully"
                });
            } else {
                this.setState({
                    submitMessage : "Failed to add Item",
                });
            }
        })
        .catch(error => {
                console.log(error);
                this.setState({
                    submitMessage : "Failed to add Item",
                });
        });        
	}

    nameChangeHandler = (event) => {
        let name = event.target.value;
        if (name != ""){
			this.setState({
				name : name
			});
		}
    }
    
    descriptionChangeHandler = (event) => {
        let description = event.target.value;
        if (description != ""){
			this.setState({
				description : description
			});
		}
    }
    
    priceChangeHandler = (event) => {
        let price = event.target.value;
        if (price != ""){
			this.setState({
				price : price
			});
		}
    }
    
    sectionChangeHandler = (sectionName) => {
        console.log("Selected Section" + sectionName);
        this.setState({
            section : sectionName
        });
    }

  	
	render() {
        let redirectVar = null;
		if(!localStorage.getItem('grubhubToken')){
			redirectVar = <Redirect to= "/ownerlogin"/>
		}

        return(
            <div className="offset-sm-4 col-sm-3">
                {redirectVar}

                <Form>
					<Form.Text>
					Item Details : 
					</Form.Text>
					<Form.Group >
						<Form.Label>Item Name</Form.Label>
						<Form.Control onChange={this.nameChangeHandler} className='form-group' type="text" />
					</Form.Group>
                    <Form.Group >
						<Form.Label>Description</Form.Label>
						<Form.Control onChange={this.descriptionChangeHandler} className='form-group' type="text" />
					</Form.Group>
                    <SectionDropdown label="Section" onClick={this.sectionChangeHandler} items={this.state.sectionItems} />
                    <Form.Group >
						<Form.Label>Price</Form.Label>
						<Form.Control onChange={this.priceChangeHandler} className='form-group' type="text" />
					</Form.Group>
                    <Form.Group>
                        <Button onClick={this.addItem} variant="primary" type="submit" block>
                            Add Item
                        </Button>
                    </Form.Group>
                    {this.state.submitMessage}
				</Form>
			</div>
        );
        
	}
}

export default AddItem;
