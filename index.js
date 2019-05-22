import { fromEvent, merge, of, Observable } from "rxjs";
import { filter, tap, map, ignoreElements } from "rxjs/operators";

function observeRequest(request) {
  const success$ = fromEvent(request, "success");
  const error$ = fromEvent(request, "error");

  return merge(success$, error$);
}

function wrap(value) {
  if (value instanceof IDBRequest) {
    return observeRequest(value);
  }

  return of(value);
}

function upgrade(upgradeFunction) {
  return function(upgradeDB$) {
    const upgraded$ = upgradeDB$.pipe(
      filter(({ type }) => type === "upgradeneeded"),
      tap(event => {
        console.log("----inside the operator-----");
        console.log(event);
        console.log("----/inside the operator----");
      }),
      ignoreElements()
    );
    return merge(upgraded$, upgradeDB$).pipe(
      filter(({ type }) => type !== "upgradeneeded")
    );
  };
}

function openDB(name, version) {
  const request = window.indexedDB.open(name, version);
  const req$ = wrap(request);

  const upgrade$ = fromEvent(request, "upgradeneeded");
  const blocked$ = fromEvent(request, "blocked");
  const blocking$ = fromEvent(request, "versionchange");

  return merge(req$, upgrade$, blocked$, blocking$);
}

openDB("todoList", 8)
  .pipe(
    upgrade(),
    tap(event => {
      console.log("---base stream---");
      console.log(event);
      console.log("---/base stream---");
    })
  )
  .subscribe();
