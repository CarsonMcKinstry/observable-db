import { Observable, merge, OperatorFunction } from 'rxjs';
import { filter, map, tap, share } from 'rxjs/operators';

export type UpgradeFunction = (db$: Observable<IDBDatabase>) => Observable<any>;

export default function upgrade(
    upgradeFunction: UpgradeFunction
): OperatorFunction<Event, Event> {
    return idbEvent$ => {
        const upgradeDB$ = idbEvent$.pipe(
            filter(event => event.type === 'upgradeneeded'),
            map(event => (event.target as IDBRequest).result)
        );

        const upgradedDB$ = upgradeFunction(upgradeDB$);

        return merge(idbEvent$, upgradedDB$).pipe(
            filter(event => event.type !== 'upgradeneeded'),
            share()
        );
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
