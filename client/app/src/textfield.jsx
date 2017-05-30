import React from "react"
import {render} from "react-dom"

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: (this.props.value ? this.props.value : "")
        }
    }

    handleInputChange(inputVal) {
        this.setState({value: inputVal})
        this.props.handleChange(this.props.propName, inputVal)
    }

    render() {
        return (
            <div className="field">
                <label className="label">{this.props.label}</label>
                <p className="control has-icons-left has-icons-right">
                    <input 
                        onChange={(e) => this.handleInputChange(e.target.value)} 
                        className="input" 
                        type={this.props.inputType} 
                        placeholder={this.props.label + " input" }
                        value={this.state.value} 
                    />
                    <span className="icon is-small is-left">
                        {this.props.children}
                    </span>
                </p>
            </div>            
        )
    }
