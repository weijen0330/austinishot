import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {home: props.home, 
        				search: props.search,
        				settings: props.settings};
    }

    render(){

		return (
				<ul className="nav nav-pills">
					<li role="presentation" className={this.state.home}><a href="#">Home</a></li>
					<li role="presentation" className={this.state.search}><a href="#">Search</a></li>
					<li role="presentation" className={this.state.settings}><a href="#">Settings</a></li>
				</ul>

				)
    }
}
/*return (
				<ul className="nav nav-pills">
					<li role="presentation" className={props.home}><a href="#">Home</a></li>
					<li role="presentation" className={props.search}><a href="#">Search</a></li>
					<li role="presentation" className={props.settings}><a href="#">Settings</a></li>
				</ul>

				)*/