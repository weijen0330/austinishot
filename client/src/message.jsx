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
                <span key={tag} style={{marginLeft: '5px'}} className="tag is-light">{tag}</span>
            )
        })
        return (
           <div className="box" style={{minHeight: '200px', width: '70%', marginLeft: 'auto', marginRight: 'auto', paddingBottom: '12px'}}>
               <article className="media" style={{marginBottom: '5px'}}>

                   <div className="media-left" style={{width: '25%'}}>
                       <figure className="image" style={{maxHeight: '100%', maxWidth: '100%'}}>
                           <img src={urlData.image} alt="" />
                       </figure>
                   </div>

                   <div className="media-content">
                       <div className="content">                           
                           <h3 className="title" style={{marginBottom: 0}}><a target="_blank" href={urlData.url}>{urlData.title}</a></h3>
                           <p>
                                {urlData.description} 
                                <br /> 
                                <small >from {urlData.site_name}</small>
                            </p>
                           <p>
                               <strong>{urlData.from}</strong>
                                <small style={{marginLeft: '5px'}}>via {urlData.service}</small>
                                <small style={{marginLeft: '5px'}}>{urlData.time} ago</small>
                           </p>
                       </div>
                   </div>
               </article>

               <div>{tags}</div>

                <a className="button is-white is-small" style={{marginLeft: '6.5px', marginTop: '10px'}}>
                    <span className="icon">
                        <i className="fa fa-plus-circle"></i>
                    </span>
                    &nbsp;
                    <span>Add tags</span>
                </a>
           </div>
        )
    }
}
