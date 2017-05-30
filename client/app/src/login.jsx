import React from "react";
import {render} from "react-dom";
import {Link} from "react-router-dom";

import Textfield from "./textfield.jsx"

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: "",
            error: null              
        }
    }

    handleInputChange(prop, value) {
        this.setState({[prop] : value})        
    }

    handleSignin() {
        console.log("state", this.state)
    }

    render() {        
        let error 
        if (this.state.error) {
            error = (
                <article className="message is-danger">
                    <div className="message-body">{this.state.error}</div>
                </article>     
            )
        }

        return (                    
            <div>
                <section className="section">
                    <div className="container content-middle">
                        {error}

                        {/*email*/}
                        <Textfield
                            handleChange={(propName, value) => this.handleInputChange(propName, value)}
                            label="Email"
                            propName="email"
                            inputType="email"
                        >
                            <i className="fa fa-envelope"></i>
                        </Textfield>

                        {/*password*/}
                        <Textfield
                            handleChange={(propName, value) => this.handleInputChange(propName, value)}
                            label="Password"
                            propName="password"
                            inputType="password"
                        >
                            <i className="fa fa-lock"></i>
                        </Textfield>

                        {/*submit btn*/}
                        <div className="field" style={marginTop}>
                            <p className="control">
                                <button className="button is-primary" onClick={this.handleSignIn.bind(this)}>
                                    Sign in
                                </button>
                            </p>
                        </div>  

                        <div style={{textAlign: 'right'}}>
                            <p>No account?</p>
                            <Link to="/signup" className="button is-link">Sign up</Link>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}