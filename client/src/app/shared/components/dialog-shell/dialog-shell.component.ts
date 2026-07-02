import { NgComponentOutlet } from '@angular/common';
import { Component, inject, Type } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface DialogShellData {
  title: string;
  component: Type<unknown>;
  // Inputs opcionales que se pasan directamente al componente interno
  inputs?: Record<string, unknown>;
}

@Component({
  selector: 'app-dialog-shell',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, NgComponentOutlet],
  templateUrl: './dialog-shell.component.html',
})
export class DialogShellComponent {
  readonly data = inject<DialogShellData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
