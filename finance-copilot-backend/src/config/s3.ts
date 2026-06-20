import AWS from 'aws-sdk';
import { config } from './index';

// Check if credentials are mock or real
const isMock = !config.aws.accessKeyId || config.aws.accessKeyId.includes('mock');

const s3 = isMock
  ? null
  : new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  if (isMock || !s3) {
    // Mock storage simulation: return local mock URI
    console.log(`[S3 Mock Upload] File upload simulated: ${fileName}`);
    return `https://s3.${config.aws.region}.amazonaws.com/${config.aws.bucketName}/mock_${Date.now()}_${fileName}`;
  }

  const params = {
    Bucket: config.aws.bucketName,
    Key: `${Date.now()}_${fileName}`,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  try {
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location;
  } catch (error: any) {
    console.error('S3 Upload Error:', error);
    throw new Error(`AWS S3 Upload Failed: ${error.message}`);
  }
};
