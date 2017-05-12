import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
		};
    }


	render() {              
        var urlData = this.props.msg 
        var tags = []
        
        tags = urlData.tags.map(tag => {
            return (
                <span 
                    key={urlData.id + tag} 
                    style={{
                        padding: "3px", 
                        background: "rgba(158,158,158,.2)", 
                        display: 'inline-block', 
                        textAlign: 'center', 
                        minWidth: '50px', 
                        marginRight: '5px'
                    }}
                >
                    {tag}
                </span>)
        })

        return (
            <div className="message">
                <div className="content">
                    <div className="content-left">
                        <img src={urlData.image} />
                    </div>
                    <div className="content-right">
                        <p style={{marginBottom: '5px', fontSize: '13pt'}}>
                            <strong>{urlData.from}</strong>
                            <small style={{marginLeft: '5px'}}>via {urlData.service}</small>
                            <small style={{marginLeft: '5px'}}>{urlData.time} ago</small>
                            <small style={{marginLeft: '5px'}}>from {urlData.site_name}</small>
                        </p>                        
                        <h2><a target="_blank" href={urlData.url}>{urlData.title}</a></h2>                        
                        <p>{urlData.description}</p>

                        <p>{tags}</p>
                    </div>                    
                </div>                
            </div>
        )
    }
}
