import React from "react";
import {render} from "react-dom";

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
            <div className="field" style={{marginTop: '30px', marginBottom: '35px'}}>
                <p className="control">
                    <input 
                        className="input" 
                        type="text" 
                        placeholder="Ex. Seattle activities" 
                        onChange={e => this.setSearchOption("keywords", e.target.value)}
                        value={this.state.keywords}
                    />
                </p>
            </div>
        )
    }
}