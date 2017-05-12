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
			view: "All",
			types: {"All" : "fa-link", "Articles" : "fa-file-text-o", "Images": "fa-picture-o", "Videos": "fa-video-camera"}
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
			.then(respData => {
				var articles = respData.articles,
					images = respData.images,
					videos = respData.videos				
				var newAll = [],
					oldAll = [],
					newArticles = [],
					oldArticles = [],					
					newImages = [],
					oldImages = [],
					newVideos = [],
					oldVideos = []				
				
				var tags = {},
					domains = {}
				
							
				articles.forEach(article => {					
					if (article.new) {
						newArticles.push(article)
						newAll.push(article)
					} else {
						oldArticles.push(article)
						oldAll.push(article)
					}					

					if (article.tags) {						
						(article.tags).forEach(tag => tags[tag] = true)
					}

					if (article.site_name) {
						domains[article.site_name] = true
					}									
				})	
				images.forEach(img => {
					if (img.new) {
						newImages.push(img)
						newAll.push(img)						
					} else {
						oldImages.push(img)
						oldAll.push(img)
					}
					
					if (img.tags) {
						(img.tags).forEach(tag => tags[tag] = true)
					}					
					if (img.site_name) {
						domains[img.site_name] = true
					}	
				})
				videos.forEach(vid => {
					if (vid.new) {
						newVideos.push(vid)
						newAll.push(vid)
					} else {
						newVideos.push(vid)
						oldAll.push(vid)
					}

					if (vid.tags) {
						(vid.tags).forEach(tag => tags[tag] = true)
					}					
					if (vid.site_name) {
						domains[vid.site_name] = true
					}	
				})
				console.log()
				this.setState({
					newAll: newAll,
					oldAll: oldAll,

					newArticles: newArticles,
					oldArticles: oldArticles,

					newImages: newImages,
					oldImages: oldImages,

					newVideos: newVideos,
					oldVideos: oldVideos,

					tags: tags,
					domains: domains
				})
			})
			.catch(err => this.setState({error: err}))
	}	

	changeView(view) {
		this.setState({view: view})
	}

	render() {
		var newMessages = [],
			oldMessages = [],
			content = ""

		switch (this.state.view) {
			case "All":			
				if (this.state.newAll) {
					newMessages = this.state.newAll					
				}				
				if (this.state.oldAll) {
					oldMessages = this.state.oldAll
				}
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New links" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older links" /> : ""}
					</div>
				)

				break;
			case "Articles":
				if (this.state.newArticles) {
					newMessages = this.state.newArticles
				}
				if (this.state.oldArticles) {
					oldMessages = this.state.oldArticles
				}
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New articles" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older articles" /> : ""}
					</div>
				)

				break;
			case "Images":
				if (this.state.newImages) {
					newMessages = this.state.newImages
				}
				if (this.state.oldImages) {
					oldMessages = this.state.oldImages
				}
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New images" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older images" /> : ""}
					</div>
				)

				break;
			case "Videos":
				if (this.state.newVideos) {
					newMessages = this.state.newVideos
				}
				if (this.state.oldVideos) {
					oldMessages = this.state.oldVideos
				}
				content = (
					<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>						
						{newMessages.length > 0 ? <MessageArea messages={newMessages} title="New videos" /> : ""}
						{oldMessages.length > 0 ? <MessageArea messages={oldMessages} title="Older videos" /> : ""}
					</div>
				)

				break;
		}
		
		return (
			<div className="columns is-mobile">
				<Sidebar 
					view={this.state.view}
					types={this.state.types}
					newAll={this.state.newAll}
					newArticles={this.state.newArticles}
					newImages={this.state.newImages}
					newVideos={this.state.newVideos}
					tags={this.state.tags}
					domains={this.state.domains}
					handleViewChange={(view) => this.changeView(view)}
				/>
				{content}
			</div>
		)
    }
}