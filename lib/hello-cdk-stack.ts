import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import * as tableViewer from "cdk-dynamo-table-viewer";
import { HitCounter } from "./hitcounter";

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hello = new lambda.Function(this, "HelloHandler", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "hello.handler",
    });

    const helloWithCounter = new HitCounter(this, "HelloHitCounter", {
      downstream: hello,
    });

    new tableViewer.TableViewer(this, "HitsViewer", {
      table: helloWithCounter.table,
      title: "Hits",
      sortBy: "hits",
    });

    new apigw.LambdaRestApi(this, "EndPoint", {
      handler: helloWithCounter.handler,
    });
  }
}
