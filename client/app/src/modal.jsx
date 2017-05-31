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

        var images = ["img/browse.png", "img/search-page.png"];

        var text = [
                    "The Browse tab is where all of your recent activity (sent and received links) are displayed.",
                    "Links you sent and received will be shown here with the corresponding link description, message information, and all associated tags."
                    ]



        
        return (            
            <div className={modalClass}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Modal title</p>
                        <button onClick={e => this.props.handleModalClick(e, "false")} className="delete"></button>
                    </header>
                    <section className="modal-card-body">
                        <img src={images[this.state.tab]} />
                        <p>{text[this.state.tab]}</p>
                    </section>
                    <footer className="modal-card-foot">
                        <a onClick={e => this.increaseIndex(e, -1)} className="button is-success">&lt; previous</a>
                        <a onClick={e => this.increaseIndex(e, 1)} className="button">next &gt; </a>
                    </footer>
                </div>
            </div>
        )
    }
}