import { fromEvent, merge, Observable, of, from, concat } from "rxjs";
import {
  filter,
  tap,
  map,
  ignoreElements,
  mergeMap,
  combineAll,
  share,
  switchMap,
  concatMap,
  withLatestFrom
} from "rxjs/operators";

function transaction(storeNames, mode) {
  return function(dbEvent$) {
    const transaction$ = dbEvent$.pipe(
      map(db => db.transaction(storeNames, mode))
    );

    const transactionComplete$ = transaction$.pipe(
      mergeMap(transaction => fromEvent(transaction, "complete")),
      share()
    );

    return merge(transaction$, transactionComplete$);
  };
}

function transactionComplete(cb) {
  return function(stream$) {
    const transactionCompleteEvent$ = stream$.pipe(
      filter(
        ({ type, target }) =>
          type === "complete" && target instanceof IDBTransaction
      ),
      tap(event => {
        cb && typeof cb === "function" && cb(event);
      })
    );

    return merge(stream$, transactionCompleteEvent$).pipe(
      filter(
        ({ type, target }) =>
          type !== "complete" && !(target instanceof IDBTransaction)
      ),
      share()
    );
  };
}

function upgrade(upgradeFunction) {
  // => needs to return an observable!
  // this could also be written in typescript to help this
  if (!upgradeFunction || typeof upgradeFunction !== "function") {
    throw new Error("Upgrade callback not supplied to upgrade operator");
  }
  return function(upgradeDB$) {
    const db$ = upgradeDB$.pipe(
      filter(({ type }) => type === "upgradeneeded"),
      map(({ target, oldVersion, newVersion }) => ({
        db: target.result,
        oldVersion,
        newVersion
      }))
    );

    const upgraded$ = upgradeFunction(db$);

    // second verse, same as the first
    if (!(upgraded$ instanceof Observable)) {
      throw new TypeError("Upgrade callback must return an observable");
    }

    return merge(upgraded$.pipe(ignoreElements()), upgradeDB$).pipe(
      filter(({ type }) => type !== "upgradeneeded"),
      share()
    );
  };
}

function createObjectStore(name, config = {}) {
  return function(db$) {
    const objectStoreCreation$ = db$.pipe(
      map(({ db }) => {
        const objectStore = db.createObjectStore(name, config);
        return objectStore;
      }),
      share()
    );
    return objectStoreCreation$;
  };
}

function createIndex(indexName, keyPath, objectParameters = {}) {
  return function(objectStore$) {
    const indexCreation$ = objectStore$.pipe(
      tap(objectStore => {
        objectStore.createIndex(indexName, keyPath, objectParameters);
      })
    );
    return indexCreation$;
  };
}

function openDB(name, version) {
  const request = window.indexedDB.open(name, version);

  const success$ = fromEvent(request, "success").pipe(
    map(event => event.target.result)
  );
  const error$ = fromEvent(request, "error");
  const upgrade$ = fromEvent(request, "upgradeneeded");
  const blocked$ = fromEvent(request, "blocked");
  const blocking$ = fromEvent(request, "versionchange");

  return merge(success$, error$, upgrade$, blocked$, blocking$);
}

function objectStore(name) {
  return function(transaction$) {
    const objectStore$ = transaction$.pipe(
      filter(event => event.type !== "complete"),
      map(i => {
        if (i instanceof IDBTransaction) {
          return i.objectStore(name);
        }

        if (i instanceof IDBDatabase) {
          return i.transaction(name, "readwrite").objectStore(name);
        }

        return i.target.transaction.objectStore(name);
      })
    );
    return objectStore$;
  };
}

function index(name) {
  return function(objectStore$) {
    const index$ = objectStore$.pipe(
      map(objectStore => objectStore.index(name))
    );
    return index$;
  };
}

function add(data) {
  return function(objectStore$) {
    const entry$ = objectStore$.pipe(
      map(os => os.add(data)),
      mergeMap(request => fromEvent(request, "success")),
      map(event => event.target.result)
    );

    return entry$;
  };
}

function getAll() {
  return function(objectStore$) {
    const entries$ = objectStore$.pipe(
      map(os => os.getAll()),
      mergeMap(request => fromEvent(request, "success")),
      map(event => event.target.result)
    );

    return entries$;
  };
}

function get(key) {
  return function(objectStore$) {
    const entry$ = objectStore$.pipe(
      map(os => os.get(key)),
      mergeMap(request => fromEvent(request, "success")),
      map(event => event.target.result)
    );
    return entry$;
  };
}

// example starts here

const db$ = openDB("todoList", 8).pipe(
  upgrade(db$ => {
    const todosOS$ = db$.pipe(
      createObjectStore("todos", { keyPath: "id" }),
      createIndex("task", "task")
    );

    const usersOS$ = db$.pipe(
      createObjectStore("users", { keyPath: "id" }),
      createIndex("name", "name")
    );

    return merge(todosOS$, usersOS$);
  })
);

// open a transaction
const tx$ = db$.pipe(
  transaction(["users", "todos"], "readwrite"),
  transactionComplete(() => {
    console.log("tx complete");
  })
);

// open an object store
const usersObjectStore$ = tx$.pipe(objectStore("users"));

function getUser(i) {
  return usersObjectStore$.pipe(get(i));
}

// we'll add a user here
const addUser$ = usersObjectStore$
  .pipe(
    add({
      name: "carson",
      id: Math.floor(new Date() / 1000)
    }),
    switchMap(getUser)
  )
  .subscribe(console.log);

// we'll get all of our users here
const getUsers$ = usersObjectStore$.pipe(getAll());

// subscribe to the thing
// merge(getUsers$, addUser$, getUsers$).subscribe(console.log);
