import { DBInterface } from './../types';
import { OperatorFunction, of } from 'rxjs';
import { map } from 'rxjs/operators';

type Incoming = Pick<
    DBInterface<IDBDatabase>,
    Exclude<keyof DBInterface<IDBDatabase>, 'objectStore$' | 'transaction$'>
>;
type Outgoing = Pick<
    DBInterface<IDBDatabase>,
    Exclude<keyof DBInterface<IDBDatabase>, 'objectStore$'>
>;

export default function transaction(
    name: string,
    mode?: 'readonly' | 'readwrite',
): OperatorFunction<Incoming, Outgoing> {
    return db$ => {
        return db$.pipe(
            map(db => {
                const tx = db.result.transaction(name, mode);
                return {
                    transaction$: of(tx),
                    result: db.result,
                };
            }),
        );
    };
}
