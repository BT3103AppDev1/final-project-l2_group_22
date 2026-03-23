import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Login from '../login/Login.vue'

// Initialize Mocks (Test Doubles)

const pushmock = vi.fn()

const signinmock = vi.fn()

const popupsigninmock = vi.fn()

// Fake Firebase App
vi.mock('../firebase', () => ({
  default: {},
  firebaseConfigurationError: ""
}))

// Fake Firebase Authentication Module
vi.mock('../firebase/auth', () => ({
  signInWithEmailAndPassword: signinmock,
  signInWithPopup: popupsigninmock,
  GoogleAuthProvider: vi.fn()
}))

describe('Login.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  // Fake Mounting Function with fake router to simulate Vue behavior

  function mountLogin() {
    return mount(Login, {
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

  // it -> Test Cases For Login.vue

  it('Login renders email, password fields, and also all text mentioned in Login.vue', () => {
    const wrapper = mountLogin();

    expect(wrapper.find('input[type = "email"]').exists()).toBe(true);
    expect(wrapper.find('input[type = "password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Sign in to your account');
    expect(wrapper.text()).toContain('Welcome back. Enter your email and password to continue.');
    expect(wrapper.text()).toContain('Sign in with Google');
    expect(wrapper.text()).toContain('Do not have an account?');
    expect(wrapper.text()).toContain('Create one.');

  })

  it("Login displays an error when email and/or password are empty when pressing the Sign In button", async () => {

    const wrapper = mountLogin();

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');

    expect(signinmock).not.toHaveBeenCalled();
  })

  it("Login displays an error when an email of invalid format is entered", async () => {
    const wrapper = mountLogin();

    await wrapper.find('input[type="email"]').setValue('abcdefg@');
    await wrapper.find('input[type="password"]').setValue('btbtbt');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Please enter a valid email address');
    expect(signinmock).not.toHaveBeenCalled();

  })

  it("Login clears error messages when the users retypes after an error is shown", async () => {
    const wrapper = mountLogin();

    // Submit empty email and password to trigger error messages

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Email is required');
    expect(wrapper.text()).toContain('Password is required');
    expect(wrapper.vm.emailError).toBe(true);
    expect(wrapper.vm.passwordError).toBe(true);

    // Retype email and password, expect error messages to disappear

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbt');

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.passwordError).toBe(false);

  })

  // Gets error
  it("Upon successful login using email and password, calls Firebase to authenticate credentials", async () => {
    const wrapper = mountLogin();

    signinmock.mockResolvedValue({
      usercredential: {
        user: {uid: '67q67'}
      }
    })

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbt');
    await wrapper.find('form').trigger('submit.prevent');

    expect(signinmock).toHaveBeenCalled();
    expect(pushmock).toHaveBeenCalledWith('/grand');

  })


  // Gets error
  it("Successful form submission of email and password, but credentials are invalid, Firebase rejects Login and returns an error message", async () => {
    const wrapper = mountLogin();

    signinmock.mockRejectedValue({errorcode: "auth/invalid-credentials"})

    await wrapper.find('input[type="email"]').setValue('wrongexample@example.com');
    await wrapper.find('input[type="password"]').setValue('wrongpassword');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Invalid email or password');
  })
})










