import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            tags: [],
            isRead: Number(this.props.msg.isRead)
		}
     
    }

    componentDidMount() {
        if (this.addTagInput) {
            this.addTagInput.focus()
        }
    }

    openAddTag() {
        this.setState({editing: true})

    }
    closeAddTag() {        
        var value = (this.addTagInput.value).split(',').map(str => str.trim()).filter(str => str.length)
        var tags = this.state.tags;
        tags = tags.concat(value)
        this.setState({editing: false, tags: tags}) 
        console.log(tags)

        let headers = new Headers()
        headers.set("Content-Type", "application/json")
        fetch("https://lynxapp.me/api/tags/" + this.props.msg.messageId, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({tags: tags})
        }).then(response => {
            if (response.ok) {
                console.log("added tags to db ok")
            }
        })
    }

    handleSeenButtonClicked() {
        const isRead = !this.state.isRead
        this.setState({isRead: isRead})
        
        let url = "https://lynxapp.me/api/messages/read/" + this.props.msg.messageId
        if (!isRead) { 
            url = "https://lynxapp.me/api/messages/unread/" + this.props.msg.messageId
        } 

        fetch(url, {
            method: "PATCH"            
        }).then(response => {
            if (response.ok) {
                console.log("msg mofifies")
            } else {
                console.log("error editing message")
            }
        })
        
        this.props.msg.isRead = isRead
        this.props.updateSeenStatus(this.props.msg)
    }
    
    handleDeleteMessageClick() {
        fetch("https://lynxapp.me/api/messages/" + this.props.msg.messageId, {
            method: "DELETE"            
        }).then(response => {
            if (response.ok) {
                console.log("msg deleted")
            } else {
                throw new Error()
            }
        }).catch(console.log)

        this.props.removeMessageFromUi({
            messageId: this.props.msg.messageId,
            type: this.props.msg.type,
            isRead: this.state.isRead
        })
    }

	render() {              
        var urlData = this.props.msg 
        var tags = [], addTags = "", titleAndDesc = "", mediaLeft = "", time
        if (this.state.tags) {
            tags = this.state.tags.map((tag, i) => {
                return (
                    <span key={tag + i} style={{marginLeft: '5px'}} className="tag is-light">{tag}</span>
                )
            })
        }

        if (this.state.editing) {
            addTags = (
                <div className="field has-addons" style={{marginLeft: '7px', marginTop: '7px'}}>
                    <p className="control" style={{width: '100%'}}>
                        <input 
                            ref={input => this.addTagInput = input}
                            className="input" 
                            type="text" 
                            placeholder="ex. Cute, funny" 
                            style={{height: '27px', fontSize: '0.75rem'}}
                        />
                    </p>
                    <p className="control">
                        <a 
                            className="button is-info" 
                            style={{height: '27px', fontSize: '0.75rem'}}
                            onClick={this.closeAddTag.bind(this)}
                        >
                            Add
                        </a>
                    </p>
                </div>
            )
        } else {
            addTags = (
                 <a 
                    className="button is-white is-small" 
                    style={{marginLeft: '6.5px', marginTop: '10px'}}
                    onClick={this.openAddTag.bind(this)}
                >
                    <span className="icon">
                        <i className="fa fa-plus-circle"></i>
                    </span>
                    &nbsp;
                    <span>Add tags</span>
                </a>
            )
        }
        
        if (urlData.title.length > 0) {
            titleAndDesc = (
                <div style={{marginBottom: '10px'}}>
                    <h3 className="title" style={{marginBottom: 0}}><a target="_blank" href={urlData.url}>{urlData.title}</a></h3>
                    <p>
                        {urlData.description} &nbsp;                                
                        <small >from {urlData.domainName}</small>
                    </p>
                </div>
            )
        } else {
            titleAndDesc = <h3 className="title" style={{marginBottom: 0}}><a target="_blank" href={urlData.url}>{urlData.url}</a></h3>
        }
        

        if (urlData.imageUrl.length > 0) {
            mediaLeft = (
                <div className="media-left" style={{width: '25%'}}>
                    <figure className="image" style={{maxHeight: '100%', maxWidth: '100%'}}>
                        <img src={urlData.imageUrl} alt="" />
                    </figure>
                </div>
            )
        }

        if (urlData.timeSent) {
            time = new Date(Number(urlData.timeSent) * 1000).toLocaleDateString()
        }



        return (
           <div className="box" style={{minHeight: '200px', width: '70%', marginLeft: 'auto', marginRight: 'auto', paddingBottom: '12px'}}>
               
               {/*unread and delete btns*/}
               <div style={{textAlign: 'right'}}>
                   <div 
                        className={this.state.isRead ? "message-seen-button message-read" : "message-seen-button message-unread"}
                        onClick={this.handleSeenButtonClicked.bind(this)}
                    ></div>                   
               </div>

               <article className="media" style={{marginBottom: '5px'}}>

                   {mediaLeft}

                   <div className="media-content">
                       <div className="content">                           
                           {titleAndDesc}

                           <p style={{marginBottom: '5px'}}>
                               <strong>{urlData.sender.length > 0 ? urlData.sender : "A friend"}</strong>
                                <small style={{marginLeft: '5px'}}>via {urlData.platformName}</small>
                                <small style={{marginLeft: '5px'}}>{time}</small>                                
                           </p>
                           <p>"{urlData.note}"</p>
                       </div>
                   </div>
               </article>

               <div>{tags}</div>               

               {addTags}        

                <div style={{textAlign: "right"}}>
                    <span 
                        onClick={this.handleDeleteMessageClick.bind(this)}
                        className="icon message-delete"
                    >
                        <i className="fa fa-trash-o"></i>
                    </span>
                </div>        
           </div>
        )
    }
}
