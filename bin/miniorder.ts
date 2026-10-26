import { App } from "aws-cdk-lib";
import { MiniOrderStack } from "../lib/miniorder-stack.js";

const app = new App();
const account = process.env.CDK_DEFAULT_ACCOUNT;

new MiniOrderStack(app, "MiniOrderHealthStack", {
  env: {
    region: "ap-southeast-2",
    ...(account ? { account } : {}),
  },
});