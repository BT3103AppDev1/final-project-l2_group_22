import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Register from '../login/Register.vue'


// Initialize Mocks (Test Doubles)
const {pushmock, createuserwithemailandpasswordmock, updateprofilemock, validatepasswordmock, getauthmock, sendemailverificationmock} = vi.hoisted(() => ({

  pushmock: vi.fn(),

  createuserwithemailandpasswordmock: vi.fn(),

  updateprofilemock: vi.fn(),

  validatepasswordmock: vi.fn(),

  sendemailverificationmock: vi.fn(),

  getauthmock: vi.fn(() => ({}))

}))

// Fake Firebase App
vi.mock('../firebase', () => ({
  default: {},
  firebaseConfigError: ""
}))

// Fake Firebase Authentication Module
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: createuserwithemailandpasswordmock,
  validatePassword: validatepasswordmock,
  updateProfile: updateprofilemock,
  push: pushmock,
  getAuth: getauthmock,
  sendEmailVerification: sendemailverificationmock
}))

describe('Register.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  // Fake Mounting Function with fake router to simulate Vue behavior

  function mountRegister() {
    return mount(Register, {
      global: {
        mocks: {
          $router: {
            push: pushmock
          }
        },
        stubs: {
          'router-link': {
            template: '<a><slot /></a>'
          }
        }
      }
    });
  }

  // it -> Test Cases For Register.vue

  it('Register renders email, password, confirm password, first name, and last name fields, and also all text mentioned in Register.vue', () => {
    const wrapper = mountRegister();

    expect(wrapper.find('input[type = "email"]').exists()).toBe(true);
    expect(wrapper.find('input[type = "password"]').exists()).toBe(true);
    expect(wrapper.find('#confirm-password').exists()).toBe(true);
    expect(wrapper.find('#first-name').exists()).toBe(true);
    expect(wrapper.find('#last-name').exists()).toBe(true);
    expect(wrapper.text()).toContain('Create your account');
    expect(wrapper.text()).toContain('Get started with CashSight by creating your free account');
    expect(wrapper.text()).toContain('Create Account');
    expect(wrapper.text()).toContain('Already have an account?');
    expect(wrapper.text()).toContain('Sign in here.');

  })

  it("Register displays an error when email and/or password are empty when pressing the Sign Up button", async () => {

    const wrapper = mountRegister();

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
    expect(wrapper.text()).toContain('First name is required');
    expect(wrapper.text()).toContain('Last name is required');
    expect(wrapper.text()).toContain('Please confirm your password');


    expect(createuserwithemailandpasswordmock).not.toHaveBeenCalled();
  })

  it("Register displays an error when a name, email, and/or password of invalid format is entered", async () => {
    const wrapper = mountRegister();

    await wrapper.find('input[type="email"]').setValue('abcdefg@');
    await wrapper.find('input[type="password"]').setValue('@@@');
    await wrapper.find('#first-name').setValue('123');
    await wrapper.find('#last-name').setValue('456');
    await wrapper.find('#confirm-password').setValue('btbtbtt');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('First name can only contain letters');
    expect(wrapper.text()).toContain('Last name can only contain letters');
    expect(wrapper.text()).toContain('Please enter a valid email address');
    expect(wrapper.text()).toContain('Password must be at least 8 characters long');
    expect(wrapper.text()).toContain('Password must contain at least one uppercase letter');
    expect(wrapper.text()).toContain('Password must contain at least one lowercase letter');
    expect(wrapper.text()).toContain('Password must contain at least one digit');
    expect(wrapper.text()).toContain('Passwords do not match');

    expect(createuserwithemailandpasswordmock).not.toHaveBeenCalled();

  })

  it("Register clears error messages when the users retypes after an error is shown", async () => {
    const wrapper = mountRegister();

    // Submit empty form to trigger error messages

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
    expect(wrapper.text()).toContain('First name is required');
    expect(wrapper.text()).toContain('Last name is required');
    expect(wrapper.text()).toContain('Please confirm your password');

    // Retype form, expect error messages to disappear

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbt');
    await wrapper.find('#first-name').setValue('Chusong');
    await wrapper.find('#last-name').setValue('Surtis');
    await wrapper.find('#confirm-password').setValue('btbtbt');

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.passwordError).toBe(false);
    expect(wrapper.vm.firstNameError).toBe(false);
    expect(wrapper.vm.lastNameError).toBe(false);
    expect(wrapper.vm.repeatPasswordError).toBe(false);


  })


  it("Upon successful registration using email and password, calls Firebase to create a new user", async () => {
    const wrapper = mountRegister();

    validatepasswordmock.mockResolvedValue({ isValid: true });

    createuserwithemailandpasswordmock.mockResolvedValue({
      user: {
        uid: '6767'
      }
    })

    updateprofilemock.mockResolvedValue({
      displayName: 'Chusong Surtis'
    });

    sendemailverificationmock.mockResolvedValue({});

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbt123A');
    await wrapper.find('#first-name').setValue('Chusong');
    await wrapper.find('#last-name').setValue('Surtis');
    await wrapper.find('#confirm-password').setValue('btbtbt123A');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();


    expect(validatepasswordmock).toHaveBeenCalled();
    expect(getauthmock).toHaveBeenCalled();
    expect(createuserwithemailandpasswordmock).toHaveBeenCalled();
    expect(updateprofilemock).toHaveBeenCalled();
    expect(sendemailverificationmock).toHaveBeenCalled();


  })

  it("Input entered are valid and pass validation checks, but Firebase registration fails due to reasons such as email already in use", async () => {

    const wrapper = mountRegister();

    validatepasswordmock.mockResolvedValue({ isValid: true });

    createuserwithemailandpasswordmock.mockRejectedValue({ code: 'auth/email-already-in-use' });

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbt123A');
    await wrapper.find('#first-name').setValue('Chusong');
    await wrapper.find('#last-name').setValue('Surtis');
    await wrapper.find('#confirm-password').setValue('btbtbt123A');

    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(validatepasswordmock).toHaveBeenCalled();
    expect(getauthmock).toHaveBeenCalled();
    expect(createuserwithemailandpasswordmock).toHaveBeenCalled();
    expect(updateprofilemock).not.toHaveBeenCalled();
    expect(sendemailverificationmock).not.toHaveBeenCalled();

    expect(wrapper.text()).toContain('This email is already in use');

  })
})










