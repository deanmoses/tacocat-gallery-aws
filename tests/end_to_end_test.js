const fs = require('fs');
const path = require('path');
const AWS = require("aws-sdk");
const credentials = new AWS.SharedIniFileCredentials({profile: 'gallery-automated-test'});
AWS.config.credentials = credentials;
AWS.config.update({region:'us-west-2'});

const cloudformation = new AWS.CloudFormation();
const s3 = new AWS.S3();

cloudformation.describeStacks({StackName: 'TacocatGallery'}, function(err, data) {
  if (err) console.log(err, err.stack);
  else {
    //console.log(data.Stacks[0].Outputs);
    const stack = data.Stacks[0];
    const accessKey = getOutputValue(stack, "TestUserAccessKey");
    const secretKey = getOutputValue(stack, "TestUserSecretKey");
    const originalImageBucketName = getOutputValue(stack, "S3PhotoRepoBucket");
    const derivedImageBucketName = getOutputValue(stack, "DerivedImageS3Bucket");
    const apiUrl = getOutputValue(stack, "ApiUrl");
    const originalImagePrefix = getOutputValue(stack, "OriginalImagePrefix");
    const thumbnailImagePrefix = getOutputValue(stack, "ThumbnailImagePrefix");
    const largeImagePrefix = getOutputValue(stack, "LargeImagePrefix");

    console.log("Test User Key and Secret", accessKey, secretKey);
    console.log("API URL", apiUrl);
    console.log("Original images", originalImageBucketName, originalImagePrefix);
    console.log("Thumbnail images", derivedImageBucketName, thumbnailImagePrefix);
    console.log("Large images", derivedImageBucketName, largeImagePrefix);

    const filename = "test_image_1.jpg";
    const filepath = path.join(__dirname, filename);
    const stream = fs.createReadStream(filepath);
    const params = {Bucket: originalImageBucketName, Key: originalImagePrefix + "/2001/01-31/test_image_1.jpg", Body: stream};
    s3.upload(params, function(err, data) {
      if (err) throw err;
      console.log(err, data);
    });
  }
});

/**
 * Return the value of the specified stack output
 * @param {*} stack 
 * @param {*} outputKey 
 */
function getOutputValue(stack, outputKey) {
  const found = stack.Outputs.find(function(element) {
    return element.OutputKey.indexOf(outputKey) >= 0;
  });
  if (!found) throw "Did not find output with key of: " + outputKey;
  return found.OutputValue;
}