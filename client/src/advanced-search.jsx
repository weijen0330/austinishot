import React from "react";
import {render} from "react-dom";

import Textfield from './textfield.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keywords: "",
            tags: "",

            integration: "",          
            linkType: "",

            sentOrReceived: "",            
            when: "",

            domain: "",
            people: "",            
        }
        
    }

    setSearchOption(prop, value) {
        this.setState({[prop]: value}, () => {
            this.props.updateSearchCriteria(this.state)
        });        
    }

    render() {
        return (
            <div style={{marginTop: '30px', marginBottom: '35px'}}>
                {/*keywords and tags*/}
                <div className="columns">
                    <div className="column is-half">
                        <div className="field" style={{textAlign: 'right'}}>
                            <label className="label">What keywords might be in your link?</label>
                            <p className="control">
                                <input 
                                    style={{textAlign: 'right'}}
                                    className="input" 
                                    type="text" 
                                    placeholder="Ex. Seattle activities" 
                                    value={this.state.keywords}
                                    onChange={e => {
                                        e.preventDefault()
                                        this.setSearchOption("keywords", e.target.value)
                                    }}
                                />
                            </p>
                        </div>
                    </div>

                    <div className="column is-half">
                        <div className="field">
                            <label className="label">What tags are attached to your link?</label>
                            <p className="control">
                                <input 
                                    className="input" 
                                    type="text" 
                                    placeholder="Ex. funny, cute" 
                                    value={this.state.tags}
                                    onChange={e => {
                                        e.preventDefault()
                                        this.setSearchOption("tags", e.target.value)
                                    }}
                                />
                            </p>
                        </div>
                    </div>
                </div>

                {/*service and type*/}
                <div className="columns">
                    <div className="column is-half" style={{textAlign: 'right'}}>
                        <label className="label">Where did the link come from?</label>
                        <div>
                            <a 
                                className={this.state.integration == "facebook" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("integration", "facebook")
                                    return false;
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-facebook-square"></i>
                                </span>
                            </a>
                            <a 
                                className={this.state.integration == "gmail" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("integration", "gmail")
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-envelope-o"></i>
                                </span>
                            </a>
                            <a 
                                className={this.state.integration == "slack" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("integration", "slack")
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-slack"></i>
                                </span>
                            </a>
                        </div>

                    </div>
                    <div className="column is-half">
                        <label className="label">What type of link was it?</label>
                        <div>
                            <a 
                                className={this.state.linkType == "article" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("linkType", "article")
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-file-text-o"></i>
                                </span>
                            </a>
                            <a 
                                className={this.state.linkType == "image" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}    
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("linkType", "image")
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-picture-o"></i>
                                </span>
                            </a>
                            <a 
                                className={this.state.linkType == "video" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("linkType", "video")
                                }}
                            >
                                <span className="icon is-small">
                                    <i style={{fontSize: '20pt', color: '#585858'}} className="fa fa-video-camera"></i>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/*S||R and when*/}
                <div className="columns">
                    <div className="column is-half" style={{textAlign: 'right'}}>
                        <label className="label">Was it</label>
                        <div>
                            <a 
                                className={this.state.sentOrReceived == "sent" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={() => this.setSearchOption("sentOrReceived", "sent")}
                            >
                                Sent
                            </a>
                            
                            <span style={{lineHeight: '36px', marginRight: '8px', fontSize: '1rem', fontWeight: 700}}>or</span>
                            
                            <a 
                                className={this.state.sentOrReceived == "received" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={() => this.setSearchOption("sentOrReceived", "received")}
                            >
                                Received
                            </a>
                            <span style={{lineHeight: '36px', fontSize: '1rem', fontWeight: 700}}>?</span>
                        </div>
                    </div>
                    <div className="column is-half">
                        <label className="label">How long ago?</label>
                        <div>
                            <a 
                                className={this.state.when == "days" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("when", "days")
                                }}
                            >
                                Days
                            </a>
                            <a 
                                className={this.state.when == "weeks" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("when", "weeks")
                                }}
                            >
                                Weeks
                            </a>
                            <a 
                                className={this.state.when == "months" ? "button is-light" : "button is-white"} 
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("when", "months")
                                }}
                            >
                                Months
                            </a>
                            <a 
                                className={this.state.when == "years" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("when", "years")
                                }}
                            >
                                Years
                            </a>
                        </div>
                    </div>
                </div>

                {/*domain and ppl*/}
                <div className="columns">
                    <div className="column is-half" style={{textAlign: 'right'}}>
                        <div className="field" style={{textAlign: 'right'}}>
                            <label className="label">What site was it from?</label>
                            <p className="control">
                                <input 
                                    style={{textAlign: 'right'}}
                                    className="input" 
                                    type="text" 
                                    placeholder="Ex. buzzfeed" 
                                    value={this.state.domain}
                                    onChange={e => {
                                        e.preventDefault()
                                        this.setSearchOption("domain", e.target.value)
                                    }}
                                />
                            </p>
                        </div>
                    </div>

                    <div className="column is-half">
                        <div className="field">
                            <label className="label">Who sent it?</label>
                            <p className="control">
                                <input 
                                    className="input" 
                                    type="text" 
                                    placeholder="Ex. Mary, me" 
                                    value={this.state.people}
                                    onChange={e => {
                                        e.preventDefault()
                                        this.setSearchOption("people", e.target.value)
                                    }}
                                />
                            </p>
                        </div>
                    </div>
                </div>
            </div>                
        )
    }
}


