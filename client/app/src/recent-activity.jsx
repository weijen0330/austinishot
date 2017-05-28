import React from "react";
import {render} from "react-dom";

import RecentActivity from './recent-activity.jsx'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {    
			        
		};
    }

	handleViewClick(view) {
		this.props.switchView(view)
	}

	render(){
        var newArticles = "", newImages = "", newVideos = ""
        if (this.props.newArticles > 0) {
            newArticles = this.props.newArticles + " New"
        } 
        if (this.props.newImages > 0) {
            newImages = this.props.newImages + " New"
        }
        if (this.props.newVideos > 0) {
            newVideos = this.props.newVideos + " New"
        }
        

		return (
			<div className="container">
				<h1 style={{textAlign: "center"}}>Recent Activity</h1>

				<ul style={{paddingLeft: 0}}>
					
                    {/*Articles*/}
                    <li className="home-not-option">
						<i className="fa fa-file-text-o" aria-hidden="true"></i>
						<span>Articles</span> 
						<button 
							className="mdl-button mdl-js-button mdl-button--accent"
							onClick={this.handleViewClick.bind(this, "articles")}
						>
							{newArticles}
							<i className="fa fa-chevron-right" aria-hidden="true"></i>
						</button>
					</li>

                    {/*Photos*/}
					<li className="home-not-option">
						<i className="fa fa-picture-o" aria-hidden="true"> </i> 
						<span>Images</span>
						<button 
							className="mdl-button mdl-js-button mdl-button--accent"
							onClick={this.handleViewClick.bind(this, "images")}
						>
							{newImages}
							<i className="fa fa-chevron-right" aria-hidden="true"></i>
						</button>
					</li>

                    {/*Videos*/}
					<li className="home-not-option">
						<i className="fa fa-video-camera" aria-hidden="true"></i> 
						<span>Videos</span>
						<button 
							className="mdl-button mdl-js-button mdl-button--accent"
							onClick={this.handleViewClick.bind(this, "videos")}
						>
							{newVideos}
							<i className="fa fa-chevron-right" aria-hidden="true"></i>
						</button>
					</li>

				</ul>
				
			</div>
		)
    }
}