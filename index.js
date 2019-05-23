import { fromEvent, merge, of, Observable } from "rxjs";
import { filter, tap, map, ignoreElements, mergeMap } from "rxjs/operators";

function transaction(storeNames, mode) {
  return function(dbEvent$) {
    const transaction$ = dbEvent$.pipe(
      map(db => db.transaction(storeNames, mode))
    );

    return transaction$;
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
      filter(({ type }) => type !== "upgradeneeded")
    );
  };
}

function objectStore(name) {
  return function(transaction$) {
    const objectStore$ = transaction$.pipe(
      map(transaction => transaction.objectStore(name))
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

function createObjectStore(name, config = {}) {
  return function(db$) {
    const objectStoreCreation$ = db$.pipe(
      map(({ db }) => {
        const objectStore = db.createObjectStore(name, config);
        return objectStore;
      })
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
  // transaction("users", "readwrite"),
  // objectStore("users"),
  // tap(os => {
  //   os.add({ name: "carson", id: new Date() / 1000 });
  // })
);
// .subscribe();

const createUser = db$.pipe(
  transaction("users", "readwrite"),
  objectStore("users"),
  index("name"),
  getAll()
  // tap(os => {
  //   os.add({ name: "carson", id: Math.floor(new Date() / 1000) });
  // })
);

createUser.subscribe(console.log);
