import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";

import RecentActivity from './recent-activity.jsx'
import MessageArea from './message-area.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
			view: "all",
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

	capitalizeString(str) {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	render() {
		var newMessages = [],
			oldMessages = [],
			typesArr = [],
			tagsArr = [],
			domainsArr = [],
			allNewCnt, newArtCnt, newImgCnt, newVidCnt
			

		switch (this.state.view) {
			case "all":
				if (this.state.newAll) {
					newMessages = this.state.newAll					
				}				
				if (this.state.oldAll) {
					oldMessages = this.state.oldAll
				}
				break;
		}

		if (this.state.newAll) allNewCnt = this.state.newAll.length
		if (this.state.newArticles) newArtCnt = this.state.newArticles.length
		if (this.state.newImages) newImgCnt = this.state.newImages.length
		if (this.state.newVideos) newVidCnt = this.state.newVideos.length
		console.log(this.state.newVideos)

		if (this.state.types && this.state.newAll && this.state.newArticles && this.state.newImages && this.state.newVideos) {
			typesArr = Object.keys(this.state.types).map(key => {
				return (<p key={key} className="home-not-option">
					<i className={"fa " + this.state.types[key]} aria-hidden="true"></i>
					
					<span>{key}</span>

					{this.state['new' + key].length ? (
						<button className="mdl-button mdl-js-button mdl-button--accent">
							{this.state['new' + key].length + ' new'}
						</button>
					) : ""}					
				</p>)
			})
		}

		if (this.state.tags) {
			tagsArr = Object.keys(this.state.tags).map(tag => {
				return <p key={tag}>{this.capitalizeString(tag)}</p>
			})
		}

		if (this.state.domains) {
			domainsArr = Object.keys(this.state.domains).map(dom => {
				return <p key={dom}>{dom}</p>
			})
		}
		
		return (
			<div style={{display: "flex"}}>
				{/*side bar*/}
				<div 
					className="right"
					style={{
						width: "25%", 
						height: "100vh", 
						boxShadow: "0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12)", 
						borderRight: "1px solid #e0e0e0",
						background: "#fafafa",
						padding: "10px"
					}}
				>
					<h2 style={{fontWeight: 'lighter', fontSize: '18pt', marginBottom : "5px"}}>Recent Activity</h2>
					{typesArr}

					<h2 style={{fontWeight: 'lighter', fontSize: '18pt', marginBottom : "5px"}}>Tags</h2>
					{tagsArr}

					<h2 style={{fontWeight: 'lighter', fontSize: '18pt', marginBottom : "5px"}}>Domains</h2>
					{domainsArr}
				</div>

				{/*Content*/}
				<div 
					className="left"
					style={{width: '75%', height: "100vh", overflowY: "scroll"}}
				>
					<MessageArea messages={newMessages} title="New links"/>
					<MessageArea messages={oldMessages} title="older links"/>
				</div>
			</div>
		)
    }
}
