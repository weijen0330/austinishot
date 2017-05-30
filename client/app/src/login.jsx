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

    handleSignIn() {
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

                <nav className="nav">
                    <div className="nav-left">
                        <a className="nav-item">
                            <img src="../img/logoGreen.png" alt="Bulma logo" /> Lynx
                        </a>
                    </div>
                    <div className="nav-right nav-menu">

                        <div className="nav-item">
                            <div className="field is-grouped">
                                
                                <p className="control">
                                    <a className="button is-primary" href="https://lynxapp.me/app/#/signup">
                                        <span className="icon">
                                            <i className="fa fa-sign-in" aria-hidden="true"></i>
                                        </span>
                                        <span>Sign Up</span>
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </nav>                

                 
                <section className="section">
                    <div className="container content-middle">
                        <h1 style={{textAlign: 'center'}} className="title">Log In</h1>

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
                        <div className="field" style={{marginTop: '15px'}}>
                            <p className="control">
                                <button className="button is-primary" onClick={this.handleSignIn.bind(this)}>
                                    Sign in
                                </button>
                            </p>
                        </div>  
                    </div>
                </section>
            </div>
        )
    }
}
/*
                                <p className="control">
                                    <a className="button" href="https://lynxapp.me/app/#/login">
                                        <span className="icon">
                                            <i className="fa fa-user" aria-hidden="true"></i>
                                        </span>
                                        <span>Login</span>
                                    </a>
                                </p>
*/