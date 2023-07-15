import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

const TITILER_IMAGE =
  "ghcr.io/developmentseed/titiler@sha256:45565498b88d5b77360014ab9dd217c17617ae59d308769f67c24e7540a78d02";
const CERTIFICATE_ARN =
  "arn:aws:acm:ap-south-1:543620115200:certificate/d24695b7-936e-47eb-b435-d93b5d6c4ef1";

export interface TitilerClusterProps {
}

export class TitilerCluster extends Construct {
  public readonly balancer: ApplicationLoadBalancer;
  constructor(scope: Construct, id: string, props?: TitilerClusterProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: ec2.Vpc.fromLookup(this, "Vpc", {
        isDefault: true,
      }),
    });

    const ecsFargate = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "EcsFargateService",
      {
        cluster: cluster,
        cpu: 512,
        desiredCount: 1,
        taskImageOptions: {
          image: ecs.ContainerImage.fromRegistry(TITILER_IMAGE),
          environment: {
            PORT: "8000",
            WORKERS_PER_CORE: "1",
          },
          containerPort: 8000,
        },
        memoryLimitMiB: 2048,
        publicLoadBalancer: true,
        // domainName: "cdk-cog.kesowa.com",
        // protocol: ApplicationProtocol.HTTPS,
        // certificate: Certificate.fromCertificateArn(
        //   this,
        //   "Certificate",
        //   CERTIFICATE_ARN,
        // ),
      },
    );
    this.balancer = ecsFargate.loadBalancer;
  }
}
