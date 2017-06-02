import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keywords: "",
            tags: "",

            integration: "",          
            linkType: "",

            sentOrReceived: "",            
            timeSent: "",

            domain: "",
            sender: "",            
        }        
    }

    setSearchOption(prop, value) {
        if (prop === "tags") {
            value = (value).split(',').map(str => str.trim()).filter(str => str.length)
        }

        this.setState({[prop]: value}, () => {
            this.props.updateSearchCriteria(this.state)
        });        
    }

    render() {
        return (
            <div style={{marginTop: '30px', marginBottom: '35px'}}>
                
                <div className="field">
                    <label className="label" style={{textAlign: 'center'}}>Keywords?</label>
                    <p className="control" style={{paddingBottom: '12px'}}>
                        <input 
                            className="input" 
                            type="text" 
                            placeholder="Ex. Seattle activities" 
                            onChange={e => this.setSearchOption("keywords", e.target.value)}
                            value={this.state.keywords}
                        />
                    </p>
                </div>
                

                {/*keywords and tags*/}
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
                        <div className="field" style={{textAlign: 'right'}}>
                            <label className="label">Who sent it?</label>
                            <p className="control">
                                <input 
                                    style={{textAlign: 'right'}}
                                    className="input" 
                                    type="text" 
                                    placeholder="Ex. Mary, me" 
                                    value={this.state.sender}
                                    onChange={e => {
                                        e.preventDefault()
                                        this.setSearchOption("sender", e.target.value)
                                    }}
                                />
                            </p>
                        </div>
                    </div>
                    <div className="column is-half">
                        <label className="label">How long ago?</label>
                        <div>
                            <a 
                                className={this.state.timeSent == "days" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("timeSent", "days")
                                }}
                            >
                                Days
                            </a>
                            <a 
                                className={this.state.timeSent == "weeks" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("timeSent", "weeks")
                                }}
                            >
                                Weeks
                            </a>
                            <a 
                                className={this.state.timeSent == "months" ? "button is-light" : "button is-white"} 
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("timeSent", "months")
                                }}
                            >
                                Months
                            </a>
                            <a 
                                className={this.state.timeSent == "years" ? "button is-light" : "button is-white"}
                                style={{marginRight: '10px'}}
                                onClick={(e) => {
                                    e.preventDefault()
                                    this.setSearchOption("timeSent", "years")
                                }}
                            >
                                Years
                            </a>
                        </div>
                    </div>
                </div>

                {/*domain and ppl*/}
                <div className="columns">
                    

                   
                </div>
            </div>                
        )
    }
}


