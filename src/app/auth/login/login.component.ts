import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../Auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [],
})
export class LoginComponent implements OnInit {
  selectedForm = 'login';
  rememberMe = false;
  loading = false;
  pwd: any = null;
  pwdSignUp: any = null;
  messageError = '';
  hide = true;
  loginForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.email, Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]),
    rememberMe: new FormControl(false),
  });
  signUpForm: FormGroup = new FormGroup(
    {
      fullName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email, Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      pwdCheck: new FormControl('', [Validators.required]),
    }
  );
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (this.location.path() === '/signup') {
      this.switchTo(undefined, this.location.path());
    }
    this.pwd = this.loginForm.controls.password;
    this.pwdSignUp = this.signUpForm.controls.password;
  }

  onSubmitLogin(): void {
    this.messageError = '';
    this.loading = true;
    if (this.loginForm.invalid) {
      setTimeout(() => {
        this.messageError = 'Please check your informations';
        this.loading = false;
      }, 200);
      return;
    }
    const form = { ...this.loginForm.value };
    form.password = btoa(this.loginForm.value.password);
    this.authService
      .login(form)
      .then(() => this.router.navigate(['/']))
      .catch((err) => {
        console.log("🚀 ~ file: login.component.ts ~ line 70 ~ LoginComponent ~ onSubmitLogin ~ err", err)
        this.messageError = err.error.error ? err.error.error : err.error;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  switchTo(btn?: HTMLElement, loadState?: string): void {
    const container = document.querySelector('.container');
    // tslint:disable-next-line: no-non-null-assertion
    if (loadState === '/signup' || btn!.innerText.trim() === 'SIGN UP') {
      // tslint:disable-next-line: no-non-null-assertion
      container!.classList.add('sign-up-mode');
      this.location.replaceState('/signup');
      setTimeout(() => {
        this.selectedForm = 'signup';
      }, 1000);
      return;
    }
    // tslint:disable-next-line: no-non-null-assertion
    container!.classList.remove('sign-up-mode');
    this.location.replaceState('/login');
    setTimeout(() => {
      this.selectedForm = 'login';
    }, 1000);
  }

  onSubmitSignUp(): void {
    this.messageError = '';
    this.loading = true;
    if (this.signUpForm.invalid) {
      setTimeout(() => {
        this.messageError = 'Please check your informations';
        this.loading = false;
      }, 200);
      return;
    }
    const form = { ...this.signUpForm.value };
    delete form.pwdCheck;
    form.password = btoa(this.signUpForm.value.password);
    this.signUp(form);
  }
  signUp(body: any): void {
    this.authService
      .createUser(body)
      .then((res) => {
        console.log('res ====>', res);
      })
      .catch((err) => {
        console.log('err ====>', err);
        this.messageError = err.error ? err.error.message : err.message;
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
