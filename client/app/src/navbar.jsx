import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let browseClass = "", searchClass = "", settingsClass = "";
        switch (this.props.activeTab) {
            case "browse":
                browseClass = "is-active";
                break;
            case "search":
                searchClass = "is-active";
                break;
            case "settings":
                settingsClass = "is-active";
                break;
        }
        console.log(this.props.handle)
        return (                 
            <nav className="nav has-shadow">
                    <div className="nav-left">
                        
                            <p className="nav-item" style={{marginLeft: "10px"}}>
                                <img src="src/logoGreen.png" alt="lynx logo" />                             
                            </p>
                            <h1 className="nav-item" style={{marginBottom: 0, paddingTop: '9px', marginRight: '22px'}} className="title">Lynx </h1>
                            
                        
                        <div className="tabs is-centered" style={{width: '100%'}}>
                            <ul style={{borderBottom: 'none'}}> 
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
                                <li className={settingsClass} style={{height: '100%', width: '33%'}}>
                                    <a 
                                        style={{height: '100%'}}
                                        onClick={e => this.props.handleTabClick(e, "settings")}
                                    >Settings</a>
                                </li>
                            </ul>
                            <button className="button" style={{height: '100%'}}
                                onClick={e => this.props.handleModalClick(e, "true")}
                             >
                                <span className="icon is-small">
                                      <i className="fa fa-question" aria-hidden="true"></i>
                                    </span>
                             </button>
                        </div>    
                        

                            
                    </div>
            </nav>
        )
    }
}