import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { TableViewer } from "cdk-dynamo-table-viewer";
import { HitCounter } from "./hitcounter";

export class HelloCdkStack extends cdk.Stack {
  public readonly hcViewerUrl: cdk.CfnOutput;
  public readonly hcEndpoint: cdk.CfnOutput;
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

    const tableView = new TableViewer(this, "HitsViewer", {
      table: helloWithCounter.table,
      title: "Hits",
      sortBy: "-hits",
    });

    this.hcViewerUrl = new cdk.CfnOutput(this, "TableViewerUrl", {
      value: tableView.endpoint,
    });

    const gateway = new apigw.LambdaRestApi(this, "EndPoint", {
      handler: helloWithCounter.handler,
    });

    this.hcEndpoint = new cdk.CfnOutput(this, "GatewayUrl", {
      value: gateway.url,
    });
  }
}
