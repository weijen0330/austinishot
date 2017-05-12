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

		if (this.state.types && this.state.newAll && this.state.newArticles && this.state.newImages && this.state.newVideos) {
			typesArr = Object.keys(this.state.types).map(key => {
				return (<p key={key} className="home-not-option">

					<span className="icon">
						<i className={"fa " + this.state.types[key]}></i>
					</span>
					
					<span style={{marginLeft: '7px'}}>{key}</span>					

					{this.state['new' + key].length ? (
						<span className="tag is-info" style={{float: 'right'}}>
							{this.state['new' + key].length + ' new'}
						</span>
					) : ""}					
				</p>)
			})
		}

		if (this.state.tags) {
			tagsArr = Object.keys(this.state.tags).map(tag => {
				return <dd style={{marginBottom: "5px"}} key={tag}>{this.capitalizeString(tag)}</dd>
			})
		}

		if (this.state.domains) {
			domainsArr = Object.keys(this.state.domains).map(dom => {
				return <dd style={{marginBottom: "5px"}} key={dom}>{dom}</dd>
			})
		}
		
		return (
			<div className="columns is-mobile">
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
				<div className="column is-9" style={{height: '100vh', overflowY: 'scroll'}}>
					<MessageArea messages={newMessages} title="New links" />
					<MessageArea messages={oldMessages} title="Older links" />
				</div>
			</div>
		)
    }
}