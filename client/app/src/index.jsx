import React from "react";
import {render} from "react-dom";
import {HashRouter, Route} from "react-router-dom"

import App from "./app.jsx";
import LogIn from "./login.jsx"
import SignUp from "./signup.jsx"



const router = (
    <HashRouter>
        <div>
            <Route exact path="/" component={context => <App context={context} />} />
            <Route path="/signup" component={context => <SignUp context={context} />} />
            <Route path="/login" component={context => <LogIn context={context} />} />        
        </div>
    </HashRouter>
            
)

render(router, document.getElementById("app"));
