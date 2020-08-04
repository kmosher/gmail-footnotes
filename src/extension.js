"use strict";

const footnoteRE = /^\[\d+\]/;
const footnoteTimeout = 200;

function findFootnotes(pars) {
  var footnotes = {};
  for (var par of pars) {
    var match = par.innerText.match(footnoteRE);
    if (match) {
      footnotes[match[0]] = par.innerHTML;
    }
  }
  return footnotes;
}

function decorateFootnotes(pars, footnotes) {
  for (var par of pars) {
    var text = par.innerText;
    if (text.search(footnoteRE) == -1) {
      for (var fn in footnotes) {
        if (text.includes(fn)) {
          addHover(par, fn, footnotes[fn]);
        }
      }
    }
  }
}

function addHover(par, footNum, footnote) {
  var tag = document.createElement("span");
  tag.className = "footnote";
  tag.setAttribute("data-toggle", "tooltip");
  tag.setAttribute("title", footnote.split(footNum)[1]);
  tag.innerText = footNum.match(/\d+/)[0];
  var text = par.innerHTML.split(footNum);
  par.innerHTML = text[0] + tag.outerHTML + text[1];
  //    par.style.color = 'green';
}

function onEmailView() {
  console.log("Paragraphs changed");
  var pars = document.getElementsByTagName("p");
  var footnotes = findFootnotes(pars);
  decorateFootnotes(pars, footnotes);
  enableFootnotes();
}

function enableFootnotes() {
    $('[data-toggle="tooltip"]').each(
    function() {
      var $elem = $(this);
      $elem.tooltip({
        html: true,
//        placement: "auto",
        trigger: "manual",
//        trigger: "manual click focus", //"click hover focus",
        container: this.parentElement,
        viewport: this.parentElement,
        boundary: this.parentElement
      }).on('mouseenter', function() {
        clearTimeout(window.tooltipTimeout);
        if($('.tooltip:visible').length == 0) {
          $(this).tooltip('show')
        }
      }).on('mouseleave', function() {
        var _this = this;
        window.tooltipTimeout = setTimeout(function() {
          $(_this).tooltip('hide')
        }, footnoteTimeout)
      });
  });
}

$(document).on('mouseenter', '.tooltip', function() {
  clearTimeout(window.tooltipTimeout)
});

$(document).on('mouseleave', '.tooltip', function() {
  var trigger = $(this).siblings('.footnote')[0];
  window.tooltipTimeout = setTimeout(function() {
    $(trigger).tooltip('hide')}
  , footnoteTimeout)
});

var observer = new MutationSummary({
  callback: onEmailView,
  queries: [{ element: 'p' }]
});