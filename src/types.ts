import { Observable } from 'rxjs';

export type UpgradeFunction = (
    dbInterface: Observable<
        Pick<
            DBInterface<IDBDatabase>,
            Exclude<keyof DBInterface, 'objectStore$' | 'transaction$'>
        >
    >,
) => Observable<any>;

export interface DBInterface<T = any> {
    objectStore$: Observable<IDBObjectStore>;
    transaction$: Observable<IDBTransaction>;
    result: T;
}

export interface OpenDBCallbacks {
    upgrade: UpgradeFunction;
}
