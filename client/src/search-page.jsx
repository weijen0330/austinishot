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
    
    setSearchOption(option, value) {
        this.setState({
            [option] : value
        })
    }

    handleSubmit() {
        console.log(this.state)
    }

    render() {
        return (
            <div className="page-content">
                <h1 style={{textAlign: 'center'}}>Find your links</h1>

                {/*keywords and tags*/}
                <div style={{display: 'flex'}}>                    
                    <div className="search-option left">
                        <p className="header">What keywords might be in your link?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="keywords-srch" 
                                onChange={(e) => this.setSearchOption("keywords", e.target.value)}
                                value={this.state.keywords}
                            />
                            <label className="mdl-textfield__label" htmlFor="keywords-srch">The cat in the hat</label>
                        </div>
                    </div>
                    
                    <div className="search-option right">
                        <p className="header">What tags are attached to your link?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="tag-srch" 
                                onChange={(e) => this.setSearchOption("tags", e.target.value)}
                                value={this.state.tags}
                            />
                            <label className="mdl-textfield__label" htmlFor="tag-srch">funny, cute</label>
                        </div>
                    </div>
                </div>

                {/*service and type*/}
                <div style={{display: 'flex', marginTop: '10px'}}>
                    <div className="search-option left">
                        <p className="header">Where did the link come from?</p>
                        <button 
                            className={this.state.from == "facebook" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("from", "facebook")}
                        >
                            <i className="fa fa-facebook-square" aria-hidden="true"></i>
                        </button>
                        <button 
                            className={this.state.from == "gmail" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("from", "gmail")}
                        >
                            <i className="fa fa-envelope-o" aria-hidden="true"></i>                                
                        </button>
                        <button 
                            className={this.state.from == "slack" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("from", "slack")}
                        >
                            <i className="fa fa-slack" aria-hidden="true"></i>
                        </button>
                    </div>

                    <div className="search-option right">
                        <p className="header">What type of link was it?</p>
                        <button 
                            className={this.state.type == "article" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("type", "article")}
                        >
                            <i className="fa fa-file-text-o" aria-hidden="true"></i>
                        </button>
                        <button 
                            className={this.state.type == "image" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("type", "image")}
                        >
                            <i className="fa fa-picture-o" aria-hidden="true"></i>
                        </button>
                        <button 
                            className={this.state.type == "video" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("type", "video")}
                        >
                            <i className="fa fa-video-camera" aria-hidden="true"></i>
                        </button> 
                    </div>
                </div>

                {/*S||R and when*/}
                <div style={{display: 'flex', marginTop: '28px'}}>
                    <div className="search-option left">
                        <p className="header">Was the link</p>
                        <button 
                            className={this.state.sentOrReceived == "sent" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("sentOrReceived", "sent")}
                        >
                            Sent
                        </button>
                        <span>or</span>
                        <button 
                            className={this.state.sentOrReceived == "received" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("sentOrReceived", "received")}
                        >
                            Received
                        </button>
                        <span>?</span>
                    </div>

                    <div className="search-option right">
                        <p className="header">How long ago?</p>
                        <button 
                            className={this.state.when == "days" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("when", "days")}
                        >
                            Days
                        </button>
                        <button 
                            className={this.state.when == "weeks" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("when", "weeks")}
                        >
                            Weeks
                        </button>
                        <button 
                            className={this.state.when == "months" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("when", "months")}
                        >
                            Months
                        </button>
                        <button 
                            className={this.state.when == "years" ? "mdl-button mdl-js-button btn-selected" :  "mdl-button mdl-js-button"}
                            onClick={() => this.setSearchOption("when", "years")}
                        >
                            Years
                        </button>
                    </div>
                </div>
                
                {/*domain and whom*/}
                <div style={{display: 'flex', marginTop: '28px'}}>                    
                    <div className="search-option left">
                        <p className="header">What site was it from?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="domain-srch" 
                                onChange={(e) => this.setSearchOption("domain", e.target.value)}
                                value={this.state.domain}
                            />
                            <label className="mdl-textfield__label" htmlFor="domain-srch">buzzfeed</label>
                        </div>
                    </div>
                    
                    <div className="search-option right">
                        <p className="header">Who was it to or from?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input 
                                className="mdl-textfield__input" 
                                type="text" 
                                id="sr-srch" 
                                onChange={(e) => this.setSearchOption("senderOrReceiver", e.target.value)}
                                value={this.state.senderOrReceiver}
                            />
                            <label className="mdl-textfield__label" htmlFor="sr-srch">Mary</label>
                        </div>
                    </div>
                </div>

                {/*submit btn*/}
                <div style={{display: 'flex', marginTop: '30px'}}>
                    <button 
                        className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" 
                        style={{margin: '0 auto'}}
                        onClick={this.handleSubmit.bind(this)}
                    >
                        Search
                    </button>
                </div>                
            </div>
        )
    }
}
/*
                        <div className="mdl-textfield">
                            <input className="mdl-textfield__input" type="text" id="sample1">
                            <label className="mdl-textfield__label" for="sample1">Text...</label>
                        </div>


                <button className="mdl-button mdl-js-button">
                    Button
                </button>
*/