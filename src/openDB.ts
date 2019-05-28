import { 
  fromEvent, Observable
} from 'rxjs';
import {
  merge,
  map
} from 'rxjs/operators';

function mapEventToDatabase (event: Event): IDBDatabase {
  return (event.target as IDBOpenDBRequest).result;
};

export function openDB(name: string, version: number) {
  const request = window.indexedDB.open(name, version);

  const success$: Observable<IDBDatabase> = fromEvent(request, 'success').pipe(
    map(mapEventToDatabase)
  );
  
  return merge(success$);
}