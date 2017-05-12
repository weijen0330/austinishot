import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let activityClass = "", searchClass = "", accountClass = "";
        switch (this.props.activeTab) {
            case "activity":
                activityClass = "is-active";
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
                    <a 
                        href="" 
                        className={"mdl-layout__tab " + activityClass} 
                        onClick={(e) => this.props.handleTabClick(e, "activity")}
                    >Activity</a>
                    <a 
                        href="" 
                        className={"mdl-layout__tab " + searchClass} 
                        onClick={(e) => this.props.handleTabClick(e, "search")}
                    >Search</a>
                    <a 
                        href="" 
                        className={"mdl-layout__tab " + accountClass} 
                        onClick={(e) => this.props.handleTabClick(e, "account")}
                    >Account</a>
                </div>
            </header>
        )
    }
}
