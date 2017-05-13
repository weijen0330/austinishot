import React from "react";
import {render} from "react-dom";
import Browse from "./browse.jsx";


import Navbar from './navbar.jsx'
import SearchPage from './search-page.jsx'
import Account from './account.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "search" 
        }

    }

    handleTabClick(e, newTab) {
        e.preventDefault()
        this.setState({activeTab: newTab})
    }

    render() {        

        let content;
        switch (this.state.activeTab) {
            case "browse":
                content = <Browse />
                break;
            case "search":
                content = <SearchPage />
                break;
            case "account":
                content = <Account />
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