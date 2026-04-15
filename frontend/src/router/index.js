import { createRouter, createWebHistory } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Login from "@/login/Login.vue";
import Register from "@/login/Register.vue";
import ResetPassword from "@/login/Reset-Password.vue";
import ChangeEmail from "@/login/Change-Email.vue";
import Dashboard from "@/views/Dashboard.vue";
import Transactions from "@/views/Transactions.vue";
import TransactionDetails from "@/views/TransactionDetails.vue";
import EditTransaction from "@/views/EditTransaction.vue";
import Insights from "@/views/Insights.vue";
import Settings from "@/views/Settings.vue";
import ImageUpload from "@/views/ImageUpload.vue";
import Profile from "@/views/Profile.vue";
import Categories from "@/views/Categories.vue";
import AddCategories from "@/views/AddCategories.vue";
import EditCategories from "@/views/EditCategories.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: ResetPassword,
  },
  {
    path: "/change-email",
    name: "ChangeEmail",
    component: ChangeEmail,
    meta: { requiresAuth: true },
  },
  {
    path: "/grand",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: Transactions,
    meta: { requiresAuth: true },
  },
  {
    path: "/transactions/add",
    redirect: (to) => ({ path: "/add-transaction", query: to.query }),
  },
  {
    path: "/transactions/:id",
    name: "TransactionDetails",
    component: TransactionDetails,
    meta: { requiresAuth: true },
  },
  {
    path: "/transactions/:id/edit",
    name: "EditTransaction",
    component: EditTransaction,
    meta: { requiresAuth: true },
  },
  {
    path: "/insights",
    name: "Insights",
    component: Insights,
    meta: { requiresAuth: true },
  },
  {
    path: "/uploader",
    name: "ImageUpload",
    component: ImageUpload,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: Settings,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/categories",
    name: "Categories",
    component: Categories,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings/categories/:id",
    name: "EditCategories",
    component: EditCategories,
    meta: { requiresAuth: true },
  },
  {
    path: "/add-category",
    name: "AddCategories",
    component: AddCategories,
    meta: { requiresAuth: true },
  },
  {
    path: "/goals", // Add this entry
    name: "Goals",
    // Lazy load the component (ensure the file exists at this path)
    component: () => import("@/views/Goals.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/add-transaction",
    name: "AddTransaction",
    component: () => import("@/views/AddTransaction.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

function getCurrentUser() {
  if (!auth) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject,
    );
  });
}

router.beforeEach(async (to, from, next) => {
  const user = await getCurrentUser();
  const isVerifiedUser = Boolean(user?.emailVerified);
  const authPages = ["/login", "/register"];

  if (to.path === "/") {
    next(isVerifiedUser ? "/dashboard" : "/login");
    return;
  }

  if (to.meta.requiresAuth && !isVerifiedUser) {
    next("/login");
    return;
  }

  if (authPages.includes(to.path) && isVerifiedUser) {
    next("/dashboard");
    return;
  }

  next();
});

export default router;
