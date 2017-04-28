import React from "react";
import {render} from "react-dom";

import App from "./app.jsx";
import Main from "./main.jsx";
import Nav from "./nav.jsx";



render(<App />, document.getElementById("app"));

render(<Nav home="active" search="" settings="" />, document.getElementById("nav-area"));

render(<Main/>, document.getElementById("main"));

var links = document.querySelectorAll(".nav li");
for(var i = 0; i < links.length; i++){
	links[i].onclick = toggleNav;
}

function toggleNav(event){
	var navItem = event.target.innerHTML;
	switch(navItem){
		case "Settings":
			render(<Nav home="" search="" settings="active"/>, document.getElementById("nav-area"));
			break;
		case "Search":
			render(<Nav home="" search="active" settings=""/>, document.getElementById("nav-area"));
		default:
			render(<Nav home="active" search="" settings=""/>, document.getElementById("nav-area"));

	}
}

