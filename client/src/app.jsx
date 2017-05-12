import React from "react";
import {render} from "react-dom";
import Activity from "./Activity.jsx";


import Navbar from './navbar.jsx'
import SearchPage from './search-page.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "activity" 
        }

    }

    handleTabClick(e, newTab) {
        e.preventDefault()
        this.setState({activeTab: newTab})
    }

    render() {        

        let content;
        switch (this.state.activeTab) {
            case "activity":
                content = <Activity />
                break;
            case "search":
                content = <SearchPage />
                break;
            case "account":
                content = <div className="page-content">Account page</div>
                break;
        }

        return (
            <div className="mdl-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
                <Navbar 
                    activeTab={this.state.activeTab} 
                    handleTabClick={this.handleTabClick.bind(this)}
                />                
                {content}
            </div>
        )

    }
}