import { Observable } from 'rxjs';

export interface DBInterface<T = any> {
    objectStore$: Observable<IDBObjectStore>;
    transaction$: Observable<IDBTransaction>;
    result: T;
}
