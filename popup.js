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
			tabs += `<a href="${savedWindows[window].tabs[tab]}" target="_blank" title="${savedWindows[window].tabs[tab]}">${savedWindows[window].tabs[tab]}</a><br>`;
		}
		tabs += '</div>';

		$('#windows').append(`<div class="window" id="window${window}"><img id="arrow${window}" class="arrow" src="arrow.png"><p class="winName">${savedWindows[window].name}</p><button class="openButton" id="${window}">Open</button>${tabs}</div>`);
		
		$('#tabs' + window).addClass('tabUrlsHidden');
	}

	$('.window').click((e) => {
		if ($(e.target).hasClass('window') ||
			$(e.target).hasClass('arrow'))
		{
			var target = e.target;
			if ($(e.target).hasClass('arrow')) {
				target = $(e.target).parent('.window');
			}

			$(target).children('.tabUrls').toggleClass('tabUrlsHidden');
			$(target).children('.arrow').toggleClass('arrowOpen');

			$("html").height('0px');
			$("body").height('0px');
		}
	});
	$('.openButton').click((e) => {
		OpenWindow($(e.target).attr('id'))
	})

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
