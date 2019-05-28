import { Observable, merge, OperatorFunction } from "rxjs";
import { filter, map, tap, share } from "rxjs/operators";

export type UpgradeFunction = (db$: Observable<IDBDatabase>) => Observable<any>;

export default function upgrade(
  upgradeFunction: UpgradeFunction
): OperatorFunction<Event | IDBDatabase, Event | IDBDatabase> {
  return openDBRequest$ => {
    const upgradeDB$ = openDBRequest$.pipe(
      filter(i => i instanceof Event), // whyyyyyy?
      filter((event: Event) => event.type === "upgradeneeded")
    );

    return upgradeDB$;
    // const upgradeDB$ = openDBRequest$.pipe(
    //   filter(({ type }: Event) => type === "upgradeneeded"),
    //   map((event: Event) => {
    //     return (event.target as IDBOpenDBRequest).result;
    //   })
    // );
    // const upgradedDB$ = upgradeFunction(upgradeDB$);
    // const db$ = merge(openDBRequest$, upgradedDB$);
    // return db$.pipe(
    //   filter(({ type }: Event) => type !== "upgradeneeded"),
    //   share()
    // );
  };
}

export function createObjectStore(
  name: string,
  parameters: IDBObjectStoreParameters = {}
): OperatorFunction<IDBDatabase, IDBObjectStore> {
  return db$ => {
    const objectStore$ = db$.pipe(
      map((db: IDBDatabase) => {
        const objectStore = db.createObjectStore(name, parameters);
        return objectStore;
      }),
      share()
    );

    return objectStore$;
  };
}

export function createIndex(
  indexName: string,
  keyPath: string = indexName,
  parameters: IDBIndexParameters = {}
): OperatorFunction<IDBObjectStore, IDBObjectStore> {
  return objectStore$ => {
    const indexCreation$ = objectStore$.pipe(
      tap((objectStore: IDBObjectStore) => {
        objectStore.createIndex(indexName, keyPath, parameters);
      })
    );

    return indexCreation$;
  };
}
