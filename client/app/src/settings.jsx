import React from "react";
import {render} from "react-dom";

import 'whatwg-fetch';

import AdvancedSearch from "./advanced-search.jsx"
import NormalSearch from "./normal-search.jsx"


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: "integration",  
            facebookChecked: false,
            slackChecked: false,
            gmailChecked: false
        }

        this.handleIntegrationClick = this.handleIntegrationClick.bind(this)
    }

    handleViewChange(view) {
        this.setState({view: view})
    }

    handleIntegrationClick(integration) {
        let clickedOn = !this.state[integration + 'Checked']
        this.setState({[integration + 'Checked']: clickedOn});

        let headers = new Header();
        headers.add("Access-Control-Allow-Credentials", true)

        // turned on integration 
        if (clickedOn) {
            fetch('https://lynxapp.me/api/auth/' + integration + "_oauth",{
                method: "GET",
                headers: headers
            })
                .then(response => {
                    return response.text()
                })
                .then(console.log)
                .catch(console.log)
        } else { // turned off
            // call another endpoint to turn off
        }
    }

    render() {
        var content = ""

        switch (this.state.view) {
            case "integration":
                content = (
                    <div style={{width: '60%', margin: '0 auto'}}>
                        <h1 className="title is-2" style={{textAlign: "center", fontWeight: "lighter", marginTop: '30px'}}>
                            Integrations
                        </h1>

                        <div className="content">                            
                            <div style={{paddingBottom:'20px'}}>                       
                                Facebook
                                <input 
                                    onClick={() => this.handleIntegrationClick('facebook')} 
                                    type="checkbox" id="switch1" 
                                    className="switch" 
                                    checked={this.state.facebookChecked ? "checked" : ""}
                                />
                                <label htmlFor="switch1">&nbsp;</label>                            
                            </div>
                            <div style={{paddingBottom:'20px'}}>                       
                                Slack
                                <input 
                                    type="checkbox" 
                                    id="switch2" 
                                    className="switch" 
                                    onClick={() => this.handleIntegrationClick('slack')} 
                                    checked={this.state.slackChecked ? "checked" : ""}
                                />
                                <label htmlFor="switch2">&nbsp;</label>                            
                            </div>
                            <div style={{paddingBottom:'20px'}}>                       
                                Gmail
                                <input 
                                    type="checkbox" 
                                    id="switch3" 
                                    className="switch" 
                                    onClick={() => this.handleIntegrationClick('gmail')} 
                                    checked={this.state.gmailChecked ? "checked" : ""}
                                />
                                <label htmlFor="switch3">&nbsp;</label>
                            </div>
                        </div>                        
                    </div>
                )
                break;
        }

        return (
            <div className="columns" style={{height: '100vh'}}>
                <div className="column is-3" style={{paddingLeft: '24px', borderRight: '1px solid #dbdbdb'}}>
                    <p 
                        style={{marginTop: '35px', marginBottom: '10px'}}
                        className={this.state.view == "account" ? "sidebar-option is-selected" : "sidebar-option"}
                        onClick={this.handleViewChange.bind(this, "account")}
                    >
                        <span className="icon">
                            <i className="fa fa-user-circle"></i>
                        </span>
                        
                        <span style={{marginLeft: '7px'}}>Account</span>					
                    </p>

                    <p 
                        style={{marginBottom: '10px'}}
                        className={this.state.view == "integration" ? "sidebar-option is-selected" : "sidebar-option"}
                        onClick={this.handleViewChange.bind(this, "integration")}
                    >
                        <span className="icon">
                            <i className="fa fa-cogs"></i>
                        </span>
                        
                        <span style={{marginLeft: '7px'}}>Integrations</span>					
                    </p>
                </div>
                <div className="column is-9" style={{paddingRight: '24px'}}>
                    {content}
                </div>
            </div>
        )
    }
}
