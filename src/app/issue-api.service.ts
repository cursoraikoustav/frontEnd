import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { IssuePayload, Issue } from './issue-api.models'; // Import Issue

@Injectable({ providedIn: 'root' })
export class IssueApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api/issue`;

  listIssues(): Observable<Issue[]> { // Return Issue[]
    return this.http.get<Issue[]>(`${this.baseUrl}/list`);
  }

  createIssue(payload: IssuePayload): Observable<string> {
    return this.http.post(`${this.baseUrl}/create`, payload, {
      responseType: 'text'
    });
  }

  getIssue(id: string): Observable<Issue> { // Return Issue
    const params = new HttpParams().set('id', id);
    return this.http.get<Issue>(`${this.baseUrl}/get/${encodeURIComponent(id)}`, {
      params // Removed responseType: 'text' so it parses JSON
    });
  }

  deleteIssue(id: string): Observable<boolean> {
    const params = new HttpParams().set('id', id);
    return this.http.post<boolean>(`${this.baseUrl}/delete/${encodeURIComponent(id)}`, null, {
      params
    });
  }
}