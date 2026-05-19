/**
 * AWS Bedrock Setup Verification Script
 *
 * @author RAJ SHAH
 * @description Validates AWS credentials and Bedrock connectivity
 */

require('dotenv').config();
const { BedrockClient, ListFoundationModelsCommand } = require('@aws-sdk/client-bedrock');

async function verifySetup() {
  console.log('='.repeat(50));
  console.log('🔍 AWS Bedrock Setup Verification');
  console.log('='.repeat(50));

  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.error('❌ ERROR: AWS credentials missing in .env file!');
    process.exit(1);
  }

  console.log(`📍 Region: ${region}`);
  console.log(`🔑 Access Key ID: ${accessKeyId.substring(0, 5)}...${accessKeyId.substring(accessKeyId.length - 4)}`);

  const client = new BedrockClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });

  try {
    console.log('\n📡 Connecting to AWS Bedrock...');
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);

    console.log('✅ Connection Successful!');
    console.log(`📊 Found ${response.modelSummaries.length} available foundation models.`);

    // Sample models
    console.log('\n🤖 Sample Models:');
    response.modelSummaries.slice(0, 5).forEach(m => {
      console.log(`  • ${m.modelName} (${m.modelId})`);
    });

    console.log('\n✨ Setup is correct and ready for use!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\n❌ Connection Failed!');
    console.error(`Error: ${error.message}`);

    if (error.message.includes('credentials')) {
      console.log('💡 Tip: Verify your AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    } else if (error.message.includes('region')) {
      console.log('💡 Tip: Verify your AWS_REGION (e.g., us-east-1).');
    }

    console.log('='.repeat(50));
    process.exit(1);
  }
}

verifySetup();
