import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 0
        }
    }

    increaseIndex(e, amount) {
        e.preventDefault()
        var current = this.state.tab;
        this.setState({tab: current + amount})

    }

    render() {

        var modalClass;
        switch (this.props.active) {
            case "true":
                modalClass = "modal is-active";
                break;
            case "false":
                modalClass = "modal";
                break;
        }

        var order = ["browse", "link-body", "add-tags", "search"]

        var images = {
                        "browse": "img/browse.png", 
                        "link-body": "img/link-body.png",
                        "add-tags": "img/add-tags.png",
                        "search": "img/search-page.png"
                    };

        var text = {
                    "browse": "The Browse tab is where all of your recent activity (sent and received links) are displayed.",
                    "add-tags": "If you want to add tags to a link to easily find it later, you can use the “Add tags” feature",
                    "search": "Use the search tab to search for tags in your link history",
                    "link-body": "Links you sent and received will be shown here with the corresponding link description, message information, and all associated tags."

                    }



        
        return (            
            <div className={modalClass}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Modal title</p>
                        <button onClick={e => this.props.handleModalClick(e, "false")} className="delete"></button>
                    </header>
                    <section className="modal-card-body">
                        <img src={images[order[this.state.tab]]} />
                        <p>{text[order[this.state.tab]]}</p>
                    </section>
                    <footer className="modal-card-foot">
                        <a onClick={e => this.increaseIndex(e, -1)} className="button">&lt; previous</a>
                        <a onClick={e => this.increaseIndex(e, 1)} className="button">next &gt; </a>
                    </footer>
                </div>
            </div>
        )
    }
}