import { ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

export class CustomValidators {
  static regexValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        // if control is empty return no error
        return {};
      }

      // test the value of the control against the regexp supplied
      const valid = regex.test(control.value);

      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? {} : error;
    };
  }

  static passwordMatchValidator(error: ValidationErrors): ValidatorFn  {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control || !control.value) {
        // if control is empty return no error
        return {};
      }
      // tslint:disable-next-line: no-non-null-assertion
      const password: string = control.get('password')!.value; // get password from our password form control
      // tslint:disable-next-line: no-non-null-assertion
      const confirmPassword: string = control.get('pwdCheck')!.value; // get password from our confirmPassword form control
      // test the value of the control against the regexp supplied
      const valid = password === confirmPassword;
      if (!valid) {
        // tslint:disable-next-line: no-non-null-assertion
        control.get('pwdCheck')!.setErrors({ noMatch: true });
      }
      // if true, return no error (no error), else return error passed in the second parameter
      return valid ? {} : error;
    };
  }
}
