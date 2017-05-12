// done

import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let browseClass = "", searchClass = "", accountClass = "";
        switch (this.props.activeTab) {
            case "browse":
                browseClass = "is-active";
                break;
            case "search":
                searchClass = "is-active";
                break;
            case "account":
                accountClass = "is-active";
                break;
        }
        
        return (            
            <nav className="nav has-shadow">
                <div className="container" style={{marginLeft: "10px"}}>
                    <div className="nav-left">
                        <p className="nav-item">
                            {/*<img src="http://bulma.io/images/bulma-logo.png" alt="Bulma logo" />*/}
                            Our logo
                        </p>
                        <a style={{width: "20%"}} className={"nav-item is-tab is-hidden-mobile " + browseClass}>Browse</a>
                        <a style={{width: "20%"}} className={"nav-item is-tab is-hidden-mobile " + searchClass}>Search</a>
                        <a style={{width: "20%"}} className={"nav-item is-tab is-hidden-mobile " + accountClass}>Account</a>

                    </div>
                </div>
            </nav>
        )
    }
}
