import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ResetPassword from '../login/Reset-Password.vue'


// Initialize Mocks (Test Doubles)
const {pushmock, sendpasswordresetemailmock, getauthmock} = vi.hoisted(() => ({

  pushmock: vi.fn(),

  sendpasswordresetemailmock: vi.fn(),

  getauthmock: vi.fn(() => ({}))

}))

// Fake Firebase App
vi.mock('../firebase', () => ({
  default: {},
  firebaseConfigError: ""
}))

// Fake Firebase Authentication Module
vi.mock('firebase/auth', () => ({
  sendPasswordResetEmail: sendpasswordresetemailmock,
  push: pushmock,
  getAuth: getauthmock,
}))

describe('Reset-Password.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  // Fake Mounting Function with fake router to simulate Vue behavior

  function mountResetPassword() {
    return mount(ResetPassword, {
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

  // it -> Test Cases For Reset-Password.vue

  it('Reset-Password renders email field, and also all text mentioned in Reset-Password.vue', () => {
    const wrapper = mountResetPassword();
    const button = wrapper.find('button[type = "submit"]');

    expect(wrapper.find('input[type = "email"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Enter your email and we will send you a password reset link.');
    expect(button.text()).toContain('Send Reset Link');
    expect(wrapper.text()).toContain('Remember your password?');
    expect(wrapper.text()).toContain('Back to sign in.');

  })

  it("Reset-Password displays an error when email is empty when pressing the send reset link button", async () => {

    const wrapper = mountResetPassword();

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Email is required');

    expect(getauthmock).not.toHaveBeenCalled();
    expect(sendpasswordresetemailmock).not.toHaveBeenCalled();
    expect(pushmock).not.toHaveBeenCalled();

  })

  it("Reset-Password displays an error when a valid email is not entered", async () => {
    const wrapper = mountResetPassword();

    await wrapper.find('input[type="email"]').setValue('abcdefg@');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Please enter a valid email address');

    expect(getauthmock).not.toHaveBeenCalled();
    expect(sendpasswordresetemailmock).not.toHaveBeenCalled();
    expect(pushmock).not.toHaveBeenCalled();
  })

  it("Reset-Password clears error messages when the users retypes after an error is shown", async () => {
    const wrapper = mountResetPassword();

    // Submit empty form to trigger error messages

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('Email is required');

    // Retype form, expect error messages to disappear

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("");
    expect(wrapper.text()).not.toContain('Email is required');
    expect(wrapper.vm.email).toBe('abcdefg@example.com');



  })


  it("Upon successful validation of email, calls Firebase to check if email exists and sends an success message on the browser", async () => {
    const wrapper = mountResetPassword();

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(getauthmock).toHaveBeenCalled();
    expect(sendpasswordresetemailmock).toHaveBeenCalled();

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("");
    expect(wrapper.vm.successMessage).toBe("Password reset email sent. Please check your inbox.");
    expect(wrapper.vm.email).toBe('abcdefg@example.com');

  })

  it("Email entered is valid and pass validation checks, but Firebase registration fails due to reasons such as email not found in Firebase", async () => {

    const wrapper = mountResetPassword();

    sendpasswordresetemailmock.mockRejectedValue({ code: 'auth/user-not-found' });

    await wrapper.find('input[type="email"]').setValue('abcdefg999@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(getauthmock).toHaveBeenCalled();
    expect(sendpasswordresetemailmock).toHaveBeenCalled();

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("No account found for this email");
    expect(wrapper.vm.successMessage).toBe("");
    expect(wrapper.vm.email).toBe('abcdefg999@example.com');


  })
})










