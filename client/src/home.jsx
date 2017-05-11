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
				<div className="container">
	    	
			    	
					  
					
						<span className="mdl-chip mdl-chip--deletable">
						    <span className="mdl-chip__text"> <i className="fa fa-bell" aria-hidden="true"></i> You have 15 new links</span>
						    <button type="button" className="mdl-chip__action"><i className="material-icons">cancel</i></button>
						</span>
					


			    	<h2>Recent Activity</h2>
			    	<ul>
			    		<hr />
			    		<li>
			    			<i className="fa fa-video-camera" aria-hidden="true"></i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
						<hr />
						<li>
			    			<i className="fa fa-picture-o" aria-hidden="true"> </i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
						<hr />
						<li>
			    			<i className="fa fa-link" aria-hidden="true"></i> 
			    			<button className="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent">
							  5 new
							</button>
						</li>
						<hr />
			    	</ul>
				    
			    </div>
				)
    }
}