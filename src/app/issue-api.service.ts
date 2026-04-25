import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { IssuePayload } from './issue-api.models';

@Injectable({ providedIn: 'root' })
export class IssueApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/issue`;

  listIssues(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/list`);
  }

  createIssue(payload: IssuePayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/create`, payload, {
      responseType: 'text'
    });
  }

  getIssue(id: string): Observable<string> {
    const params = new HttpParams().set('id', id);
    return this.http.get(`${this.baseUrl}/get/${encodeURIComponent(id)}`, {
      params,
      responseType: 'text'
    });
  }

  deleteIssue(id: string): Observable<boolean> {
    const params = new HttpParams().set('id', id);
    return this.http.post<boolean>(`${this.baseUrl}/delete/${encodeURIComponent(id)}`, null, {
      params
    });
  }
}
