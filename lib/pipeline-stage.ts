import { CfnOutput, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { HelloCdkStack } from "./hello-cdk-stack";

export class WorkshopPipelineStage extends Stage {
  public readonly hcViewerUrl: CfnOutput;
  public readonly hcEndpoint: CfnOutput;
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new HelloCdkStack(this, "WebService");
    this.hcViewerUrl = service.hcViewerUrl;
    this.hcEndpoint = service.hcEndpoint;
  }
}
