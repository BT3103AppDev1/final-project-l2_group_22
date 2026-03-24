import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ChangeEmail from "../login/Change-Email.vue";

const verifyBeforeUpdateEmailMock = vi.fn();
const getAuthMock = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: getAuthMock,
  verifyBeforeUpdateEmail: verifyBeforeUpdateEmailMock,
}));

vi.mock("../firebase", () => ({
  default: {},
  firebaseConfigError: "",
}));

describe("Change-Email.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAuthMock.mockReturnValue({
      currentUser: {
        email: "abc@example.com",
      },
    });
  });

  function mountChangeEmail() {
    return mount(ChangeEmail, {
      global: {
        stubs: {
          "router-link": {
            template: "<a><slot /></a>",
          },
        },
      },
    });
  }

  it("shows already-in-use error when new email matches current email", async () => {
    const wrapper = mountChangeEmail();

    await wrapper.find("#new-email").setValue("  ABC@example.com  ");
    await wrapper.find("form").trigger("submit.prevent");

    expect(verifyBeforeUpdateEmailMock).not.toHaveBeenCalled();
    expect(wrapper.find("#error-message").text()).toContain("This email is already in use");
    expect(wrapper.find("#success-message").exists()).toBe(false);
  });

  it("calls Firebase and shows success for a different email", async () => {
    verifyBeforeUpdateEmailMock.mockResolvedValue({});

    const wrapper = mountChangeEmail();

    await wrapper.find("#new-email").setValue("new@example.com");
    await wrapper.find("form").trigger("submit.prevent");

    expect(verifyBeforeUpdateEmailMock).toHaveBeenCalledWith(
      { email: "abc@example.com" },
      "new@example.com",
      {
        url: "http://localhost:3000/login",
        handleCodeInApp: false,
      },
    );
    expect(wrapper.find("#error-message").text()).toBe("");
    expect(wrapper.find("#success-message").text()).toContain(
      "Verification email sent to your new address",
    );
  });
});
