import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 0
        }
    }

    increaseIndex(e, amount, max) {
        e.preventDefault()
        var next = this.state.tab + amount;
        console.log(this.state.tab);
        if((amount > 0 && this.state.tab < max - 1) || (amount < 0 && this.state.tab > 0)){
            this.setState({tab: next});
        }
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

        var order = ["browse", "link-body", "recent-activity", "filter-tags", 
                        "add-tags", "search", "advanced-search", "settings", "integrations"]

        var images = {
                        "browse": "img/browse.png", 
                        "link-body": "img/link-body.png",
                        "add-tags": "img/add-tags.png",
                        "search": "img/search-page.png",
                        "advanced-search": "img/advanced-search.png",
                        "recent-activity": "img/recent-activity-filter.png",
                        "filter-tags": "img/filter-tags-domains.png",
                        "settings": "img/settings.png",
                        "integrations": "img/integrations.png"
                    };

        var text = {
                    "browse": "The Browse tab is where all of your recent activity (sent and received links) are displayed.",
                    "add-tags": "If you want to add tags to a link to easily find it later, you can use the “Add tags” feature",
                    "search": "Use the search tab to search for tags in your link history.",
                    "advanced-search": "If you want more control over your searching, use the advanced-search feature",
                    "link-body": "Links you sent and received will be shown here with the corresponding link description, message information, and all associated tags.",
                    "recent-activity": "Control what types of links will be shown by filtering on link-type, or tags",
                    "filter-tags": "Control what types of links will be shown by filtering on link-type, tags, or domains",
                    "settings": "The settings tab is where you can manage your account",
                    "integrations": "Easily turn on and off whichever services you want to archive links from"
                    }

        var previousState = "";
        if(this.state.tab <= 0){
            previousState = "disabled";
        }

        var nextState = "";
        if(this.state.tab >= order.length - 1){
            nextState = "disabled";
        }


        
        return (            
            <div className={modalClass}>
                <div className="modal-background"></div>
                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">Get familiar with Lynx</p>
                        <button onClick={e => this.props.handleModalClick(e, "false")} className="delete"></button>
                    </header>
                    <section className="modal-card-body">
                        <img src={images[order[this.state.tab]]} />
                        <p>{text[order[this.state.tab]]}</p>
                    </section>
                    <footer className="modal-card-foot">
                        <a onClick={e => this.increaseIndex(e, -1, order.length)} disabled={previousState} className="button">&lt; previous</a>
                        <a onClick={e => this.increaseIndex(e, 1, order.length)}  disabled={nextState} className="button">next &gt; </a>
                    </footer>
                </div>
            </div>
        )
    }
}