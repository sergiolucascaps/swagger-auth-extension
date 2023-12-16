let localstorageconfig = localStorage.getItem("facilauthconfig");
let environment = document.querySelector("input[type='radio'][name=env]:checked").value;
let txt_email = document.getElementById('txt_email');
let txt_key = document.getElementById('txt_key');
let txt_apiversion = document.getElementById('txt_apiversion');

class AuthConfig {

    email = '';
    key = '';
    environment = '';
    apiversion = '';

    constructor(email, key, environment, apiversion) {
        this.email = email;
        this.key = key;
        this.environment = environment;
        this.apiversion = apiversion;
    }
}

async function getCurrentTab() {
    return await chrome.tabs.query({active: true, currentWindow: true});
}

function isValid() {

    if(txt_email.value == null || txt_email.value.trim() == '')
        return false;
    else if(txt_key.value == null || txt_key.value.trim() == '')
        return false;
    else if(txt_apiversion.value == null || txt_apiversion.value.trim() == '')
        return false;

    return true;
}

async function authenticate() {

    if(!isValid()) {
        alert("Falta preencher dados!")
        return;
    }

    const [currentTab] = await getCurrentTab();
    let config = new AuthConfig(txt_email.value, txt_key.value, environment, txt_apiversion.value);
    localStorage.setItem("facilauthconfig", JSON.stringify(config));
    await chrome.tabs.sendMessage(currentTab.id, config);
}

document.getElementById("btn-auth").addEventListener("click", async () => {
    await authenticate();
});

if(localstorageconfig != null) {
    let config = JSON.parse(localstorageconfig);

    txt_email.value = config.email;
    txt_key.value = config.key;
    txt_apiversion.value = config.apiversion;
}