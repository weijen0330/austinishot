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


	render() {	
        var messages = []
        
        if (this.props.messages) {
            messages = this.props.messages.map(msg => {
                return (
                    <Message 
                        key={msg.id}
                        msg={msg}
                    />
                )
            })
        }

		return (	
			<div className="container">
				<h1 style={{textAlign: "center", fontWeight: "lighter"}}>
                    {this.props.title}
                </h1>

                <div className="message-area">
                    {messages}
                </div>
			</div>					
		)
    }
}
