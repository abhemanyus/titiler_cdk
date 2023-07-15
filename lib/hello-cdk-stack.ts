import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { TitilerCluster } from "./ecs-construct-stack";

export class HelloCdkStack extends cdk.Stack {
  public readonly titilerUrl: cdk.CfnOutput;
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const cluster = new TitilerCluster(this, "TitilerCluster");
    this.titilerUrl = new cdk.CfnOutput(this, "TitilerUrl", {
      value: cluster.balancer.loadBalancerDnsName,
    });
  }
}
