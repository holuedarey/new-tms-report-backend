import { Request } from "express"
export { };
declare module "express" {
  export interface Request {
    user?: any
  }
}