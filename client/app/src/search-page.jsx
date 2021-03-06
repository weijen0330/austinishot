import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

import AdvancedSearch from "./advanced-search.jsx"
import NormalSearch from "./normal-search.jsx"
import MessageArea from "./message-area.jsx"

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedSearch: false,
            search: {
                keywords: "",
                tags: "",

                integration: "",          
                linkType: "",

                sentOrReceived: "",            
                timeSent: "",

                domain: "",
                sender: "",                 
            },    
            messages: null        
        }
    }
    
    updateSearchCriteria(state) {
        this.setState({search: state})
    }

    quickSearchClicked() {
        this.setState({advancedSearch: false, messages: null})
    }

    advancedSearchClicked() {    
        this.setState({advancedSearch: true, messages: null})
    }
    
    handleSubmit() {
        let url = "https://lynxapp.me/api/messages/simple-search"
        if (this.state.advancedSearch) {
            url = "https://lynxapp.me/api/messages/advanced-search"
        }

        var headers = new Headers()
        headers.append("Content-Type", "application/json")        

        fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(this.state.search)
        }).then(response => response.json()).then(messages => {
            
            this.setState({messages: messages})
        })
    }

    render() {
        let search, messages;
        if (this.state.advancedSearch) {
            search = <AdvancedSearch updateSearchCriteria={(state) => this.updateSearchCriteria(state)}/>
        } else {
            search = <NormalSearch updateSearchCriteria={(state) => this.updateSearchCriteria(state)}/>
        }

        if (this.state.messages) {
            if (this.state.messages.length) {
                messages = (
                    <MessageArea 
                        fromSearch={true}
                        messages={this.state.messages} 
                        title="Search results" 
                    />
                )
            } else {
                messages = <p style={{textAlign: 'center', marginTop: '25px'}}>No messages match your criteria.</p>
            }
        }

        return (
            <div className="page-content" style={{width: '60%', margin: '0 auto'}}>
                <h1 className="title is-2" style={{textAlign: "center", fontWeight: "lighter", marginTop: '30px'}}>
                    Find your links
                </h1>

                <div className="columns">
                    <div className="column is-half">
                        <a 
                            className={this.state.advancedSearch ? "button is-link" : "button is-link selected"}
                            style={{width: '160px', float: 'right'}}
                            onClick={this.quickSearchClicked.bind(this)}
                        >
                            Quick Search
                        </a>
                    </div>
                    <div className="column is-half">
                        <a 
                            className={this.state.advancedSearch ? "button is-link selected" : "button is-link"}
                            onClick={this.advancedSearchClicked.bind(this)}
                        >
                            Advanced Search
                        </a>
                    </div>
                </div>
                
                {search}

                {/*submit btn*/}
                <div style={{textAlign: 'center'}}>
                    <a 
                        className="button is-primary"
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Submit
                    </a> 
                </div>

                {messages}
            </div>
        )
    }
}
