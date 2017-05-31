import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

import RecentActivity from './recent-activity.jsx'
import MessageArea from './message-area.jsx'
import Sidebar from './sidebar.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			view: "all",
			viewType: "",
			types: {"all" : "fa-link", "articles" : "fa-file-text-o", "images": "fa-picture-o", "videos": "fa-video-camera"},
			
			allNew: null,			
			allOld: null,
			articlesNew: null,
			articlesOld: null,
			imagesNew: null,
			imagesOld: null,
			videosNew: null,
			videosOld: null,
			tags: null,
			domains: null
		};
    }
	componentDidMount() {
		if (this.props.ws) {
			this.props.ws.on("new_message", data => {
				console.log("got a new message!")
				const msg = data.message
				
				let all = [msg].concat(this.state.allNew)
				
				switch (msg.type) {
					case "image":
						let images = [msg].concat(this.state.imagesNew)
						this.setState({allNew: all, imagesNew: images})
						break
					case "video":
						let videos = [msg].concat(this.state.videosNew)
						this.setState({allNew: all, videosNew: videos})
						break
					default:
						let articles = [msg].concat(this.state.articlesNew)
						this.setState({allNew: all, articlesNew: articles})
						break
				}
			})
		}

		fetch("https://lynxapp.me/api/messages/new")
			.then(response => response.json()).then(data => {
				this.setState({
					allNew: data,
					articlesNew: data.filter(msg => msg.type == "article"),
					imagesNew: data.filter(msg => msg.type == "image"),
					videosNew: data.filter(msg => msg.type == "video")
				})
			})
		fetch("https://lynxapp.me/api/messages/old")
			.then(response => response.json()).then(data => {
				this.setState({
					allOld: data,
					articlesOld: data.filter(msg => msg.type == "article"),
					imagesOld: data.filter(msg => msg.type == "image"),
					videosOld: data.filter(msg => msg.type == "video")
				})
		})
		
		// fetch("https://lynxapp.me/api/domains/")	
		// 	.then(response => response.json()).then(data => this.setState({domains: data}))
		// fetch("https://lynxapp.me/api/tags/")	
		// 	.then(response => response.json()).then(data => this.setState({tags: data}))
	}

	changeView(view, viewType) {
		if (viewType) {
			this.setState({view: view, viewType: viewType})
		} else {
			this.setState({view: view, viewType: ""})
		}		
	}

	render() {
		var newMessages = [],
			oldMessages = [],
			allMessages = [],
			content = ""

		switch (this.state.view) {
			case "all":			
				if (this.state.allNew) {
					newMessages = this.state.allNew					
				}				
				if (this.state.allOld) {
					oldMessages = this.state.allOld
				}
				
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New links" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older links" /> : ""}
					</div>
				)

				break;
			case "articles":
				if (this.state.articlesNew) {
					newMessages = this.state.articlesNew
				}
				if (this.state.articlesOld) {
					oldMessages = this.state.articlesOld
				}

				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New articles" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older articles" /> : ""}
					</div>
				)

				break;
			case "images":
				if (this.state.imagesNew) {
					newMessages = this.state.imagesNew
				}
				if (this.state.imagesOld) {
					oldMessages = this.state.imagesOld
				}

				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New images" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older images" /> : ""}
					</div>
				)

				break;
			case "videos":
				console.log(this.state)
				if (this.state.videosNew) {
					newMessages = this.state.videosNew
				}
				if (this.state.videosOld) {
					oldMessages = this.state.videosOld
				}
				
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New videos" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older videos" /> : ""}
					</div>
				)

				break;			
		}

		switch (this.state.viewType) {
			case "tag":
				if (this.state.allNew) {
					newMessages = this.state.allNew.filter(msg => msg.tags.includes(this.state.view))					
				}
				if (this.state.allOld) {
					oldMessages = this.state.allOld.filter(msg => msg.tags.includes(this.state.view))
				}
				allMessages = newMessages.concat(oldMessages)

				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
							{allMessages.length > 0 ? (
								<MessageArea messages={allMessages} title={"Links with tag '" + this.state.view + "'"} />
							) : (
								"No messages with tag '" + this.state.view + "'"
							)}
					</div>
				)

				break;
			case "domain":
				if (this.state.allNew) {
					newMessages = this.state.allNew.filter(msg => msg.domainName == this.state.view)
				}
				if (this.state.allOld) {
					oldMessages = this.state.allOld.filter(msg => msg.domainName == this.state.view)
				}
				allMessages = newMessages.concat(oldMessages)

				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
							{allMessages.length > 0 ? (
								<MessageArea messages={allMessages} title={"Links with domain '" + this.state.view + "'"} />
							) : (
								"No messages with domain '" + this.state.view + "'"
							)}
					</div>
				)

				break;
		}

		return (
			<div className="columns is-mobile">
				<Sidebar 
					view={this.state.view}
					types={this.state.types}
					allNew={this.state.allNew}
					articlesNew={this.state.articlesNew}
					imagesNew={this.state.imagesNew}
					videosNew={this.state.videosNew}
					tags={this.state.tags}
					domains={this.state.domains}
					handleViewChange={(view, viewType) => this.changeView(view, viewType)}
				/>
				{content}
			</div>
		)
    }
}