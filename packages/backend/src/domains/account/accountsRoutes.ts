import type { RouteRegistrar, Router } from "../../api/types.js";
import { listAccounts, getAccount, createAccount } from "./accountController.js";

export const registerAccountsRoutes: RouteRegistrar = (router: Router) => {
  router.route("GET", "/api/accounts", listAccounts);
  router.route("GET", "/api/accounts/:id", getAccount as any);
  router.route("POST", "/api/accounts", createAccount);
};
