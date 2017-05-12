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
                    <div className="nav-left">
                        <p className="nav-item" style={{marginLeft: "10px"}}>
                            {/*<img src="http://bulma.io/images/bulma-logo.png" alt="Bulma logo" />*/}
                            Our logo
                        </p>
                        
                        <div className="tabs is-centered" style={{margin: '0 auto'}}>
                            <ul style={{borderBottom: 'none', width: '60vw'}}> 
                                <li className={browseClass} style={{height: '100%', width: '33%'}}>
                                    <a 
                                        style={{height: '100%'}}
                                        onClick={e => this.props.handleTabClick(e, "browse")}
                                    >Browse</a>
                                </li>
                                <li className={searchClass} style={{height: '100%', width: '33%'}}>
                                    <a 
                                        style={{height: '100%'}}
                                        onClick={e => this.props.handleTabClick(e, "search")}
                                    >Search</a>
                                </li>
                                <li className={accountClass} style={{height: '100%', width: '33%'}}>
                                    <a 
                                        style={{height: '100%'}}
                                        onClick={e => this.props.handleTabClick(e, "account")}
                                    >Account</a>
                                </li>
                            </ul>
                        </div>    
                        

                            
                    </div>
            </nav>
        )
    }
}