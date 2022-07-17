//establish connection to IndexedDB
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = event => {
    const db = request.result;
    console.log(event)

    db.createObjectStore('adjustment', { autoIncrement: true })
}

request.onsuccess = event => {
    console.log(`Success! ${event.type}`)

    if(navigator.onLine) {
        uploadBudget()
    }
}

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const db = request.result
    const transaction = db.transaction(['adjustment'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('adjustment');

    budgetObjectStore.add(record)
}

function uploadBudget() {
    const db = request.result;
    const transaction = db.transaction(['adjustment'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('adjustment');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: `POST`,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: `application/json, text/plain, */*`,
                    'Content-Type': `application/json`
                },
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['adjustment'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('adjustment');

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