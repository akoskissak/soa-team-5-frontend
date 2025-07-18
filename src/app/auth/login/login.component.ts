import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.valid) {
      this.auth.login(this.form.value).subscribe({
        next: (res) => {
          console.log('Uspesan login!', res);
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('Login greska:', err);
        },
      });
    }
  }
}
