#!/bin/bash

#
# Deploy the CloudFormation template
#

#
# Add the state machine JSON file to the CloudFormation template
#
# Ideally AWS will allow a CloudFormation template to reference an external 
# state machine the same way it can reference external lambdas.  But until 
# then we're using this python script.
#
inject_state_machine='python3 cloudformation/inject_state_machine_cfn.py -s state_machine/state_machine.json -c cloudformation/deployment_template.yaml -o cloudformation/deployment_template.provisional.yaml'

#
# Upload the local assets that the template references up to a bucket, and
# generate a new template file whose Lambda CodeUri values point to the actual
# S3 locations of the lambda source code
#
package='aws cloudformation package --template-file cloudformation/deployment_template.provisional.yaml --output-template-file cloudformation/deployment_template.final.yaml --s3-bucket cloudformationdeploysource'

#
# Deploy the stack
#
# Take the twice-processed template and use it to deploy the stack
#
deploy='aws cloudformation deploy --template-file cloudformation/deployment_template.final.yaml --stack-name TacocatGallery --capabilities CAPABILITY_IAM'

#
# Execute each of the above commands, and go on to the next one if it succeeds
#
$inject_state_machine && $package && $deploy