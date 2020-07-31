"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
    if (!window._gmailjs) {
        return;
    }

    clearInterval(loaderId);
    startExtension(window._gmailjs);
}, 100);

const footnote_re = /^\[\d+\]/;

function find_footnotes(pars) {
    var par;
    var footnotes = {};
    for (par of pars) {
	var match = par.innerText.match(footnote_re);
	if (match) {
	    footnotes[match[0]] = match["input"];
	}
    }
    return footnotes;
}

function decorate_footnotes(pars, footnotes) {
    var par;
    for (par of pars) {
	var text = par.innerText;
	if (text.search(footnote_re) == -1) {
	    for (fn in footnotes) {
		if (text.includes(fn)) {
		    add_hover(par, fn, footnotes[fn]);
		}
	    }
	}
    }
}

function add_hover(par, foot_num, footnote) {
    var tag = document.createElement("span");
    tag.className = "footnote";
//    tag.setAttribute("data-toggle", "tooltip");
    tag.setAttribute("title", footnote.split(foot_num)[1]);
    tag.innerText = foot_num;
    var text = par.innerHTML.split(foot_num);
    par.innerHTML = text[0] + tag.outerHTML + text[1];
//    par.style.color = 'green';
}

function onEmailView(obj) {
    var pars = obj.dom('body').find("p");
    var footnotes = find_footnotes(pars);
    decorate_footnotes(pars, footnotes);
}

// actual extension-code
function startExtension(gmail) {
    window.gmail = gmail;
    gmail.observe.on("view_email", (email) => {
	setTimeout(() => {onEmailView(email)}, 1000)})
}
