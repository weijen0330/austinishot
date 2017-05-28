import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            login: true               
        }
    }

    render() {
        return (                    
            <div>
                <div className="container">
                    sign up
                </div>
            </div>
        )
    }
}