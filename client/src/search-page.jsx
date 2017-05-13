import React from "react";
import {render} from "react-dom";

import AdvancedSearch from "./advanced-search.jsx"
import NormalSearch from "./normal-search.jsx"

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advancedSearch: false,
            search: {
                keywords: "",
                tags: "",

                from: "",          
                type: "",

                sentOrReceived: "",            
                when: "",

                domain: "",
                senderOrReceiver: "", 
            }                       
        }
    }
    
    updateSearchCriteria(state) {
        this.setState({search: state})
    }

    quickSearchClicked() {
        this.setState({advancedSearch: false})
    }

    advancedSearchClicked() {    
        this.setState({advancedSearch: true})
    }
    
    handleSubmit() {
        console.log(this.state)
    }

    render() {
        let search;
        if (this.state.advancedSearch) {
            search = <AdvancedSearch updateSearchCriteria={(state) => this.updateSearchCriteria(state)}/>
        } else {
            search = <NormalSearch updateSearchCriteria={(state) => this.updateSearchCriteria(state)}/>
        }

        return (
            <div className="page-content" style={{width: '60%', margin: '0 auto'}}>
                <h1 className="title is-2" style={{textAlign: "center", fontWeight: "lighter", marginTop: '30px'}}>
                    Find your links
                </h1>

                <div className="columns">
                    <div className="column is-half">
                        <a 
                            className={this.state.advancedSearch ? "button is-outlined" : "button is-outlined is-primary"}
                            style={{width: '160px', float: 'right'}}
                            onClick={this.quickSearchClicked.bind(this)}
                        >
                            Quick Search
                        </a>
                    </div>
                    <div className="column is-half">
                        <a 
                            className={this.state.advancedSearch ? "button is-outlined is-primary" : "button is-outlined"}
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
            </div>
        )
    }
}


/*
                <div style={{display: 'flex', marginBottom: '20px'}}>
                    <div className="search-option left">

                        <button 
                            className={this.state.advancedSearch ? "mdl-button mdl-js-button" : "mdl-button mdl-js-button mdl-button--accent"}
                            onClick={this.switchSearch.bind(this)}
                        >
                            Quick Search
                        </button>

                    </div>
                    <div className="search-option right">
                        <button 
                            className={this.state.advancedSearch ? "mdl-button mdl-js-button mdl-button--accent" : "mdl-button mdl-js-button"}
                            onClick={this.switchSearch.bind(this)}
                        >
                            Advanced Search
                        </button>
                    </div>
                </div>

                {search}

                // submit btn
                <div style={{display: 'flex', marginTop: '30px'}}>
                    <button 
                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" 
                        style={{margin: '0 auto'}}
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Search
                    </button>
                </div> 
*/
