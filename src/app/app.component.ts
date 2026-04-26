import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { IssuePayload, Issue } from './issue-api.models'; // Added Issue
import { IssueApiService } from './issue-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly issueApi = inject(IssueApiService);

  // Updated to strongly type the data
  protected readonly issues = signal<Issue[]>([]);
  protected readonly selectedIssue = signal<Issue | null>(null);
  // New Signals for the Modal popup
  protected readonly modalIssue = signal<Issue | null>(null);

  protected readonly listLoading = signal(false);
  protected readonly createLoading = signal(false);
  protected readonly fetchLoading = signal(false);
  protected readonly deleteLoading = signal(false);
  protected readonly statusMessage = signal('Connect your Spring Boot service and start managing issues from one place.');

  protected readonly issueForm = this.formBuilder.nonNullable.group({
    id: [''],
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    status: ['OPEN', Validators.required]
  });

  protected readonly lookupForm = this.formBuilder.nonNullable.group({
    id: ['', Validators.required]
  });

  protected readonly deleteForm = this.formBuilder.nonNullable.group({
    id: ['', Validators.required]
  });

  constructor() {
    this.refreshIssues();
  }

  protected refreshIssues(): void {
    this.listLoading.set(true);
    this.issueApi.listIssues().subscribe({
      next: (issues: Issue[]) => { // Updated type
        this.issues.set(issues);
        this.statusMessage.set(`Loaded ${issues.length} issue${issues.length === 1 ? '' : 's'} from the API.`);
        this.listLoading.set(false);
      },
      error: (error: unknown) => {
        this.statusMessage.set(this.getErrorMessage(error, 'Could not load issues.'));
        this.listLoading.set(false);
      }
    });
  }

  protected submitIssue(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      this.statusMessage.set('Please fill in all required issue fields before creating an issue.');
      return;
    }

    const formValue = this.issueForm.getRawValue();
    const payload: IssuePayload = {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status
    };

    if (formValue.id.trim()) {
      payload.id = formValue.id.trim();
    }

    this.createLoading.set(true);
    this.issueApi.createIssue(payload).subscribe({
      next: (response: string) => {
        this.statusMessage.set(`Issue created successfully. API response: ${response}`);
        this.issueForm.reset({ id: '', title: '', description: '', status: 'OPEN' });
        this.createLoading.set(false);
        this.refreshIssues();
      },
      error: (error: unknown) => {
        this.statusMessage.set(this.getErrorMessage(error, 'Issue creation failed.'));
        this.createLoading.set(false);
      }
    });
  }

  protected fetchIssue(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      this.statusMessage.set('Please enter an issue ID to fetch.');
      return;
    }

    const { id } = this.lookupForm.getRawValue();
    this.fetchLoading.set(true);
    this.issueApi.getIssue(id).subscribe({
      next: (issue: Issue) => { // Updated type
        this.selectedIssue.set(issue);
        this.statusMessage.set(`Fetched issue ${id}.`);
        this.fetchLoading.set(false);
      },
      error: (error: unknown) => {
        this.selectedIssue.set(null);
        this.statusMessage.set(this.getErrorMessage(error, `Could not fetch issue ${id}.`));
        this.fetchLoading.set(false);
      }
    });
  }

  protected removeIssue(): void {
    if (this.deleteForm.invalid) {
      this.deleteForm.markAllAsTouched();
      this.statusMessage.set('Please enter an issue ID to delete.');
      return;
    }

    const { id } = this.deleteForm.getRawValue();
    this.deleteLoading.set(true);
    this.issueApi.deleteIssue(id).subscribe({
      next: (deleted: boolean) => {
        this.statusMessage.set(
          deleted ? `Issue ${id} deleted successfully.` : `API responded, but issue ${id} was not deleted.`
        );
        if (deleted && this.lookupForm.controls.id.value === id) {
          this.selectedIssue.set(null);
        }
        this.deleteLoading.set(false);
        this.refreshIssues();
      },
      error: (error: unknown) => {
        this.statusMessage.set(this.getErrorMessage(error, `Could not delete issue ${id}.`));
        this.deleteLoading.set(false);
      }
    });
  }

  protected trackIssue(_: number, issue: Issue): string {
    return issue.id;
  }

  // --- NEW MODAL METHODS ---
  protected openIssueModal(id: string): void {
    // Triggers the GET /{id} call when clicking a title
    this.issueApi.getIssue(id).subscribe({
      next: (issue: Issue) => {
        this.modalIssue.set(issue);
      },
      error: (error: unknown) => {
        this.statusMessage.set(this.getErrorMessage(error, `Could not fetch issue details for ${id}.`));
      }
    });
  }

  protected closeModal(): void {
    this.modalIssue.set(null);
  }
  // -------------------------

  protected hasError(controlName: 'title' | 'description' | 'status'): boolean {
    const control = this.issueForm.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected getIssueFieldError(controlName: 'title' | 'description'): string {
    // ... [existing error logic remains exactly the same]
    const control = this.issueForm.controls[controlName];

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (controlName === 'title' && control.hasError('minlength')) {
      return 'Title must be at least 3 characters.';
    }

    if (controlName === 'description' && control.hasError('minlength')) {
      return 'Description must be at least 10 characters.';
    }

    return '';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
     // ... [existing error logic remains exactly the same]
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      return `${fallback} (${error.status || 'network error'})`;
    }
    return fallback;
  }
}