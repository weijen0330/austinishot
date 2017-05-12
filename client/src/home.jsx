import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

import RecentActivity from './recent-activity.jsx'
import MessageArea from './message-area.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			view: ""
		};
    }

	componentDidMount() {
		fetch("src/data.json")
			.then(response => {
				if (response.ok) {
					return response.json()
				}
				throw new Error("error getting data")
			})
			.then(respData => this.setState({images: respData.images, articles: respData.articles, videos: respData.videos}))
			.catch(err => this.setState({error: err}))
	}

	switchView(view) {
		this.setState({view: view})
	}

	handlebBackClick() {
		this.setState({view: ""})
	}

	render(){
		var content = (
			<RecentActivity 
				newArticles={this.state.articles ? this.state.articles.length : 0}
				newImages={this.state.images ? this.state.images.length : 0}
				newVideos={this.state.videos ? this.state.videos.length : 0}
				switchView={view => this.switchView(view)}
			/>
		)

		if (this.state.view != "") {
			content = (
				<MessageArea 
					viewName={this.state.view}					
					handleBackClick={this.handlebBackClick.bind(this)}
					messages={this.state[this.state.view]}
				/>
			)
		}

		return (	
			<div>
				{content}
			</div>					
		)
    }
}
