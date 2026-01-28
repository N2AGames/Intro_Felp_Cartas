function saveToSessionStorage(key, value) {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        console.warn('Session storage is not available.');
    }
}

function getFromSessionStorage(key) {
    if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } else {
        console.warn('Session storage is not available.');
        return null;
    }
}