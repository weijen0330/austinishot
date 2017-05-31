import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
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
        
        return (            
            <div className={modalClass}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Modal title</p>
                        <button onClick={e => this.props.handleModalClick(e, "false")} className="delete"></button>
                    </header>
                    <section className="modal-card-body">
                        <img src="img/browse.png" />
                        <p>hello</p>
                    </section>
                    <footer className="modal-card-foot">
                        <a className="button is-success">Save changes</a>
                        <a className="button">Cancel</a>
                    </footer>
                </div>
            </div>
        )
    }
}