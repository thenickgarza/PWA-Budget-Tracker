// creates a variable to contain the database connection
let db;

// containes the connection to IndexDB calling it 'budget tracker' & sets the version to 1
const request = indexedDB.open("budget_tracker", 1);

// will change if the version in database will change
request.onupgradeneeded = function (event) {
    // saves to the the datase the event 
    const db = event.target;
    // an object to store (table) named new_budget, with auto increment;
    db.createObjectStore("new_budget", { autoIncrement: true });
};

request.onsuccess = function (event) {
    // if the db is successfully with the obejec store, save the reference to the global db vatiable
    db = event.target.result;
    // if the app is obline then run uploadTrans
    if (navigator.onLine) {
        uploadBudget()
    }
};

// handles the error
request.onerror = function (event) {
    // console logs the error
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["new_trans"], "readwrite");
    const transactionObjectStore = transaction.objectStore("new_trans");

    transactionObjectStore.add(record);
};

function uploadTrans() {
    // stores a transaction to the db
    const transaction = db.transaction(["new_trans"], "readwrite");
    // gives acces to the object store new trans
    const transactionObjectStore = transaction.objectStore("new_trans");
    // gets & stores all the data from the store 
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        // if there was data in indexedDb's store, let's send it to the api server
        if (getAll.result.length > 0) {
          fetch("/api/transaction", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
            },
          })
            .then((response) => response.json())
            .then((serverResponse) => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
             
              const transaction = db.transaction(["new_trans"], "readwrite");
              const transObjectStore = transaction.objectStore("new_trans");
              transObjectStore.clear();
    
              alert("All of your transactions have been submitted!");
            })
            .catch((err) => {
              console.log(err);
            });
        }
      };
    }


window.addEventListener('online', uploadTrans);