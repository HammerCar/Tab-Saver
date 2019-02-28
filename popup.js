var currentWindowId;
var currentWindowTabs;
var currentWindowOpenTabIndex;
var savedWindows;

var CreateWindowList = () => {
	$('#windows').empty();

	var empty = true;
	for (var window in savedWindows) {
		empty = false;

		var tabs = `<div class="tabUrls" id="tabs${window}">`;
		for (var tab in savedWindows[window].tabs) {
			tabs += `<a href="${savedWindows[window].tabs[tab]}" target="_blank">${savedWindows[window].tabs[tab]}</a><br>`;
		}
		tabs += '</div>';

		$('#windows').append(`<div class="window" id="window${window}"><img id="arrow${window}" class="arrow" src="arrow.png"><p class="winName">${savedWindows[window].name}</p><button class="openButton" id="openBtb${window}">Open</button>${tabs}</div>`);
		$('#window' + window).click((e) => {
			if (e.target.id == $('#window' + window).attr('id') ||
				e.target.id == $('#arrow' + window).attr('id')) 
			{
				$('#tabs' + window).toggleClass('tabUrlsHidden');
				$('#arrow' + window).toggleClass('arrowOpen');
			}
		});
		$('#openBtb' + window).click(() => {
			OpenWindow(window)
		})
		$('#tabs' + window).addClass('tabUrlsHidden');
	}

	if (empty) {
		$('#windows').append(`<p>You have no windows saved</p>`);
	}
}

var SaveWindow = (name) => {
	if (name == undefined || name == '') {
		name = 'Tabs';
	}

	var tabUrls = [];
	currentWindowTabs.forEach(tab => {
		tabUrls.push(tab.url);
	});

	savedWindows.push({
		name: name,
		openTabIndex: currentWindowOpenTabIndex,
		tabs: tabUrls
	});

	SaveWindowsToStorage();
	CloseWindow(currentWindowId);
	
	CreateWindowList();

	SetIconNumber(savedWindows.length);
	window.close();
}

var OpenWindow = (savedWindow) => {
	var win = savedWindows[savedWindow];

	var index = savedWindows.indexOf(savedWindows[savedWindow]);
	if (index > -1) {
		savedWindows.splice(index, 1);
	}

	SaveWindowsToStorage();
	CreateWindow(win.tabs, win.openTabIndex);
	
	CreateWindowList();

	SetIconNumber(savedWindows.length);
	window.close();
}



var CreateWindow = (urls, activeTab) => {
	chrome.windows.create({
		url: urls
	}, (window) => {
		chrome.tabs.highlight({ windowId: window.id, tabs: activeTab }, () => {

		})
	});
}

var CloseWindow = (windowId) => {
	chrome.windows.remove(windowId, () => {

	});
}

var SaveWindowsToStorage = () => {
	chrome.storage.sync.set({windows: savedWindows}, function() {
		console.log('Windows saved to storage');
	});
}

var SetIconNumber = (num) => {
	if (num > 10) {
		num = '10+'
	}
	if (num <= 0) {
		num = '';
	}

	chrome.browserAction.setBadgeText({ text: num.toString() })
}

chrome.storage.sync.get(['windows'], function(result) {
	savedWindows = result.windows;

	if (!Array.isArray(savedWindows)) {
		savedWindows = [];
	}

	CreateWindowList();
	SetIconNumber(savedWindows.length);
});

chrome.windows.getCurrent((window) => {
	currentWindowId = window.id;
	chrome.tabs.query({windowId: window.id}, (tabs) => {
		currentWindowTabs = tabs;
		currentWindowOpenTabIndex = tabs.findIndex(tab => tab.active);
	});
})



$('#saveButton').click(() => {
	SaveWindow($('#name').val());
})
