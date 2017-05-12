import React from "react";
import {render} from "react-dom";
import "whatwg-fetch";


export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            urlData: {}
		};
    }

    componentDidMount() {
        var data = localStorage.getItem(this.props.message.url)
        if (!data) {
            fetch("https://info344api.enamarkovic.com/v1/summary?url=" + this.props.message.url)
            .then(response => {                
                if (response.ok) {
                    return response.json()
                }
                throw new Error("could not get link data")
            })
            .then(respData => {
                localStorage.setItem(this.props.message.url, JSON.stringify(respData))
                this.setState({urlData: respData})
            })
            .catch(console.log)
        } else {
            this.setState({urlData: JSON.parse(data)})
        }      
    }

	render() {
        var content = ""
        if (this.state.urlData) {
            var urlData = this.state.urlData
            if (urlData.description && urlData.image && urlData.title) {
                content = (
                    <div className="content">
                        <div className="content-left">
                            <img src={urlData.image} />
                        </div>
                        <div className="content-right">
                            <h2><a target="_blank" href={this.props.message.url}>{urlData.title}</a></h2>
                            <p>{urlData.description}</p>
                        </div>
                    </div>
                )
            }
        }        
        return (
            <div className="message">
                {content}
            </div>
        )
    }
}
