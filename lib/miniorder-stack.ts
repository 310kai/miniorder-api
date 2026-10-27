
import {
  Stack,
  Duration,
  CfnOutput,
} from "aws-cdk-lib";

import type { StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import {
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

export class MiniOrderStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const healthFunction = new NodejsFunction(
      this,
      "MiniOrderHealthFunction",
      {
        entry: "src/lambda/fastify.ts",
        handler: "handler",
        runtime: Runtime.NODEJS_24_X,
        memorySize: 128,
        timeout: Duration.seconds(5),
      }
    );

    const api = new HttpApi(this, "MiniOrderApi", {
      apiName: "miniorder-api",
    });

    api.addRoutes({
      path: "/health",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "HealthIntegration",
        healthFunction
      ),
    });

    new CfnOutput(this, "HealthApiUrl", {
      value: `${api.apiEndpoint}/health`,
    });
  }
}
