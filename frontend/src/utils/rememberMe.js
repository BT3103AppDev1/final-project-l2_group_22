import Cookies from 'js-cookie';

const REMEMBER_ME_COOKIE = 'rememberMe';

export function setRememberMeCookie(value) {
  if (value) {
    Cookies.set(REMEMBER_ME_COOKIE, "true", {expires: 7, path: '/', sameSite: 'Lax', secure: false});
  } else {
    Cookies.set(REMEMBER_ME_COOKIE, "false", {path: '/', sameSite: 'Lax', secure: false});
  }
}

export function getRememberMeCookie() {
  return Cookies.get(REMEMBER_ME_COOKIE) === "true";
}

export function clearRememberMeCookie() {
  Cookies.remove(REMEMBER_ME_COOKIE, {path: "/"});
}
