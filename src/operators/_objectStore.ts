import { OperatorFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export default function objectStore(
    name: string
): OperatorFunction<Event, IDBObjectStore> {
    return dbEvent$ => {
        const objectStore$ = dbEvent$.pipe(
            filter(event => event.type === 'success'),
            map(event => (event.target as IDBRequest).result),
            map(db => db.transaction(name, 'readwrite').objectStore(name))
        );

        return objectStore$;
    };
}
