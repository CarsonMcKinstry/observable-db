import { DBInterface } from './../types';
import { OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

type Incoming = Pick<
    DBInterface<IDBDatabase>,
    Exclude<keyof DBInterface<IDBDatabase>, 'objectStore$'>
>;

export default function objectStore(
    name: string,
): OperatorFunction<Incoming, DBInterface> {
    return db$ => {
        return db$.pipe(
            map(db => {
                const objectStore$ = db.transaction$.pipe(
                    map(tx => tx.objectStore(name)),
                );
                return {
                    ...db,
                    objectStore$,
                };
            }),
        );
    };
}
