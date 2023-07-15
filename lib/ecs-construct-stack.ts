import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  ApplicationLoadBalancer,
  ApplicationProtocol,
  Protocol,
} from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
// import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

const TITILER_IMAGE =
"ghcr.io/developmentseed/titiler@sha256:45565498b88d5b77360014ab9dd217c17617ae59d308769f67c24e7540a78d02";
// const TITILER_IMAGE = "amazon/amazon-ecs-sample";
// const CERTIFICATE_ARN =
"arn:aws:acm:ap-south-1:543620115200:certificate/d24695b7-936e-47eb-b435-d93b5d6c4ef1";

export class TitilerCluster extends Construct {
  public readonly balancer: ApplicationLoadBalancer;
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const vpc = ec2.Vpc.fromLookup(this, "Vpc", {
      isDefault: true,
    });

    const cluster = new ecs.Cluster(this, "EcsCluster", {
      vpc: vpc,
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
            PORT: "80",
            WORKERS_PER_CORE: "1",
            MAX_WORKERS: "1",
          },
          containerName: "titiler",
          containerPort: 80,
          enableLogging: true,
          logDriver: ecs.LogDrivers.awsLogs({
            streamPrefix: id,
            logRetention: RetentionDays.ONE_WEEK,
          }),
        },
        memoryLimitMiB: 2048,
        publicLoadBalancer: true,
        listenerPort: 80,
        runtimePlatform: {
          operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
          cpuArchitecture: ecs.CpuArchitecture.X86_64,
        },
        capacityProviderStrategies: [
          {
            capacityProvider: "FARGATE",
            weight: 1,
          },
        ],
        // domainName: "cdk-cog.kesowa.com",
        // protocol: ApplicationProtocol.HTTP,
        // certificate: Certificate.fromCertificateArn(
        //   this,
        //   "Certificate",
        //   CERTIFICATE_ARN,
        // ),
      },
    );
    ecsFargate.targetGroup.configureHealthCheck({
      path: "/healthz",
      // protocol: Protocol.HTTP,
      // enabled: true,
      // timeout: cdk.Duration.seconds(20),
      // interval: cdk.Duration.seconds(40),
      // unhealthyThresholdCount: 4,
    });
    ecsFargate.service.connections.allowToAnyIpv4(
      new ec2.Port({
        protocol: ec2.Protocol.ALL,
        stringRepresentation: "All port 80",
        fromPort: 80,
      }),
      "Allows traffic on port 80 from ALB",
    );
    this.balancer = ecsFargate.loadBalancer;
  }
}
