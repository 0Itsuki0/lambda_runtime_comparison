import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { join } from "path";
import { Effect, PolicyStatement, } from 'aws-cdk-lib/aws-iam';
import { Stack, StackProps } from "aws-cdk-lib";
import { Runtime, Function, Code, Tracing, FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { RustFunction } from 'cargo-lambda-cdk';
import { LlrtFunction } from 'cdk-lambda-llrt';


export class LambdaColdstartStack extends cdk.Stack {
    private nodeLambda: NodejsFunction;
    private rustLambda: RustFunction;
    private pythonLambda: Function;
    private llrtLambda: LlrtFunction;


    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        this.buildNodeLambda()
        this.buildRustLambda()
        this.buildPythonLambda()
        this.buildLlrtLambda()
    }

    private buildNodeLambda() {
        this.nodeLambda = new NodejsFunction(this, "LambdaColdStartNode", {
            runtime: Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(20),
            entry: "lambdas/node_lambda/handler.ts",
            handler: "handler",
            tracing: Tracing.ACTIVE
        });
        this.nodeLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:*',
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources: ['*'],
            })
        );
        this.nodeLambda.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });
        this.nodeLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)

    }

    private buildRustLambda() {
        this.rustLambda = new RustFunction(this, 'LambdaColdStartRust', {
            // Path to the root directory.
            manifestPath: "lambdas/rust_lambda",
            tracing: Tracing.ACTIVE
        });

        this.rustLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:*',
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources: ['*'],
            })
        );
        this.rustLambda.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        this.rustLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    }

    private buildPythonLambda() {
        this.pythonLambda = new Function(this, 'LambdaColdStartPython', {
            code: Code.fromAsset(
                "lambdas/python_lambda"
            ),
            handler: 'handler.lambda_handler',
            runtime: Runtime.PYTHON_3_12,
            tracing: Tracing.ACTIVE

        })

        this.pythonLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:*',
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources: ['*'],
            })
        );
        this.pythonLambda.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });

        this.pythonLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    }

    private buildLlrtLambda() {
        this.llrtLambda = new LlrtFunction(this, 'LambdaColdStartLlrt', {
            entry: "lambdas/llrt_lambda/handler.ts",
            handler: "handler",
            tracing: Tracing.ACTIVE

        });

        this.llrtLambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: [
                    'dynamodb:*',
                    "xray:PutTraceSegments",
                    "xray:PutTelemetryRecords"
                ],
                resources: ['*'],
            })
        );
        this.llrtLambda.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE,
        });
        this.llrtLambda.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY)
    }

}
