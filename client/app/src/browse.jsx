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

			this.props.ws.on("tags_added", data => {
				console.log("tags added, webhook")
				this.getAllTags()
			})
		}

		fetch("https://lynxapp.me/api/messages/new")
			.then(response => response.json()).then(data => {
				console.log(data)
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
		
		fetch("https://lynxapp.me/api/domains/")	
			.then(response => response.json()).then(data => this.setState({domains: data}))
		this.getAllTags()
	}

	getAllTags() {
		fetch("https://lynxapp.me/api/tags/")	
			.then(response => response.json()).then(data => this.setState({tags: data}))
	}

	changeView(view, viewType) {
		if (viewType) {
			this.setState({view: view, viewType: viewType})
		} else {
			this.setState({view: view, viewType: ""})
		}		
	}

	updateSeenStatus(msg) {
		// msg is the whole msg obj
		// isRead = true - marked as read, move from new to old
		// isRead = false - marked as unread, move from old to new
		// messageId, type
		

		const compareIds = function (m) {
			return m.messageId != msg.messageId
		}

		// remove from old status and put into new status		

		switch(msg.type) {
			case "image":
				if (msg.isRead) {
					//marked as read, move from new to old
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						allOld: [msg].concat(this.state.allOld),

						imagesNew: this.state.imagesNew.filter(compareIds),	
						imagesOld: [msg].concat(this.state.imagesOld)					
					})
				} else {
					//marked as unread, move from old to new
					this.setState({						
						allOld: this.state.allOld.filter(compareIds),						
						allNew: [msg].concat(this.state.allNew),

						imagesOld: this.state.imagesOld.filter(compareIds),	
						imagesNew: [msg].concat(this.state.imagesNew)					
					})
				}
				break;
			case "video":
				if (msg.isRead) {
					//marked as read, move from new to old
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						allOld: [msg].concat(this.state.allOld),

						videosNew: this.state.videosNew.filter(compareIds),	
						videosOld: [msg].concat(this.state.videosOld)					
					})
				} else {
					//marked as unread, move from old to new
					this.setState({						
						allOld: this.state.allOld.filter(compareIds),						
						allNew: [msg].concat(this.state.allNew),

						videosOld: this.state.videosOld.filter(compareIds),	
						videosNew: [msg].concat(this.state.videosNew)					
					})
				}
				break;
			default:
				if (msg.isRead) {
					//marked as read, move from new to old
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						allOld: [msg].concat(this.state.allOld),

						articlesNew: this.state.articlesNew.filter(compareIds),	
						articlesOld: [msg].concat(this.state.articlesOld)					
					})
				} else {
					//marked as unread, move from old to new
					this.setState({						
						allOld: this.state.allOld.filter(compareIds),						
						allNew: [msg].concat(this.state.allNew),

						articlesOld: this.state.articlesOld.filter(compareIds),	
						articlesNew: [msg].concat(this.state.articlesNew)					
					})
				}
				break;
		}
	}

	removeMessageFromUi(messageData) {
		/*
		messageData = {
			messageId,
			type,
			isRead
		}
		*/

		const compareIds = function (m) {
			return m.messageId != messageData.messageId
		}

		switch(messageData.type) {
			case "image":
				if (messageData.isRead) { //old
					this.setState({
						allOld: this.state.allOld.filter(compareIds),
						imagesOld: this.state.imagesOld.filter(compareIds)
					})
				} else { //new
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						imagesNew: this.state.imagesNew.filter(compareIds)
					})
				}
				break;
			case "video":
				if (messageData.isRead) { //old
					this.setState({
						allOld: this.state.allOld.filter(compareIds),
						videosOld: this.state.videosOld.filter(compareIds)
					})
				} else { //new
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						videosNew: this.state.videosNew.filter(compareIds)
					})
				}
				break;
			default:
				if (messageData.isRead) { //old
					this.setState({
						allOld: this.state.allOld.filter(compareIds),
						articlesOld: this.state.articlesOld.filter(compareIds)
					})
				} else { //new
					this.setState({
						allNew: this.state.allNew.filter(compareIds),
						articlesNew: this.state.articlesNew.filter(compareIds)
					})
				}
				break;
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
						{newMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={newMessages} 
								title="New links" 
							/>
						) : ""}
						{oldMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={oldMessages} 
								title="Older links" 
							/>
						) : ""}
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
						{newMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={newMessages} 
								title="New articles" 
							/>
						) : ""}
						{oldMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={oldMessages} 
								title="Older articles" 
							/>
						) : ""}
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
						{newMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={newMessages} 
								title="New images" 
							/>
						) : ""}
						{oldMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={oldMessages} 
								title="Older images" 
							/>
						) : ""}
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
						{newMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={newMessages} 
								title="New videos" 
							/>
						) : ""}
						{oldMessages.length > 0 ? (
							<MessageArea 
								updateSeenStatus={msg => this.updateSeenStatus(msg)}
								removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
								messages={oldMessages} 
								title="Older videos" 
							/> 
						) : ""}
					</div>
				)

				break;			
		}
		
		switch (this.state.viewType) {			
			case "tag":
				if (this.state.allNew) {
					newMessages = this.state.allNew.filter(msg => {
						if (msg.tags) {
							msg.tags.includes(this.state.view)
						}						
					})					
				}
				if (this.state.allOld) {
					oldMessages = this.state.allOld.filter(msg => {
						if (msg.tags) {
							msg.tags.includes(this.state.view)
						}
					})						
				}
				allMessages = newMessages.concat(oldMessages)

				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
							{allMessages.length > 0 ? (
								<MessageArea 
									updateSeenStatus={msg => this.updateSeenStatus(msg)}
									removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
									messages={allMessages} 
									title={"Links with tag '" + this.state.view + "'"} 
								/>
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
								<MessageArea 
									updateSeenStatus={msg => this.updateSeenStatus(msg)}
									removeMessageFromUi={(messageData) => this.removeMessageFromUi(messageData)} 
									messages={allMessages} 
									title={"Links with domain '" + this.state.view + "'"} 
								/>
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