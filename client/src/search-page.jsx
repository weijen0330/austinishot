import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keywords: "",
            from: "",
            wasSent: false,
            wasReceived: false,
            type: "",
            when: "",
            domain: "",
            sender: "",
            receiver: "",
            tags: []
        }
    }
    


    render() {
        return (
            <div className="page-content">
                <h1>Find your links</h1>

                {/*keywords*/}
                <div className="mdl-textfield mdl-js-textfield" style={{width: '100%'}}>
                    <input className="mdl-textfield__input" type="text" id="keywords-srch" />
                    <label className="mdl-textfield__label" htmlFor="keywords-srch">Keywords...</label>
                </div>

                <div style={{display: 'flex'}}>                    
                    <div className="search-option" style={{width: '50%'}}>
                        <p className="header">Where was it sent or received from?</p>
                        <div>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-facebook-square" aria-hidden="true"></i>
                            </button>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-envelope-o" aria-hidden="true"></i>                                
                            </button>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-slack" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                    <div className="search-option" style={{width: '50%'}}>
                        <p className="header">What type of link was it?</p>
                        <div>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-file-text-o" aria-hidden="true"></i>
                            </button>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-picture-o" aria-hidden="true"></i>
                            </button>
                            <button className="mdl-button mdl-js-button">
                                <i className="fa fa-video-camera" aria-hidden="true"></i>
                            </button>                            
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', marginTop: '30px'}}>                    
                    <div className="search-option sentReceived" style={{width: '50%'}}>
                        <p style={{textAlign: 'center'}}>
                            <span>Was it</span>
                            <button className="mdl-button mdl-js-button">
                                Sent
                            </button>
                            <span>or</span>
                            <button className="mdl-button mdl-js-button">
                                Received
                            </button>
                            <span>?</span>
                        </p>
                    </div>    
                    <div className="search-option" style={{width: '50%', textAlign: 'center'}}>
                        <p className="header">How long ago was it sent or received?</p>
                        <div>
                            <button className="mdl-button mdl-js-button">
                                Days
                            </button>
                            <button className="mdl-button mdl-js-button">
                                Weeks
                            </button>
                            <button className="mdl-button mdl-js-button">
                                Months
                            </button>
                            <button className="mdl-button mdl-js-button">
                                Years
                            </button>
                        </div>
                    </div>                
                </div>

                <div style={{display: 'flex', marginTop: '20px'}}>
                    <div className="search-option" style={{width: '33%'}}>
                        <p className="header">What site was it from?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input className="mdl-textfield__input" type="text" id="domain-srch" />
                            <label className="mdl-textfield__label" htmlFor="domain-srch">Domain...</label>
                        </div>
                    </div>
                    <div className="search-option" style={{width: '33%'}}>
                        <p className="header">Who was it sent to or received from?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input className="mdl-textfield__input" type="text" id="sr-srch" />
                            <label className="mdl-textfield__label" htmlFor="sr-srch">Sent to/ Received from...</label>
                        </div>
                    </div>
                    <div className="search-option" style={{width: '33%'}}>
                        <p className="header">What tags were applied to it?</p>
                        <div className="mdl-textfield mdl-js-textfield">
                            <input className="mdl-textfield__input" type="text" id="tag-srch" />
                            <label className="mdl-textfield__label" htmlFor="tag-srch">Tags...</label>
                        </div>
                    </div>
                </div>

                <div style={{display: 'flex', marginTop: '30px'}}>
                    <button className="mdl-button mdl-js-button mdl-button--raised mdl-button--accent" style={{margin: '0 auto'}}>
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