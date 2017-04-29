import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let homeClass = "", searchClass = "", accountClass = "";
        switch (this.props.activeTab) {
            case "home":
                homeClass = "is-active";
                break;
            case "search":
                searchClass = "is-active";
                break;
            case "account":
                accountClass = "is-active";
                break;
        }
        
        return (            
            <header className="mdl-layout__header">
                <div className="mdl-layout__tab-bar">
                    <span className={"mdl-layout__tab " + homeClass} onClick={() => this.props.handleTabClick("home")}>Home</span>
                    <span className={"mdl-layout__tab " + searchClass} onClick={() => this.props.handleTabClick("search")}>Search</span>
                    <span className={"mdl-layout__tab " + accountClass} onClick={() => this.props.handleTabClick("account")}>Account</span>
                </div>
            </header>
        )
    }
}
