import { Observable, merge } from "rxjs";
import { filter, map, share } from "rxjs/operators";

export type UpgradeFunction = (db$: Observable<IDBDatabase>) => Observable<any>;

export default function upgrade(upgradeFunction: UpgradeFunction) {
  return (openDBRequest$: Observable<Event>) => {
    const upgradeDB$ = openDBRequest$.pipe(
      filter(({ type }: Event) => type === "upgradeneeded"),
      map((event: Event) => {
        return (event.target as IDBOpenDBRequest).result;
      })
    );

    const upgradedDB$ = upgradeFunction(upgradeDB$);

    const db$ = merge(upgradedDB$, upgradeDB$, openDBRequest$);

    return db$.pipe(
      filter(({ type }: Event) => type !== "upgradeneeded"),
      share()
    );

    // return merge(upgradedDB$, upgradeDB$).pipe(
    //   filter(({ type }: Event) => type !== 'upgradeneeded'),
    //   share()
    // )
  };
}

// function upgrade(upgradeFunction) {
//   // => needs to return an observable!
//   // this could also be written in typescript to help this
//   if (!upgradeFunction || typeof upgradeFunction !== "function") {
//     throw new Error("Upgrade callback not supplied to upgrade operator");
//   }
//   return function(upgradeDB$) {
//     const db$ = upgradeDB$.pipe(
//       filter(({ type }) => type === "upgradeneeded"),
//       map(({ target, oldVersion, newVersion }) => ({
//         db: target.result,
//         oldVersion,
//         newVersion
//       }))
//     );

//     const upgraded$ = upgradeFunction(db$);

//     // second verse, same as the first
//     if (!(upgraded$ instanceof Observable)) {
//       throw new TypeError("Upgrade callback must return an observable");
//     }

//     return merge(upgraded$.pipe(ignoreElements()), upgradeDB$).pipe(
//       filter(({ type }) => type !== "upgradeneeded"),
//       shareReplay()
//     );
//   };
// }
