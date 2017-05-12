import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

import Message from './message.jsx'


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			
		};
    }

    handleBackClick() {
        this.props.handleBackClick()
    }


	render() {	
        var title = "", messages = []
        if (this.props.viewName) {
            var str = this.props.viewName
            title = str.charAt(0).toUpperCase() + str.slice(1)
        }	

        if (this.props.messages) {
            messages = this.props.messages.map(msg => {
                return (
                    <Message 
                        key={msg.id}
                        message={msg}
                    />
                )
            })
        }

		return (	
			<div className="container">
                <button 
                    className="mdl-button mdl-js-button mdl-button--primary"
                    onClick={this.handleBackClick.bind(this)}
                >
                    Back
                </button>

				<h1 style={{textAlign: "center"}}>
                    {title}
                </h1>

                <div className="message-area">
                    {messages}
                </div>
			</div>					
		)
    }
}
