import React from "react";
import {render} from "react-dom";


import Navbar from './navbar.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "home" 
        }

    }

    handleTabClick(newTab) {
        console.log(newTab)
        this.setState({activeTab: newTab})
        return
    }

    render() {
        let content;
        switch (this.state.activeTab) {
            case "home":
                content = <div className="page-content">Home page</div>
                break;
            case "search":
                content = <div className="page-content">Search page</div>
                break;
            case "account":
                content = <div className="page-content">Account page</div>
                break;
        }

        return (
            <div className="mdl-layout mdl-js-layout mdl-layout--fixed-header mdl-layout--fixed-tabs">
                <Navbar activeTab={this.state.activeTab} handleTabClick={this.handleTabClick.bind(this)}/>                
                <main className="mdl-layout__content">
                    {content}
                </main>
            </div>
        )
    }
}