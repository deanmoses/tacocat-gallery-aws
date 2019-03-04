#!/bin/bash

#
# Deploy the CloudFormation stack
#

#
# Add state machine JSON file to CloudFormation template
#
# Ideally AWS would allow a CloudFormation template to reference an external 
# state machine the same way it can reference external lambdas.  But until 
# then we're using this python script.
#
echo "Adding state machine to CloudFormation template"
python3 cloudformation/inject_state_machine_cfn.py -s state_machine/state_machine.json -c cloudformation/stack.yaml -o cloudformation/stack.provisional.yaml

#
# Upload the local assets that the template references up to a bucket, and
# generate a new template file whose Lambda CodeUri values point to the actual
# S3 locations of the lambda source code
#
echo "Packaging the stack"
aws cloudformation package --template-file cloudformation/stack.provisional.yaml --output-template-file cloudformation/stack.final.yaml --s3-bucket cloudformationdeploysource

#
# Deploy the stack
#
# Take the twice-processed template and use it to deploy the stack
#
echo "Deploying the stack"
aws cloudformation deploy --template-file cloudformation/stack.final.yaml --stack-name TacocatGallery --capabilities CAPABILITY_IAM --s3-bucket cloudformationdeploysource