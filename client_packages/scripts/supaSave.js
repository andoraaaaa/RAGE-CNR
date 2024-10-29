let weaponShopBrowser = undefined;
let weaponShopEnabled = false;

mp.events.add("guiReady", () => {
    weaponShopBrowser = mp.browsers.new("package://cef/supaSave.html");
    weaponShopBrowser.active = false;
});

mp.events.add("browserDomReady", (browser) => {
    if (browser === weaponShopBrowser) mp.events.callRemote("requestWeaponData");
});

mp.events.add("receiveWeaponData", (jsonData) => {
    weaponShopBrowser.execute(`weaponData = JSON.parse('${jsonData}'); updatePage();`);
});

mp.events.add("displayWeaponShop", (display) => {
    weaponShopEnabled = display;
    weaponShopBrowser.active = display;
    mp.gui.cursor.visible = display;
});

mp.events.add("sendWeaponPurchase", (weaponIdx) => {
    mp.events.callRemote("requestWeaponPurchase", weaponIdx);
});

mp.events.add("receiveWeaponPurchase", (message) => {
    weaponShopBrowser.execute(`showResult("${message}")`);
});

// ESC - close the weapon shop menu
mp.keys.bind(0x1B, false, () => {
    if (weaponShopEnabled) mp.events.call("displayWeaponShop", false);
});