export interface Config {
  Region: string;
  S3PhotoRepoBucket: string;
  DDBImageMetadataTable: string;
  DDBAlbumMetadataTable: string;
  DescribeExecutionLambda: string;
  CognitoIdentityPool: string;
}

export const CONFIG: Config = {
  DDBAlbumMetadataTable : "TacocatGallery-AlbumMetadataDDBTable-NOZGIWFCNOA7",
  CognitoIdentityPool : "us-west-2:68019e04-d22f-45a0-a734-0253412e01ea",
  Region : "us-west-2",   // might be replaced if you launched the template in a different region
  DDBImageMetadataTable : "TacocatGallery-ImageMetadataDDBTable-7D9L2YR364J2",
  S3PhotoRepoBucket : "tacocatgallery-photorepos3bucket-1f6z29csd2zpl",
  DescribeExecutionLambda : "TacocatGallery-DescribeExecutionFunction-ZAE28392DTEV"
};