import React from "react";
import {render} from "react-dom";


export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
           value: ""          
        }
        
        this.IS_FOCUSED = 'is-focused'
    }

    handleChange(value) {
        this.setState({value: value}, () => {
            this.props.setSearchOption(this.props.propName, value)
        })
    }

    addFocus() {
        this.parentDiv.classList.add(this.IS_FOCUSED)
    }

    removeFocus() {
        this.parentDiv.classList.remove(this.IS_FOCUSED)
    }

    render() {
        return (
            <div 
                className="mdl-textfield mdl-js-textfield" 
                style={this.props.style}
                ref={div => this.parentDiv = div}
            >
                <input 
                    className="mdl-textfield__input" 
                    type="text" 
                    id="textfield" 
                    value={this.state.value}
                    onChange={e => this.handleChange(e.target.value)}                    
                    onFocus={this.addFocus.bind(this)}
                    onBlur={this.removeFocus.bind(this)}
                />
                <label className="mdl-textfield__label" htmlFor="textfield">{this.props.label}</label>
            </div>
        )
    }
}

/*
<div>
                // keywords and tags
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="keywords-srch" 
                                onChange={(e) => this.setSearchOption("keywords", e.target.value)}
                                value={this.state.keywords}
                            />
                            <label className="mdl-textfield__label" htmlFor="keywords-srch">Ex. Seattle activities</label>
                        </div>            
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="tag-srch" 
                                onChange={(e) => this.setSearchOption("tags", e.target.value)}
                                value={this.state.tags}
                            />
                            <label className="mdl-textfield__label" htmlFor="tag-srch">Ex. funny, cute</label>
                        </div>                
                // domain and whom               
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="domain-srch" 
                                onChange={(e) => this.setSearchOption("domain", e.target.value)}
                                value={this.state.domain}
                            />
                            <label className="mdl-textfield__label" htmlFor="domain-srch">Ex. buzzfeed</label>
                        </div>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="sr-srch" 
                                onChange={(e) => this.setSearchOption("people", e.target.value)}
                                value={this.state.people}
                            />
                            <label className="mdl-textfield__label" htmlFor="sr-srch">Ex. Mary</label>
                        </div>

    */

    /*
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
                */