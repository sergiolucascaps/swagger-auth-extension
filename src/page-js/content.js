let key = '';
let email = '';
let url = 'https://brf-api-iuris-pagamentos{environment}.azurewebsites.net/api/{apiversion}/Token?key='

function setGlobals(request) {
    key = request.key;
    email = request.email;

    url = url.replace('{apiversion}', request.apiversion)

    switch(request.environment)
    {
        case '1':
            url = url.replace('{environment}', '-dev');
        break;

        case '2':
            url = url.replace('{environment}', '-qas');
        break;

        case '3':
            url = url.replace('{environment}', '');
        break;
    }
}

async function doRequest() {
    let urlComplete = url + key;
    let res = await fetch(urlComplete, {
        headers: {
            'userEmail': email
        }
    });

    if (res.ok) {

        let text = await res.text();

        return text;
    } else {
        return `HTTP error: ${res.status}`;
    }
}

async function getToken() {
    let token = '';

    await doRequest().then(data => {
        token = data;
    });

    return token;
}

function isAuthorized() {

    let allh6 = document.getElementsByTagName("h6");
    let authorized = false;

    for(let i = 0; i < allh6.length; i++) {
        if(allh6[i].innerHTML == 'Authorized') {
            authorized = true;
            break;
        }
    }

    return authorized;
}

async function authenticate() {

    let authorized = false;
    if(document.querySelector('[aria-label="auth-bearer-value"]') == null) {
        let btnAuth = document.getElementsByClassName("btn authorize unlocked")[0];

        if(btnAuth == null) {
            authorized = true;
            btnAuth = document.getElementsByClassName("btn authorize locked")[0];
        }

        btnAuth.click();
    }

    do { /* esperar enquanto não abre a modal*/ } while(document.querySelector(".auth-btn-wrapper .modal-btn.auth") == null);
    
    let tokenInput = document.querySelector(".auth-container input");
    let authButton = document.querySelector(".auth-btn-wrapper .modal-btn.auth");
    let closeButton = document.querySelector("button.btn-done");

    // unauthorize
    if(authorized) {
        authButton.click();
    }

    let token = await getToken();

    let nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(tokenInput, token);

    let inputEvent = new Event('input', { bubbles: true});
    tokenInput.dispatchEvent(inputEvent);
    authButton.click();
    closeButton.click();
}

function unauthenticate() {
    let authorized = false;
    if(document.querySelector('[aria-label="auth-bearer-value"]') == null) {
        let btnAuth = document.getElementsByClassName("btn authorize unlocked")[0];

        if(btnAuth == null) {
            authorized = true;
            btnAuth = document.getElementsByClassName("btn authorize locked")[0];
        }

        btnAuth.click();
    }

    do { /* esperar enquanto não abre a modal*/ } while(document.querySelector(".auth-btn-wrapper .modal-btn.auth") == null);
    
    let authButton = document.querySelector(".auth-btn-wrapper .modal-btn.auth");
    let closeButton = document.querySelector("button.btn-done");

    // unauthorize
    if(authorized) {
        authButton.click();
    }

    closeButton.click();
}

chrome.runtime.onMessage.addListener(async (request, sender, response) => {
    setGlobals(request);
    
    if(request.action === 1) {
        await authenticate();
    }
    else if(request.action === 2) {
        unauthenticate();
    }
});