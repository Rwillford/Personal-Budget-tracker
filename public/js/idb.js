//create variable to hold db connection
let db;

//establish connection to IndexedDB
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;

    db.createObjectStore('transaction', { autoIncrement: true })
}

request.onsuccess = function(event) {
    db = event.target.result;

    if(navigator.onLine) {
        uploadBudget()
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('transaction');

    budgetObjectStore.add(record)
}

function uploadBudget() {
    const transaction = db.transaction(['transaction'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('transaction');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.results.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Types': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverRsponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse)
                }
                const transaction = db.transaction(['transaction'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('transaction');

                budgetObjectStore.clear();

                alert('All of the saved Budget changes have been submitted!')
            })
            .catch(err => {
                console.log(err)
            });
        }

    }
}

//Listen for the app to come back online
window.addEventListener('online', uploadBudget);