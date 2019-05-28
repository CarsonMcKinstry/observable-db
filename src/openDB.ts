import { merge, fromEvent, Observable } from "rxjs";
import { map } from "rxjs/operators";

function mapEventToDatabase(event: Event): IDBDatabase {
  return (event.target as IDBOpenDBRequest).result;
}

export default function openDB(
  name: string,
  version: number
): Observable<IDBDatabase | Event> {
  const request = window.indexedDB.open(name, version);

  const success$: Observable<IDBDatabase> = fromEvent(request, "success").pipe(
    map(mapEventToDatabase)
  );

  const upgrade$: Observable<Event> = fromEvent(request, "upgradeneeded");

  return merge(upgrade$, success$);
}
