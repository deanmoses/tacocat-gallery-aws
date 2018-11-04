#!/bin/bash

#
# Delete the stack
# 
# Deletes regardless of whether it's deployed, failed to deploy, or any other state
#
aws cloudformation delete-stack --stack-name TacocatGallery