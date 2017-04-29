import React from "react";
import {render} from "react-dom";

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
		    videos: props.videos,
		    images: props.images,
		    links: props.links
		  };
    }


	render(){
		return (
				<div>
	    	
			    	<div className="alert alert-info">
					  <i className="fa fa-bell" aria-hidden="true"></i> You have 15 new links
						<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							dismiss
						</button>
					</div>


			    	<h2>Recent Activity</h2>
			    	<ul>
			    		<li>
			    			<i className="fa fa-video-camera" aria-hidden="true"></i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
						<li>
			    			<i className="fa fa-picture-o" aria-hidden="true"> </i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
						<li>
			    			<i className="fa fa-link" aria-hidden="true"></i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
			    	</ul>
				    
			    </div>
				)
    }
}