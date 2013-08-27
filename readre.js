
"use strict";

function Readre(el) {

	// Constants
	var READRE_REFLOW_DELAY = 200;

	// Environment
	var contentHeight, contentWidth,
		containerHeight, containerWidth,
		children, Lc,
		buffer, pages,
		page, position, referenceChild, topChildNo,
		events,
		R;

	// Process
	var Hs, Hns, nextEl, div, nextNextEl, Hel, resize;

	// Let's fire her up
	pages = [];
	events = {};

	init();
	// reinit(); // The client must do this, because it knows when it's ready

	// Do this once
	function init() {
		buffer = document.createElement('div');
// window.buffer = buffer;

		window.addEventListener('resize', function(e) {
			resize && clearTimeout(resize);
			resize = setTimeout(reflow, READRE_REFLOW_DELAY);
		}, false);
	}

	// Do this when the content changes
	function reinit() {
		// Remove white-space
		for ( var i=0, C=el.childNodes, L=C.length; i<L; i++ ) {
			if ( C[i].nodeType != Node.ELEMENT_NODE ) {
				el.removeChild(C[i]);
				i--;
				L--;
			}
		}

		// Combine Hn + * so that Hn's are never orphaned
		// @TODO -- THIS IS A HACK and should be improved, preferably by
		// something shadow-dom or other **unobtrusive** tek
		// Hns = el.querySelectorAll('h1, h2, h3, h4, h5, h6');
// console.log('Hns', Hns);
		Hns = [].filter.call(el.childNodes, function(h) { return /^H\d$/.test(h.nodeName) });
// console.log('Hns', Hns);
		for ( var i=0, L=Hns.length; i<L; i++ ) {
			Hel = Hns[i];
// console.log('Hel', Hel);
			nextEl = Hel.nextSibling;

			if ( !/^H\d$/.test(nextEl.nodeName) ) {
				nextNextEl = nextEl.nextSibling;

				div = document.createElement('div');
				div.classList.add('readre-anti-orphan');
				div.appendChild(Hel);
				div.appendChild(nextEl);

				// Reappend to el
				if ( nextNextEl ) {
					el.insertBefore(div, nextNextEl);
				}
				else {
					el.appendChild(div);
				}
			}
		}

// debugPages();

		// The list of children won't change
		children = [].slice.call(el.childNodes);
		Lc = children.length;

		// Calculate pages
		reflow();

		return R;
	}

	// Do this when the boundaries change (content, screen size, font size etc)
	function reflow() {
		containerHeight = el.offsetHeight;
		containerWidth = el.offsetWidth;

		contentHeight = el.scrollHeight;
		contentWidth = el.scrollWidth;

		// Save elements to buffer
		for ( var i=0; i<Lc; i++ ) {
			moveToBuffer(children[i]);
		}

		pages.length = 0;
		pages.push([]);

		// Calculate pages
		for ( var p = 0, i=0; i<Lc; i++ ) {
			moveToEl(children[i], true);
			pages[p].push(i);

			Hs = el.scrollHeight;

			if ( Hs > containerHeight ) {
				// Move last element back to buffer
				moveToBuffer(el.lastChild);
				pages[p].pop();

				// Next page
				i--;
				p++;
				pages.push([]);

				// Clear el
				moveElToBuffer();
			}
		}

debugPages();

		fireEvent('reflow');

		// Open page
		// showPage(position ? Math.floor(position * pages.length) : 0, true);
// console.log('topChildNo', topChildNo);
		showPage(topChildNo ? pageByChildNo(topChildNo) : 0, true);

		// Hilite reference child?
		if ( topChildNo ) {
// console.log('topChildNo', topChildNo);
			children[topChildNo].classList.add('readre-reference-child');
		}
	}

	function pageByChildNo(no) {
		for ( var i=0, L=pages.length; i<L; i++ ) {
			if ( -1 != pages[i].indexOf(no) ) {
				return i;
			}
		}
	}

	function showPage(n, internal) {
		// Clear el
		moveElToBuffer();

		isNaN(n) && (n = 0);
		n = Math.max(0, Math.min(pages.length-1, n));

		for ( var i=0, P = pages[n], L=P.length; i<L; i++ ) {
			el.appendChild(children[P[i]]);
		}

		R.page = page = n;
		fireEvent('page');

		if ( !internal ) {
			position = (page / pages.length) || 0;
			topChildNo = P[0];

			// Remove reference hilite
			if ( referenceChild = el.querySelector('.readre-reference-child') ) {
				referenceChild.classList.remove('readre-reference-child');
				topChildNo = null;
			}
		}

		return false;
	}

	function moveToEl(child, bottom) {
		if ( bottom || !el.firstChild ) {
			el.appendChild(child);
		}
		else {
			el.insertBefore(child, el.firstChild);
		}
	}

	function moveElToBuffer() {
		while ( el.firstChild ) {
			moveToBuffer(el.firstChild);
		}
	}

	function moveToBuffer(child) {
		buffer.appendChild(child);
	}

	function debugPages() {
		var d = [], d2 = [];
		for ( var i=0, L=pages.length; i<L; i++ ) {
			d2 = [];
			for ( var j=0, M=pages[i].length; j<M; j++ ) {
				d2.push(children[pages[i][j]].textContent.split(' ')[0])
			}
			d.push(d2.join(', '))
		}
		console.log('Pages: [' + d.join('] [') + ']');
	}

	// Events

	function addEvent(type, callback) {
		events[type] || (events[type] = []);
		events[type].push(callback);

		return R;
	}

	function fireEvent(type) {
		if ( events[type] ) {
			for ( var E=events[type], i=0, L=E.length; i<L; i++ ) {
				E[i].call(R);
			}
		}
	}

	return R = {
		reinit: reinit,
		pages: pages,
		addEvent: addEvent,
		showPage: showPage,
		page: page

		,debugPages: debugPages
	};

}
