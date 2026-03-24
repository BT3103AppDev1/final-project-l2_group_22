import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ChangeEmail from '../login/Change-Email.vue'


// Initialize Mocks (Test Doubles)
const {pushmock, verifybeforeupdateemailmock, getauthmock} = vi.hoisted(() => ({

  pushmock: vi.fn(),

  verifybeforeupdateemailmock: vi.fn(),

  getauthmock: vi.fn(() => ({}))

}))

// Fake Firebase App
vi.mock('../firebase', () => ({
  default: {},
  firebaseConfigError: ""
}))

// Fake Firebase Authentication Module
vi.mock('firebase/auth', () => ({
  verifyBeforeUpdateEmail: verifybeforeupdateemailmock,
  push: pushmock,
  getAuth: getauthmock,
}))

describe('Change-Email.vue', () => {
  beforeEach(() => vi.clearAllMocks())

  // Fake Mounting Function with fake router to simulate Vue behavior

  function mountChangeEmail() {
    return mount(ChangeEmail, {
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

  // it -> Test Cases For Change-Email.vue

  it('Change-Email renders email field, and also all text mentioned in Change-Email.vue', () => {
    const wrapper = mountChangeEmail();
    const button = wrapper.find('button[type = "submit"]');

    expect(wrapper.find('input[type = "email"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Enter your new email address');
    expect(button.text()).toContain('Change Email');
    expect(wrapper.text()).toContain('Back to dashboard');
    expect(wrapper.text()).toContain('Return to Grand page.');

  })

  it("Change-Email displays an error when email is empty when pressing the change email button", async () => {

    const wrapper = mountChangeEmail();

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('New email is required');

    expect(getauthmock).not.toHaveBeenCalled();
    expect(verifybeforeupdateemailmock).not.toHaveBeenCalled();
    expect(pushmock).not.toHaveBeenCalled();

  })

  it("Change-Email displays an error when a valid email is not entered", async () => {
    const wrapper = mountChangeEmail();

    await wrapper.find('input[type="email"]').setValue('abcdefg@');
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Please enter a valid email address');

    expect(getauthmock).not.toHaveBeenCalled();
    expect(verifybeforeupdateemailmock).not.toHaveBeenCalled();
    expect(pushmock).not.toHaveBeenCalled();
  })

  it("Change-Email clears error messages when the users retypes after an error is shown", async () => {
    const wrapper = mountChangeEmail();

    // Submit empty form to trigger error messages

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('New email is required');

    // Retype form, expect error messages to disappear

    await wrapper.find('input[type="email"]').setValue('abcdefg777@example.com');

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("");
    expect(wrapper.text()).not.toContain('New email is required');
    expect(wrapper.vm.newEmail).toBe('abcdefg777@example.com');



  })


  it("Upon successful validation of email, sends an success message on the browser", async () => {
    const wrapper = mountChangeEmail();

    getauthmock.mockReturnValue({
      currentUser: { uid: '123', email: 'oldemail@example.com' }
    });


    await wrapper.find('input[type="email"]').setValue('abcdefg777@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(getauthmock).toHaveBeenCalled();
    expect(verifybeforeupdateemailmock).toHaveBeenCalled();

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("");
    expect(wrapper.vm.successMessage).toBe("Verification email sent to your new address. Please verify it to complete the change.");
    expect(wrapper.vm.newEmail).toBe('abcdefg777@example.com');

  })


  it("Email entered is valid and pass validation checks, but Firebase registration fails due to reasons such as new email already in use", async () => {

    const wrapper = mountChangeEmail();

    verifybeforeupdateemailmock.mockRejectedValue({ code: 'auth/email-already-in-use' });

    await wrapper.find('input[type="email"]').setValue('abcdefg@example.com');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(getauthmock).toHaveBeenCalled();
    expect(verifybeforeupdateemailmock).toHaveBeenCalled();

    expect(wrapper.vm.emailError).toBe(false);
    expect(wrapper.vm.errorMessage).toBe("This email is already in use");
    expect(wrapper.vm.successMessage).toBe("");
    expect(wrapper.vm.newEmail).toBe('abcdefg@example.com');

  })
})










