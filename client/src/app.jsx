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
            activeTab: "settings" 
        }

    }

    componentDidMount() {
        console.log(io)
        let ws = io("http://localhost:1234")
        ws.emit("message", "this is some data")
        console.log(ws)
        // let ws = new WebSocket("ws://127.0.0.1:1234")
        // // ws.send("kjhgjhgkhj")
        
        // ws.onopen = () => {
        //     console.log("opened connection")
        //     ws.send("hello")
        // }

        // ws.onmessage = (e) => {
        //     console.log('ws message', e.data)
        // };

        // let intervalId = setInterval(() => {
        //     if (ws.readyState === 1) {
        //         console.log("ws ready");
        //         ws.send("hello")
        //         clearInterval(intervalId);
        //     } else {
        //         console.log('ws.readyState', ws.readyState)
        //     }
        // }, 10);
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