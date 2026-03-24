import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ResetPassword from "../login/Reset-Password.vue";

const fetchSignInMethodsForEmailMock = vi.fn();
const sendPasswordResetEmailMock = vi.fn();
const getAuthMock = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: getAuthMock,
  fetchSignInMethodsForEmail: fetchSignInMethodsForEmailMock,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

vi.mock("../firebase", () => ({
  default: {},
  firebaseConfigError: "",
}));

describe("Reset-Password.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthMock.mockReturnValue({});
  });

  function mountResetPassword() {
    return mount(ResetPassword, {
      global: {
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
          },
        },
      },
    });
  }

  it("does not send reset email when account does not exist", async () => {
    fetchSignInMethodsForEmailMock.mockResolvedValue([]);

    const wrapper = mountResetPassword();

    await wrapper.find("#email").setValue("missing@example.com");
    await wrapper.find("form").trigger("submit.prevent");

    expect(fetchSignInMethodsForEmailMock).toHaveBeenCalledWith({}, "missing@example.com");
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
    expect(wrapper.find("#error-message").text()).toContain("No account found for this email");
    expect(wrapper.find("#success-message").exists()).toBe(false);
  });

  it("sends reset email when account exists", async () => {
    fetchSignInMethodsForEmailMock.mockResolvedValue(["password"]);
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    const wrapper = mountResetPassword();

    await wrapper.find("#email").setValue("  user@example.com  ");
    await wrapper.find("form").trigger("submit.prevent");

    expect(fetchSignInMethodsForEmailMock).toHaveBeenCalledWith({}, "user@example.com");
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({}, "user@example.com");
    expect(wrapper.find("#error-message").text()).toBe("");
    expect(wrapper.find("#success-message").text()).toContain("Password reset email sent");
  });

  it("preserves email casing for non-gmail providers", async () => {
    fetchSignInMethodsForEmailMock.mockResolvedValue(["password"]);
    sendPasswordResetEmailMock.mockResolvedValue(undefined);

    const wrapper = mountResetPassword();

    await wrapper.find("#email").setValue("  User.Name@ExampleMail.com  ");
    await wrapper.find("form").trigger("submit.prevent");

    expect(fetchSignInMethodsForEmailMock).toHaveBeenCalledWith({}, "User.Name@ExampleMail.com");
    expect(sendPasswordResetEmailMock).toHaveBeenCalledWith({}, "User.Name@ExampleMail.com");
  });
});
