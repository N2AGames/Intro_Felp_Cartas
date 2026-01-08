function saveToSessionStorage(key, value) {
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(value));
    } else {
        console.warn('Session storage is not available.');
    }
}

function getFromSessionStorage(key) {
    if (typeof sessionStorage !== 'undefined') {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } else {
        console.warn('Session storage is not available.');
        return null;
    }
}