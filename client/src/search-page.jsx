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

    switchSearch() {
        let currSearch = this.state.advancedSearch
        this.setState({advancedSearch: !currSearch})
    }

    handleSubmit() {
        console.log(this.state)
    }

    render() {
        let search;
        if (this.state.advancedSearch) {
            search = <AdvancedSearch updateSearchCriteria={(state) => this.updateSearchCriteria(state)}/>
        } else {
            search = <NormalSearch />
        }

        return (
            <div className="page-content">
                <h1 style={{textAlign: 'center'}}>Find your links</h1>
                
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

                {/*submit btn*/}
                <div style={{display: 'flex', marginTop: '30px'}}>
                    <button 
                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" 
                        style={{margin: '0 auto'}}
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Search
                    </button>
                </div>                
            </div>
        )
    }
}
/*
                        <div className="mdl-textfield">
                            <input className="mdl-textfield__input" type="text" id="sample1">
                            <label className="mdl-textfield__label" for="sample1">Text...</label>
                        </div>


                <button className="mdl-button mdl-js-button">
                    Button
                </button>
*/