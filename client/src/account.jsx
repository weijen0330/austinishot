import React from "react";
import {render} from "react-dom";

import AdvancedSearch from "./advanced-search.jsx"
import NormalSearch from "./normal-search.jsx"

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
               
                          
        }
    }
    render() {
        return (
            <div className="page-content">
                <h1 style={{textAlign: 'center'}}>Integration Settings</h1>
                <div>
                    <p style={{fontSize: '16pt'}}>
                        Facebook 
                       
                        <button style={{float: 'right'}} className="mdl-button mdl-js-button mdl-button--accent">
                            Enabled
                        </button>
                    </p>
                    <p style={{fontSize: '16pt'}}>
                        Slack
                        <button style={{float: 'right'}} className="mdl-button mdl-js-button mdl-button--accent">
                            Enabled
                        </button>
                    </p>
                    <p style={{fontSize: '16pt'}}>
                        Gmail
                        <button style={{float: 'right'}} className="mdl-button mdl-js-button mdl-button--primary">
                            Enable
                        </button>
                    </p>
                </div>                
            </div>
        )
    }
}
