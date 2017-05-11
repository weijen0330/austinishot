import React from "react";
import {render} from "react-dom";

import Textfield from './textfield.jsx'


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keywords: "",
            tags: "",

            from: "",          
            type: "",

            sentOrReceived: "",            
            when: "",

            domain: "",
            senderOrReceiver: "",            
        }
    }

    setSearchOption(prop, value) {
        this.setState({"keywords": value}, () => {
            this.props.updateSearchCriteria(this.state)
        });        
    }

    render() {
        return (        
            <Textfield 
                label="Ex. Seattle activities"
                style={{width: '100%'}}
                propName="keywords"
                setSearchOption={(prop, value) => this.setSearchOption(prop, value)}
            />
        )
    }
}