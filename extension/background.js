const tailscaleDaemonUrl = 'http://127.0.0.1:5000';
let activeDomains = new Set(); // Set to track active domains that require Tailscale
let tabDomainMap = {}; // Map to track domain associated with each tab

function extractDomain(url) {
    const domain = (new URL(url)).hostname;
    const domainParts = domain.split('.').filter(part => part !== 'www');
    return domainParts.slice(-2).join('.');
}

async function updateTailscaleState(shouldEnable, exitNode = null) {
    console.log('updateTailscaleState called with shouldEnable:', shouldEnable, 'and exitNode:', exitNode);

    if (shouldEnable) {
        try {
            const response = await fetch(`${tailscaleDaemonUrl}/tailscale/up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ exit_node: exitNode })
            });

            if (response.ok) {
                console.log('Tailscale enabled for domain:', exitNode);
            } else {
                console.error('Failed to enable Tailscale. Status:', response.status, 'Status Text:', response.statusText);
            }
        } catch (error) {
            console.error('Error enabling Tailscale:', error);
        }
    } else {
        try {
            const response = await fetch(`${tailscaleDaemonUrl}/tailscale/down`, {
                method: 'POST'
            });

            if (response.ok) {
                console.log('Tailscale disabled');
            } else {
                console.error('Failed to disable Tailscale. Status:', response.status, 'Status Text:', response.statusText);
            }
        } catch (error) {
            console.error('Error disabling Tailscale:', error);
        }
    }
}

function handleDomainForTab(tabId, domain) {
    console.log('handleDomainForTab called with tabId:', tabId, 'and domain:', domain);

    chrome.storage.sync.get(['domainSettings'], function(data) {
        const domainSettings = data.domainSettings || {};

        if (domainSettings[domain]) {
            console.log('Domain settings found for:', domain);
            const exitNode = domainSettings[domain].exitNode;

            if (!activeDomains.has(domain)) {
                console.log('Adding domain to activeDomains and enabling Tailscale:', domain);
                activeDomains.add(domain);
                tabDomainMap[tabId] = domain; // Map the domain to the tab
                updateTailscaleState(true, exitNode);
            }
        } else {
            console.log('No domain settings found for:', domain);

            if (activeDomains.has(domain)) {
                console.log('Removing domain from activeDomains:', domain);
                activeDomains.delete(domain);
                delete tabDomainMap[tabId];

                if (activeDomains.size === 0) {
                    console.log('No more active domains. Disabling Tailscale.');
                    updateTailscaleState(false);
                }
            }
        }
    });
}

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        const domain = extractDomain(details.url);
        console.log('webRequest onBeforeRequest for domain:', domain);

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const tabId = tabs[0].id;
            handleDomainForTab(tabId, domain);
        });

        return {};
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete') {
        const domain = extractDomain(tab.url);
        console.log('Tab updated. URL:', tab.url, 'Domain:', domain);
        handleDomainForTab(tabId, domain);
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    console.log('Tab removed. TabId:', tabId);

    const removedDomain = tabDomainMap[tabId];
    if (removedDomain && activeDomains.has(removedDomain)) {
        console.log('Removing domain from activeDomains on tab removal:', removedDomain);
        activeDomains.delete(removedDomain);
        delete tabDomainMap[tabId];

        // Check for remaining active domains
        chrome.tabs.query({}, function(tabs) {
            const remainingDomains = new Set();
            tabs.forEach(t => {
                const domain = extractDomain(t.url);
                if (activeDomains.has(domain)) {
                    remainingDomains.add(domain);
                }
            });

            if (remainingDomains.size > 0) {
                console.log('Switching Tailscale to the remaining active domain.');
                const remainingDomain = [...remainingDomains][0]; // Choose one of the remaining domains
                chrome.storage.sync.get(['domainSettings'], function(data) {
                    const domainSettings = data.domainSettings || {};
                    if (domainSettings[remainingDomain]) {
                        const exitNode = domainSettings[remainingDomain].exitNode;
                        updateTailscaleState(true, exitNode);
                    }
                });
            } else {
                console.log('No active domains remaining. Disabling Tailscale.');
                updateTailscaleState(false);
            }
        });
    }
});
