import { Component, inject, signal } from '@angular/core';
import { ServiceProfile } from './services/service.profile';
import { AuthService } from '../auth/services/auth.service';
import { DataUser } from './interfaces/get-profile';
import { MatCard, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardContent } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-profile',
  imports: [MatCard, MatCardHeader, MatCardSubtitle, MatCardTitle, MatCardContent, MatIcon],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private readonly profileService = inject(ServiceProfile);
  private readonly authService = inject(AuthService);


  readonly userProfile = signal<DataUser | null>(null);

  ngOnInit() {
    this.profileService.getUserById(this.authService.getUser()?.id.toString()).subscribe({
      next: (data) => {
        this.userProfile.set(data.data)
      },
      error: (err: any) => {
        alert("ha ocurrido un error " + ` ${err.message}`)
      }
    })
  }

}
