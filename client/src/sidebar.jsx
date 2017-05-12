import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    capitalizeString(str) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

    render() {
        var typesArr = [],
			tagsArr = [],
			domainsArr = []

        if (this.props.types && this.props.newAll && this.props.newArticles && this.props.newImages && this.props.newVideos) {
			typesArr = Object.keys(this.props.types).map(key => {
                var selected = ""
                if (this.props.view === key) {
                    selected = "is-selected"
                    
                }
				return (
                    <p 
                        key={key} 
                        className={"sidebar-option " + selected}
                        onClick={() => this.props.handleViewChange(key)}
                    >

                        <span className="icon">
                            <i className={"fa " + this.props.types[key]}></i>
                        </span>
                        
                        <span style={{marginLeft: '7px'}}>{key}</span>					

                        {this.props['new' + key].length ? (
                            <span className="tag is-info" style={{float: 'right'}}>
                                {this.props['new' + key].length + ' new'}
                            </span>
                        ) : ""}					
                    </p>
                )
			})
		}

		if (this.props.tags) {
			tagsArr = Object.keys(this.props.tags).map(tag => {
                var selected = ""
                if (this.props.view === tag) {
                    selected = "is-selected"
                }

				return <dd className={"sidebar-option " + selected} style={{marginBottom: "5px"}} key={tag}>{this.capitalizeString(tag)}</dd>
			})
		}

		if (this.props.domains) {
			domainsArr = Object.keys(this.props.domains).map(dom => {
                var selected = ""
                if (this.props.view === dom) {
                    selected = "is-selected"
                }

				return <dd className={"sidebar-option " + selected} style={{marginBottom: "5px"}} key={dom}>{dom}</dd>
			})
		}

        return (
            <div 
                className="column is-3" 
                style={{height: '100vh', overflowY: 'scroll', borderRight: '1px solid #dbdbdb'}}					
            >
                <div className="content" style={{padding: '10px'}}>

                    <h2 className="title is-5">Recent Activity</h2>		
                    {typesArr}

                    <dl>
                        <dt><h2 className="title is-5">Tags</h2></dt>
                        {tagsArr}
                    </dl>											

                    <dl style={{marginTop: '5px'}}>
                        <dt><h2 className="title is-5">Domains</h2></dt>
                        {domainsArr}
                    </dl>
                    
                </div>
            </div>
        )
    }
}