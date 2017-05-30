import React from "react";
import {render} from "react-dom";
import Browse from "./browse.jsx";
// import * as Socket from 'socket.io-client';


import Navbar from './navbar.jsx'
import SearchPage from './search-page.jsx'
import Settings from './settings.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "browse" 
        }

    }

    componentDidMount() {
        let ws = io("https://lynxapp.me")
        // example of how to send data - if needed
        // ws.emit("message", "this is some data")
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
            case "settings":
                content = <Settings />
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