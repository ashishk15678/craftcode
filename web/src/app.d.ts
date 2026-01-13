import type { User } from "@prisma/client";

// See https://kit.svelte.dev/docs/types#app
declare global {
  namespace App {
    interface Locals {
      user: User | null;
    }
    interface PageData {
      user?: User | null;
    }
  }
}

export {};
