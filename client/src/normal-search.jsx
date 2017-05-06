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

        this.IS_FOCUSED = 'is-focused'
    }

    setSearchOption(prop, value) {
        this.setState({[prop]: value}, () => {
            this.props.updateSearchCriteria(this.state)
        });        
    }

    addFocus(parentDiv) {
        parentDiv.classList.add(this.IS_FOCUSED)
    }

    removeFocus(parentDiv) {
        parentDiv.classList.remove(this.IS_FOCUSED)
    }

    render() {
        return (
            <div >
                <div 
                    className="mdl-textfield mdl-js-textfield" 
                    style={{width: '100%'}}
                    ref={div => this.srchDiv = div}
                >
                    <div>
                        <input 
                            className="mdl-textfield__input" 
                            type="text" 
                            id="tag-srch" 
                            onFocus={() => this.addFocus(this.srchDiv)}
                            onBlur={() => this.removeFocus(this.srchDiv)}
                        />
                        <label className="mdl-textfield__label" htmlFor="tag-srch">Ex. Seattle activities</label>
                    </div>                        
                </div>
            </div>
        )
    }
}