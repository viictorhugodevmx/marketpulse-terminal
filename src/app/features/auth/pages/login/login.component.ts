import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = 'trader@marketpulse.dev';
  password = '1234';

  errorMessage = signal('');

  onSubmit(): void {
    const loggedIn = this.authService.login(this.email, this.password);

    if (!loggedIn) {
      this.errorMessage.set('Enter a valid email and a password with at least 4 characters.');
      return;
    }

    this.errorMessage.set('');
    this.router.navigateByUrl('/');
  }
}
