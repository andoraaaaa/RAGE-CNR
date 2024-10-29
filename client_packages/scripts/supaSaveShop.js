let supaSaveBrowser = undefined;
let supaSaveEnabled = false;

mp.events.add("guiReady", () => {
    supaSaveBrowser = mp.browsers.new("package://cef/supa_save.html");
    supaSaveBrowser.active = false;
});

mp.events.add("browserDomReady", (browser) => {
    if (browser === supaSaveBrowser) mp.events.callRemote("requestSupaSaveData");
});

mp.events.add("receiveSupaSaveData", (jsonData) => {
    supaSaveBrowser.execute(`supaSaveData = JSON.parse('${jsonData}'); updatePage();`);
});

mp.events.add("displaySupaSaveShop", (display) => {
    supaSaveEnabled = display;
    supaSaveBrowser.active = display;
    mp.gui.cursor.visible = display;
});

mp.events.add("sendSupaSavePurchase", (itemIdx) => {
    mp.events.callRemote("requestSupaSavePurchase", itemIdx);
});

mp.events.add("receiveSupaSavePurchase", (message) => {
    supaSaveBrowser.execute(`showResult("${message}")`);
});

// ESC - close the Supa Save menu
mp.keys.bind(0x1B, false, () => {
    if (supaSaveEnabled) mp.events.call("displaySupaSaveShop", false);
});
