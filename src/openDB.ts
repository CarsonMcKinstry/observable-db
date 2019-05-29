import { merge, fromEvent, Observable } from "rxjs";
import { map } from "rxjs/operators";

function mapEventToDatabase(event: Event): IDBDatabase {
  return (event.target as IDBOpenDBRequest).result;
}

export default function openDB(
  name: string,
  version: number
): Observable<Event> {
  const request = window.indexedDB.open(name, version);

  const success$: Observable<Event> = fromEvent(request, "success");

  const upgrade$: Observable<Event> = fromEvent(request, "upgradeneeded");

  return merge(upgrade$, success$);
}
