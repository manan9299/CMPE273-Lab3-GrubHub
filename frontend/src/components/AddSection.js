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

class AddSection extends Component {

    constructor(){
        super();
        this.state = {
            sectionName : "",
            isSectionNameValid : false,
            submitMessage : ""
        }
    }

    addSection = (event) => {
        event.preventDefault();

        if (this.state.isSectionNameValid){
            
            let auth = localStorage.getItem("grubhubToken");

            let query = gql`
                mutation AddSection($name : String, $auth : String ){
                    addSection(name : $name, auth : $auth) {
                        error,
                        message
                    }
                }
            `;
            
            let name = this.state.sectionName;
            console.log("Section Name : ");
            console.log(name);
            client.mutate({
                mutation: query,
                variables : {
                    name,
                    auth
                }
            }).then(data => {
                let {error, message} = data.data.addSection;

                if(error == ""){
                    this.setState({
                        submitMessage : message
                    });
                } else {
                    this.setState({
                        submitMessage : "Failed to insert section",
                    });
                }
            })
            .catch(error => {
                    console.log(error);
                    this.setState({
                        submitMessage : "Failed to insert section",
                    });
            });
        }
	}

    nameChangeHandler = (event) => {
        let sectionName = event.target.value;
        if (sectionName != ""){
			this.setState({
				sectionName : sectionName,
				isSectionNameValid : true
			});
		} else {
            this.setState({
                isSectionNameValid : false
            });
        }
	}

  	
	render() {
        let redirectVar = null;
		if(!localStorage.getItem('grubhubToken')){
			redirectVar = <Redirect to= "/ownerlogin"/>
		}

        let errMessage = this.state.isSectionNameValid ? "" : "Section Name should not be empty";

        return(
            <div className="offset-sm-4 col-sm-3">
                {redirectVar}

                <Form>
					<Form.Text>
					Add a new Menu Section
					</Form.Text>
					<Form.Group >
						<Form.Label>Section Name</Form.Label>
						<Form.Control onChange={this.nameChangeHandler} className='form-group' type="text" />
					</Form.Group>
                    <Form.Group>
                        <Button onClick={this.addSection} variant="primary" type="submit" disabled={!this.state.isSectionNameValid} block>
                            Add Section
                        </Button>
                        <br/>
                        {errMessage}<br/>
                        {this.state.submitMessage}
                    </Form.Group>
				</Form>
			</div>
        );
        
	}
}

export default AddSection;
