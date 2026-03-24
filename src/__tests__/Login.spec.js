import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Login from '../login/Login.vue'

// Initialize Mocks (Test Doubles)
const {pushmock, signinmock, signoutmock, popupsigninmock, getauthmock} = vi.hoisted(() => ({

  pushmock: vi.fn(),

  signinmock: vi.fn(),

  signoutmock: vi.fn(),

  popupsigninmock: vi.fn(),

  getauthmock: vi.fn(() => ({}))


}))



// Fake Firebase App
vi.mock('../firebase', () => ({
  default: {},
  firebaseConfigError: ""
}))

// Fake Firebase Authentication Module
vi.mock('firebase/auth', () => ({
  getAuth: getauthmock,
  signInWithEmailAndPassword: signinmock,
  signOut: signoutmock,
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

  // Gets error -> const auth = getAuth(firebaseApp); (Firebase instance has not been created or is not open)
  it("Upon successful login using email and password, calls Firebase to authenticate credentials", async () => {
    const wrapper = mountLogin();

    signinmock.mockResolvedValue({
      user: {
        uid: '67q67',
        emailVerified: true
      }
    })

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('input[type="password"]').setValue('btbtbtA12');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises(); // Waits for any pending promises to resolve

    expect(signinmock).toHaveBeenCalled();
    console.log(pushmock.mock.calls);
    expect(pushmock).toHaveBeenCalledWith('/grand');


  })



  it("Successful form submission of email and password, but credentials are invalid, Firebase rejects Login and returns an error message", async () => {
    const wrapper = mountLogin();

    signinmock.mockRejectedValue({code: "auth/invalid-credentials"})

    await wrapper.find('input[type="email"]').setValue('wrongexample@example.com');
    await wrapper.find('input[type="password"]').setValue('wrongpassword');
    await wrapper.find('form').trigger('submit.prevent');

    // Does not navigate to the "grand" page
    expect(pushmock).not.toHaveBeenCalledWith('/grand');

  })
})










