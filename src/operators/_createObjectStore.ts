import { OperatorFunction } from "rxjs";
import { DBInterface } from "../types";

function createObjectStore(name: string, params: IDBObjectStoreParameters): OperatorFunction<DBInterface<IDBDatabase>, IDBobjectStore>{
    return ({ result }) => {
        const objectStore$.pipe(
            mergeMap(upgradeDB)
        );

        return objectStore$.
    }
}